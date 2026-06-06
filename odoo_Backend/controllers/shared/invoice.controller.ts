import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../../models/invoice/invoice.service.js';
import { PurchaseOrderService } from '../../models/purchaseOrder/purchaseOrder.service.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { PaginationHelper } from '../../helpers/pagination.helper.js';
import { HTTP_STATUS, INVOICE_MESSAGES, PO_MESSAGES } from '../../constants/json/status.js';
import { AppError } from '../../utils/appError.js';
import { ActivityLogService } from '../../models/activityLog/activityLog.service.js';
import { NotificationService } from '../../models/notification/notification.service.js';
import { VendorService } from '../../models/vendor/vendor.service.js';
import { UserModel } from '../../models/user/user.model.js';
import { PDFService } from '../../services/pdf.service.js';
import { EmailHelper } from '../../helpers/email.helper.js';
import { config } from '../../config/environment.js';
import axios from 'axios';
import { CloudinaryService } from '../../services/cloudinary.service.js';
import { InvoiceModel } from '../../models/invoice/invoice.model.js';
import { ROLES } from '../../constants/json/types.js';

export class InvoiceController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { poId, taxRate, dueDate } = req.body;

      const po = await PurchaseOrderService.findRaw(poId);
      if (!po) return next(new AppError(PO_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));

      const effectiveTaxRate = taxRate ?? config.TAX_RATE ?? 18;
      const subtotal = po.subtotal;
      const tax = parseFloat(((subtotal * effectiveTaxRate) / 100).toFixed(2));
      const total = parseFloat((subtotal + tax).toFixed(2));
      const invoiceDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const invoice = await InvoiceService.create({
        poId: po._id as any,
        vendorId: po.vendorId,
        items: po.items.map((i) => ({
          productName: i.productName,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          totalPrice: i.totalPrice,
        })),
        subtotal,
        taxRate: effectiveTaxRate,
        tax,
        total,
        dueDate: invoiceDueDate,
        status: 'Draft',
      });
 
      // Generate and upload PDF to Cloudinary
      try {
        const populatedInvoice = await InvoiceService.findById(invoice._id.toString());
        if (populatedInvoice) {
          const pdfBuffer = await PDFService.generateInvoice(populatedInvoice);
          const remoteUrl = await CloudinaryService.uploadBuffer(pdfBuffer, `${invoice.invoiceNumber}.pdf`);
          invoice.pdfUrl = remoteUrl;
          await InvoiceModel.findByIdAndUpdate(invoice._id, { pdfUrl: remoteUrl });
        }
      } catch (uploadError) {
        // Ignore upload error but log it (non-blocking for database save)
      }

       await ActivityLogService.log({
         userId: req.user?.id,
         action: 'INVOICE_GENERATED',
         entityType: 'Invoice',
         entityId: invoice._id?.toString(),
         description: `Invoice generated: ${invoice.invoiceNumber}`,
         req,
       });

       // Notify vendor
       const vendorDoc = await VendorService.findById(po.vendorId.toString());
       if (vendorDoc) {
         const vendorUser = await UserModel.findOne({ email: vendorDoc.email, isDeleted: false }).exec();
         if (vendorUser) {
           await NotificationService.create({
             recipientId: vendorUser._id!,
             title: 'Invoice Generated',
             message: `Invoice (${invoice.invoiceNumber}) has been generated for PO: ${po.poNumber}.`,
             type: 'INVOICE',
             relatedId: invoice._id,
           });
         }
       }

       ResponseFormatter.send(res, HTTP_STATUS.CREATED, INVOICE_MESSAGES.CREATED, invoice);
     } catch (error) {
       next(error);
     }
   }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await InvoiceService.findById(req.params.id);
      if (!invoice) return next(new AppError(INVOICE_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      ResponseFormatter.send(res, HTTP_STATUS.OK, INVOICE_MESSAGES.FETCHED, invoice);
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const filter: Record<string, any> = {};
      if (status) filter.status = status;

      const role = req.user?.role;
      if (role === ROLES.VENDOR) {
        const vendor = await VendorService.list({ email: req.user!.email }, { page: 1, limit: 1 });
        if (vendor.docs.length > 0) {
          filter.vendorId = vendor.docs[0]._id;
        } else {
          ResponseFormatter.send(res, HTTP_STATUS.OK, INVOICE_MESSAGES.FETCHED, PaginationHelper.mapResult([], 0, { page: 1, limit: 10 }));
          return;
        }
      }

      const options = { page: Number(page), limit: Number(limit) };
      const { docs, total } = await InvoiceService.list(filter, options);
      ResponseFormatter.send(res, HTTP_STATUS.OK, INVOICE_MESSAGES.FETCHED, PaginationHelper.mapResult(docs, total, options));
    } catch (error) {
      next(error);
    }
  }

  public static async downloadPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await InvoiceService.findById(req.params.id);
      if (!invoice) return next(new AppError(INVOICE_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));

      let pdfBuffer: Buffer;
      if (invoice.pdfUrl) {
        try {
          const response = await axios.get(invoice.pdfUrl, { responseType: 'arraybuffer', timeout: 5000 });
          pdfBuffer = Buffer.from(response.data);
        } catch (err) {
          pdfBuffer = await PDFService.generateInvoice(invoice);
        }
      } else {
        pdfBuffer = await PDFService.generateInvoice(invoice);
      }

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(invoice as any).invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  public static async sendEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await InvoiceService.findById(req.params.id);
      if (!invoice) return next(new AppError(INVOICE_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));

      let pdfBuffer: Buffer;
      if (invoice.pdfUrl) {
        try {
          const response = await axios.get(invoice.pdfUrl, { responseType: 'arraybuffer', timeout: 5000 });
          pdfBuffer = Buffer.from(response.data);
        } catch (err) {
          pdfBuffer = await PDFService.generateInvoice(invoice);
        }
      } else {
        pdfBuffer = await PDFService.generateInvoice(invoice);
      }

      const vendor = (invoice as any).vendorId;
      const vendorEmail = typeof vendor === 'object' ? vendor.email : '';

      await EmailHelper.sendMail({
        to: vendorEmail,
        subject: `Invoice - ${(invoice as any).invoiceNumber}`,
        html: `<p>Please find attached your Invoice <strong>${(invoice as any).invoiceNumber}</strong>.</p>`,
        attachments: [{ filename: `${(invoice as any).invoiceNumber}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
      });

      await InvoiceService.updateStatus(req.params.id, 'Sent');
      ResponseFormatter.send(res, HTTP_STATUS.OK, INVOICE_MESSAGES.EMAIL_SENT);
    } catch (error) {
      next(error);
    }
  }

  public static async markPaid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await InvoiceService.updateStatus(req.params.id, 'Paid');
      if (!invoice) return next(new AppError(INVOICE_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      await ActivityLogService.log({
        userId: req.user?.id,
        action: 'INVOICE_PAID',
        entityType: 'Invoice',
        entityId: invoice._id?.toString(),
        description: `Invoice marked as paid: ${invoice.invoiceNumber}`,
        req,
      });
      ResponseFormatter.send(res, HTTP_STATUS.OK, INVOICE_MESSAGES.MARKED_PAID, invoice);
    } catch (error) {
      next(error);
    }
  }
}

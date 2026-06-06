import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { PurchaseOrderService } from '../../models/purchaseOrder/purchaseOrder.service.js';
import { ApprovalService } from '../../models/approval/approval.service.js';
import { QuotationService } from '../../models/quotation/quotation.service.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { PaginationHelper } from '../../helpers/pagination.helper.js';
import { HTTP_STATUS, PO_MESSAGES, QUOTATION_MESSAGES } from '../../constants/json/status.js';
import { AppError } from '../../utils/appError.js';
import { ActivityLogService } from '../../models/activityLog/activityLog.service.js';
import { NotificationService } from '../../models/notification/notification.service.js';
import { VendorService } from '../../models/vendor/vendor.service.js';
import { UserModel } from '../../models/user/user.model.js';
import { PDFService } from '../../services/pdf.service.js';
import { EmailHelper } from '../../helpers/email.helper.js';
import { config } from '../../config/environment.js';
import { CloudinaryService } from '../../services/cloudinary.service.js';
import { PurchaseOrderModel } from '../../models/purchaseOrder/purchaseOrder.model.js';
import { ROLES } from '../../constants/json/types.js';

export class PurchaseOrderController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quotationId, taxRate } = req.body;

      const quotation = await QuotationService.findRaw(quotationId);
      if (!quotation) return next(new AppError(QUOTATION_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));

      const approval = await ApprovalService.findByQuotation(quotationId);
      if (!approval || approval.status !== 'Approved') {
        return next(new AppError(PO_MESSAGES.NOT_APPROVED, HTTP_STATUS.BAD_REQUEST));
      }

      const effectiveTaxRate = taxRate ?? config.TAX_RATE ?? 18;
      const subtotal = quotation.pricing.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = parseFloat(((subtotal * effectiveTaxRate) / 100).toFixed(2));
      const total = parseFloat((subtotal + tax).toFixed(2));

      const po = await PurchaseOrderService.create({
        vendorId: quotation.vendorId,
        rfqId: quotation.rfqId,
        quotationId: quotation._id as any,
        approvalId: approval._id as any,
        items: quotation.pricing.map((p) => ({
          productName: p.productName,
          unitPrice: p.unitPrice,
          quantity: p.quantity,
          totalPrice: p.totalPrice,
        })),
        subtotal,
        taxRate: effectiveTaxRate,
        tax,
        total,
        status: 'Generated',
      });
 
      // Generate and upload PDF to Cloudinary
      try {
        const populatedPO = await PurchaseOrderService.findById(po._id.toString());
        if (populatedPO) {
          const pdfBuffer = await PDFService.generatePO(populatedPO);
          const remoteUrl = await CloudinaryService.uploadBuffer(pdfBuffer, `PO-${po.poNumber}.pdf`);
          po.pdfUrl = remoteUrl;
          await PurchaseOrderModel.findByIdAndUpdate(po._id, { pdfUrl: remoteUrl });
        }
      } catch (uploadError) {
        // Ignore upload error but log it (non-blocking for database save)
      }

       await ActivityLogService.log({
         userId: req.user?.id,
         action: 'PO_GENERATED',
         entityType: 'PurchaseOrder',
         entityId: po._id?.toString(),
         description: `PO generated: ${po.poNumber}`,
         req,
       });

       // Notify vendor
       const vendorDoc = await VendorService.findById(quotation.vendorId.toString());
       if (vendorDoc) {
         const vendorUser = await UserModel.findOne({ email: vendorDoc.email, isDeleted: false }).exec();
         if (vendorUser) {
           await NotificationService.create({
             recipientId: vendorUser._id!,
             title: 'Purchase Order Generated',
             message: `A Purchase Order (${po.poNumber}) has been generated for your quotation.`,
             type: 'PO',
             relatedId: po._id,
           });
         }
       }

       ResponseFormatter.send(res, HTTP_STATUS.CREATED, PO_MESSAGES.CREATED, po);
     } catch (error) {
       next(error);
     }
   }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const po = await PurchaseOrderService.findById(req.params.id);
      if (!po) return next(new AppError(PO_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      ResponseFormatter.send(res, HTTP_STATUS.OK, PO_MESSAGES.FETCHED, po);
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
          ResponseFormatter.send(res, HTTP_STATUS.OK, PO_MESSAGES.FETCHED, PaginationHelper.mapResult([], 0, { page: 1, limit: 10 }));
          return;
        }
      }

      const options = { page: Number(page), limit: Number(limit) };
      const { docs, total } = await PurchaseOrderService.list(filter, options);
      ResponseFormatter.send(res, HTTP_STATUS.OK, PO_MESSAGES.FETCHED, PaginationHelper.mapResult(docs, total, options));
    } catch (error) {
      next(error);
    }
  }

  public static async downloadPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const po = await PurchaseOrderService.findById(req.params.id);
      if (!po) return next(new AppError(PO_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));

      let pdfBuffer: Buffer;
      if (po.pdfUrl) {
        try {
          const response = await axios.get(po.pdfUrl, { responseType: 'arraybuffer', timeout: 5000 });
          pdfBuffer = Buffer.from(response.data);
        } catch (err) {
          pdfBuffer = await PDFService.generatePO(po);
        }
      } else {
        pdfBuffer = await PDFService.generatePO(po);
      }

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PO-${(po as any).poNumber}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  public static async sendEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const po = await PurchaseOrderService.findById(req.params.id);
      if (!po) return next(new AppError(PO_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));

      let pdfBuffer: Buffer;
      if (po.pdfUrl) {
        try {
          const response = await axios.get(po.pdfUrl, { responseType: 'arraybuffer', timeout: 5000 });
          pdfBuffer = Buffer.from(response.data);
        } catch (err) {
          pdfBuffer = await PDFService.generatePO(po);
        }
      } else {
        pdfBuffer = await PDFService.generatePO(po);
      }

      const vendor = (po as any).vendorId;
      const vendorEmail = typeof vendor === 'object' ? vendor.email : '';

      await EmailHelper.sendMail({
        to: vendorEmail,
        subject: `Purchase Order - ${(po as any).poNumber}`,
        html: `<p>Please find attached your Purchase Order <strong>${(po as any).poNumber}</strong>.</p>`,
        attachments: [{ filename: `${(po as any).poNumber}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
      });

      await PurchaseOrderService.updateStatus(req.params.id, 'Sent');
      ResponseFormatter.send(res, HTTP_STATUS.OK, PO_MESSAGES.EMAIL_SENT);
    } catch (error) {
      next(error);
    }
  }
}

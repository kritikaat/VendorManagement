import { Request, Response, NextFunction } from 'express';
import { ApprovalService } from '../../models/approval/approval.service.js';
import { QuotationService } from '../../models/quotation/quotation.service.js';
import { RFQService } from '../../models/rfq/rfq.service.js';
import { PurchaseOrderService } from '../../models/purchaseOrder/purchaseOrder.service.js';
import { InvoiceService } from '../../models/invoice/invoice.service.js';
import { VendorService } from '../../models/vendor/vendor.service.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { PaginationHelper } from '../../helpers/pagination.helper.js';
import { HTTP_STATUS, APPROVAL_MESSAGES } from '../../constants/json/status.js';
import { AppError } from '../../utils/appError.js';
import { ActivityLogService } from '../../models/activityLog/activityLog.service.js';
import { NotificationService } from '../../models/notification/notification.service.js';
import { UserModel } from '../../models/user/user.model.js';
import { PurchaseOrderModel } from '../../models/purchaseOrder/purchaseOrder.model.js';
import { InvoiceModel } from '../../models/invoice/invoice.model.js';
import { PDFService } from '../../services/pdf.service.js';
import { CloudinaryService } from '../../services/cloudinary.service.js';
import { config } from '../../config/environment.js';
import { ROLES } from '../../constants/json/types.js';

export class ApprovalController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { rfqId, quotationId } = req.body;

      const rfq = await RFQService.findRaw(rfqId);
      if (!rfq) return next(new AppError('RFQ not found.', HTTP_STATUS.NOT_FOUND));

      const quotation = await QuotationService.findRaw(quotationId);
      if (!quotation || quotation.status !== 'Submitted') {
        return next(new AppError('Quotation not found or not submitted.', HTTP_STATUS.BAD_REQUEST));
      }

      const approval = await ApprovalService.create({
        rfqId: rfq._id as any,
        quotationId: quotation._id as any,
        requestedBy: req.user!.id as any,
        status: 'Pending',
      });

      await ActivityLogService.log({
        userId: req.user?.id,
        action: 'APPROVAL_CREATED',
        entityType: 'Approval',
        entityId: approval._id?.toString(),
        description: `Approval request created for RFQ: ${rfq.title}`,
        req,
      });

      // Notify managers
      const managers = await UserModel.find({ role: { $in: [ROLES.MANAGER, ROLES.ADMIN] }, isDeleted: false }).exec();
      for (const manager of managers) {
        await NotificationService.create({
          recipientId: manager._id!,
          title: 'Approval Request',
          message: `A new approval request has been submitted for RFQ: ${rfq.title}`,
          type: 'APPROVAL',
          relatedId: approval._id,
        });
      }

      ResponseFormatter.send(res, HTTP_STATUS.CREATED, APPROVAL_MESSAGES.CREATED, approval);
    } catch (error) {
      next(error);
    }
  }

  public static async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await ApprovalService.findRaw(req.params.id);
      if (!existing) return next(new AppError(APPROVAL_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      if (existing.status !== 'Pending') {
        return next(new AppError(APPROVAL_MESSAGES.IMMUTABLE, HTTP_STATUS.BAD_REQUEST));
      }

      const approval = await ApprovalService.approve(req.params.id, req.user!.id, req.body.remarks);

      await ActivityLogService.log({
        userId: req.user?.id,
        action: 'APPROVAL_APPROVED',
        entityType: 'Approval',
        entityId: approval!._id?.toString(),
        description: `Approval approved for ${approval!._id}`,
        req,
      });

      // Notify requestor
      await NotificationService.create({
        recipientId: existing.requestedBy,
        title: 'Quotation Approved',
        message: 'Your approval request has been approved. A Purchase Order will be generated automatically.',
        type: 'APPROVAL',
        relatedId: approval!._id,
      });

      // Auto-generate Purchase Order and Invoice
      try {
        const quotation = await QuotationService.findRaw(existing.quotationId.toString());
        if (quotation) {
          const effectiveTaxRate = config.TAX_RATE ?? 18;
          const subtotal = quotation.pricing.reduce((sum, item) => sum + item.totalPrice, 0);
          const tax = parseFloat(((subtotal * effectiveTaxRate) / 100).toFixed(2));
          const total = parseFloat((subtotal + tax).toFixed(2));

          // Create PO
          const po = await PurchaseOrderService.create({
            vendorId: quotation.vendorId,
            rfqId: quotation.rfqId,
            quotationId: quotation._id as any,
            approvalId: approval!._id as any,
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

          // Generate PO PDF
          try {
            const populatedPO = await PurchaseOrderService.findById(po._id.toString());
            if (populatedPO) {
              const pdfBuffer = await PDFService.generatePO(populatedPO);
              const remoteUrl = await CloudinaryService.uploadBuffer(pdfBuffer, `PO-${po.poNumber}.pdf`);
              await PurchaseOrderModel.findByIdAndUpdate(po._id, { pdfUrl: remoteUrl });
            }
          } catch (pdfError) {
            // Non-blocking
          }

          await ActivityLogService.log({
            userId: req.user?.id,
            action: 'PO_GENERATED',
            entityType: 'PurchaseOrder',
            entityId: po._id?.toString(),
            description: `PO auto-generated: ${po.poNumber}`,
            req,
          });

          // Notify vendor about PO
          const vendorDoc = await VendorService.findById(quotation.vendorId.toString());
          let vendorUser: any = null;
          if (vendorDoc) {
            vendorUser = await UserModel.findOne({ email: vendorDoc.email, isDeleted: false }).exec();
            if (vendorUser) {
              await NotificationService.create({
                recipientId: vendorUser._id!,
                title: 'Purchase Order Generated',
                message: `A Purchase Order (${po.poNumber}) has been auto-generated for your approved quotation.`,
                type: 'PO',
                relatedId: po._id,
              });
            }
          }

          // Auto-create Invoice
          const invoiceDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const invoice = await InvoiceService.create({
            poId: po._id as any,
            vendorId: po.vendorId,
            items: po.items.map((i: any) => ({
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

          // Generate Invoice PDF
          try {
            const populatedInvoice = await InvoiceService.findById(invoice._id.toString());
            if (populatedInvoice) {
              const pdfBuffer = await PDFService.generateInvoice(populatedInvoice);
              const remoteUrl = await CloudinaryService.uploadBuffer(pdfBuffer, `${invoice.invoiceNumber}.pdf`);
              await InvoiceModel.findByIdAndUpdate(invoice._id, { pdfUrl: remoteUrl });
            }
          } catch (pdfError) {
            // Non-blocking
          }

          await ActivityLogService.log({
            userId: req.user?.id,
            action: 'INVOICE_GENERATED',
            entityType: 'Invoice',
            entityId: invoice._id?.toString(),
            description: `Invoice auto-generated: ${invoice.invoiceNumber}`,
            req,
          });

          // Notify vendor about Invoice
          if (vendorUser) {
            await NotificationService.create({
              recipientId: vendorUser._id!,
              title: 'Invoice Generated',
              message: `Invoice (${invoice.invoiceNumber}) has been auto-generated for PO: ${po.poNumber}.`,
              type: 'INVOICE',
              relatedId: invoice._id,
            });
          }
        }
      } catch (autoGenError) {
        // Log but don't fail approval if auto-generation fails
        console.error('Auto PO/Invoice generation failed:', autoGenError);
      }

      ResponseFormatter.send(res, HTTP_STATUS.OK, APPROVAL_MESSAGES.APPROVED, approval);
    } catch (error) {
      next(error);
    }
  }

  public static async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await ApprovalService.findRaw(req.params.id);
      if (!existing) return next(new AppError(APPROVAL_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      if (existing.status !== 'Pending') {
        return next(new AppError(APPROVAL_MESSAGES.IMMUTABLE, HTTP_STATUS.BAD_REQUEST));
      }

      const approval = await ApprovalService.reject(req.params.id, req.user!.id, req.body.remarks);

      await ActivityLogService.log({
        userId: req.user?.id,
        action: 'APPROVAL_REJECTED',
        entityType: 'Approval',
        entityId: approval!._id?.toString(),
        description: `Approval rejected: ${req.body.remarks}`,
        req,
      });

      // Notify requestor
      await NotificationService.create({
        recipientId: existing.requestedBy,
        title: 'Quotation Rejected',
        message: `Your approval request has been rejected. Remarks: ${req.body.remarks}`,
        type: 'APPROVAL',
        relatedId: approval!._id,
      });

      ResponseFormatter.send(res, HTTP_STATUS.OK, APPROVAL_MESSAGES.REJECTED, approval);
    } catch (error) {
      next(error);
    }
  }

  public static async getTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const approval = await ApprovalService.findById(req.params.id);
      if (!approval) return next(new AppError(APPROVAL_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      
      // Calculate total cost from quotation pricing
      const approvalObj = approval.toObject ? approval.toObject() : approval;
      if (approvalObj.quotationId && (approvalObj.quotationId as any).pricing) {
        const totalCost = (approvalObj.quotationId as any).pricing.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0);
        (approvalObj.quotationId as any).totalCost = totalCost;
        (approvalObj.quotationId as any).grandTotal = totalCost;
        
        // Extract vendor name and RFQ title for summary
        const vendorId = (approvalObj.quotationId as any).vendorId;
        const rfqId = approvalObj.rfqId;
        
        (approvalObj as any).amount = totalCost;
        (approvalObj as any).vendorName = typeof vendorId === 'object' ? vendorId.companyName : '—';
        (approvalObj as any).rfqTitle = typeof rfqId === 'object' ? rfqId.title : '—';
        (approvalObj as any).deliveryTimeline = (approvalObj.quotationId as any).deliveryTimeline;
      }
      
      ResponseFormatter.send(res, HTTP_STATUS.OK, APPROVAL_MESSAGES.FETCHED, approvalObj);
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const filter: Record<string, any> = {};
      if (status) filter.status = status;
      const options = { page: Number(page), limit: Number(limit) };
      const { docs, total } = await ApprovalService.list(filter, options);
      ResponseFormatter.send(res, HTTP_STATUS.OK, APPROVAL_MESSAGES.FETCHED, PaginationHelper.mapResult(docs, total, options));
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { QuotationService } from '../../models/quotation/quotation.service.js';
import { RFQService } from '../../models/rfq/rfq.service.js';
import { VendorService } from '../../models/vendor/vendor.service.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { PaginationHelper } from '../../helpers/pagination.helper.js';
import { HTTP_STATUS, QUOTATION_MESSAGES, RFQ_MESSAGES, VENDOR_MESSAGES } from '../../constants/json/status.js';
import { AppError } from '../../utils/appError.js';
import { ActivityLogService } from '../../models/activityLog/activityLog.service.js';
import { NotificationService } from '../../models/notification/notification.service.js';
import { UserModel } from '../../models/user/user.model.js';
import { ROLES } from '../../constants/json/types.js';

export class QuotationController {
  public static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { rfqId, pricing, deliveryTimeline, notes } = req.body;

      // Fetch the RFQ
      const rfq = await RFQService.findRaw(rfqId);
      if (!rfq || rfq.isDeleted) {
        return next(new AppError(RFQ_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      }

      // Check deadline
      if (new Date() > rfq.deadline) {
        return next(new AppError(QUOTATION_MESSAGES.DEADLINE_PASSED, HTTP_STATUS.BAD_REQUEST));
      }

      // Find vendor by user email
      const vendorResult = await VendorService.list({ email: req.user!.email }, { page: 1, limit: 1 });
      if (vendorResult.docs.length === 0) {
        return next(new AppError(VENDOR_MESSAGES.NO_LINKED_ACCOUNT_USER, HTTP_STATUS.FORBIDDEN));
      }
      const vendor = vendorResult.docs[0];

      // Check vendor is assigned
      const isAssigned = rfq.assignedVendors.some((v: any) => v.toString() === vendor._id!.toString());
      if (!isAssigned) {
        return next(new AppError(QUOTATION_MESSAGES.NOT_ASSIGNED, HTTP_STATUS.FORBIDDEN));
      }

      // Check duplicate
      const existing = await QuotationService.findOne({ rfqId, vendorId: vendor._id });
      if (existing) {
        return next(new AppError(QUOTATION_MESSAGES.ALREADY_SUBMITTED, HTTP_STATUS.CONFLICT));
      }

      const quotation = await QuotationService.create({
        rfqId: rfq._id as any,
        vendorId: vendor._id as any,
        pricing,
        deliveryTimeline,
        notes: notes || '',
        status: 'Submitted',
        submittedAt: new Date(),
      });

      await ActivityLogService.log({
        userId: req.user?.id,
        action: 'QUOTATION_SUBMITTED',
        entityType: 'Quotation',
        entityId: quotation._id?.toString(),
        description: `Quotation submitted for RFQ: ${rfq.title}`,
        req,
      });

      // Notify procurement officer
      const rfqPopulated = await RFQService.findById(rfqId);
      if (rfqPopulated?.createdBy) {
        await NotificationService.create({
          recipientId: (rfqPopulated.createdBy as any)._id || rfqPopulated.createdBy,
          title: 'New Quotation Received',
          message: `${vendor.companyName} submitted a quotation for RFQ: ${rfq.title}`,
          type: 'RFQ',
          relatedId: quotation._id,
        });
      }

      ResponseFormatter.send(res, HTTP_STATUS.CREATED, QUOTATION_MESSAGES.SUBMITTED, quotation);
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quotation = await QuotationService.findRaw(req.params.id);
      if (!quotation) return next(new AppError(QUOTATION_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      if (quotation.status === 'Withdrawn') {
        return next(new AppError(QUOTATION_MESSAGES.CANNOT_UPDATE_WITHDRAWN, HTTP_STATUS.BAD_REQUEST));
      }

      const rfq = await RFQService.findRaw(quotation.rfqId.toString());
      if (rfq && new Date() > rfq.deadline) {
        return next(new AppError(QUOTATION_MESSAGES.DEADLINE_PASSED, HTTP_STATUS.BAD_REQUEST));
      }

      const updated = await QuotationService.update(req.params.id, req.body);
      await ActivityLogService.log({
        userId: req.user?.id,
        action: 'QUOTATION_UPDATED',
        entityType: 'Quotation',
        entityId: updated!._id?.toString(),
        description: 'Quotation updated',
        req,
      });
      ResponseFormatter.send(res, HTTP_STATUS.OK, QUOTATION_MESSAGES.UPDATED, updated);
    } catch (error) {
      next(error);
    }
  }

  public static async withdraw(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quotation = await QuotationService.withdraw(req.params.id);
      if (!quotation) return next(new AppError(QUOTATION_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      await ActivityLogService.log({
        userId: req.user?.id,
        action: 'QUOTATION_WITHDRAWN',
        entityType: 'Quotation',
        entityId: quotation._id?.toString(),
        description: 'Quotation withdrawn',
        req,
      });
      ResponseFormatter.send(res, HTTP_STATUS.OK, QUOTATION_MESSAGES.WITHDRAWN, quotation);
    } catch (error) {
      next(error);
    }
  }

  public static async getVendorQuotations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorResult = await VendorService.list({ email: req.user!.email }, { page: 1, limit: 1 });
      if (vendorResult.docs.length === 0) {
        return next(new AppError(VENDOR_MESSAGES.NO_LINKED_ACCOUNT, HTTP_STATUS.FORBIDDEN));
      }
      const options = {
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 10),
      };
      const { docs, total } = await QuotationService.listByVendor(vendorResult.docs[0]._id!.toString(), options);
      ResponseFormatter.send(res, HTTP_STATUS.OK, QUOTATION_MESSAGES.FETCHED, PaginationHelper.mapResult(docs, total, options));
    } catch (error) {
      next(error);
    }
  }

  public static async getRFQQuotations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const options = {
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 10),
      };
      const { docs, total } = await QuotationService.listByRFQ(req.params.rfqId, options);
      ResponseFormatter.send(res, HTTP_STATUS.OK, QUOTATION_MESSAGES.FETCHED, PaginationHelper.mapResult(docs, total, options));
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        rfqId: req.query.rfqId as string | undefined,
      };
      const options = {
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 10),
      };
      const { docs, total } = await QuotationService.list(filters, options);
      ResponseFormatter.send(res, HTTP_STATUS.OK, QUOTATION_MESSAGES.FETCHED, PaginationHelper.mapResult(docs, total, options));
    } catch (error) {
      next(error);
    }
  }
}

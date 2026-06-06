import { Request, Response, NextFunction } from 'express';
import { RFQService } from '../../models/rfq/rfq.service.js';
import { VendorService } from '../../models/vendor/vendor.service.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { PaginationHelper } from '../../helpers/pagination.helper.js';
import { HTTP_STATUS, RFQ_MESSAGES } from '../../constants/json/status.js';
import { AppError } from '../../utils/appError.js';
import { ROLES } from '../../constants/json/types.js';
import { ActivityLogService } from '../../models/activityLog/activityLog.service.js';
import { NotificationService } from '../../models/notification/notification.service.js';
import { UserModel } from '../../models/user/user.model.js';
import fs from 'fs';
import { CloudinaryService } from '../../services/cloudinary.service.js';

export class RFQController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rfq = await RFQService.create({ ...req.body, createdBy: req.user!.id });
      await ActivityLogService.log({
        userId: req.user?.id,
        action: 'RFQ_CREATED',
        entityType: 'RFQ',
        entityId: rfq._id?.toString(),
        description: `RFQ created: ${rfq.title}`,
        req,
      });
      ResponseFormatter.send(res, HTTP_STATUS.CREATED, RFQ_MESSAGES.CREATED, rfq);
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, page = 1, limit = 10, sortBy, order } = req.query;
      const filter: Record<string, any> = {};
      if (status) filter.status = status;

      const role = req.user?.role;
      if (role === ROLES.PROCUREMENT_OFFICER) {
        filter.createdBy = req.user!.id;
      } else if (role === ROLES.VENDOR) {
        // Vendors see only their assigned RFQs
        const vendor = await VendorService.list({ email: req.user!.email }, { page: 1, limit: 1 });
        if (vendor.docs.length > 0) {
          filter.assignedVendors = vendor.docs[0]._id;
        } else {
          ResponseFormatter.send(res, HTTP_STATUS.OK, RFQ_MESSAGES.FETCHED, PaginationHelper.mapResult([], 0, { page: 1, limit: 10 }));
          return;
        }
      }

      const options = {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: (order as 'asc' | 'desc') || 'desc',
      };

      const { docs, total } = await RFQService.list(filter, options);
      ResponseFormatter.send(res, HTTP_STATUS.OK, RFQ_MESSAGES.FETCHED, PaginationHelper.mapResult(docs, total, options));
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rfq = await RFQService.findById(req.params.id);
      if (!rfq) return next(new AppError(RFQ_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      ResponseFormatter.send(res, HTTP_STATUS.OK, RFQ_MESSAGES.FETCHED, rfq);
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await RFQService.findRaw(req.params.id);
      if (!existing) return next(new AppError(RFQ_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      if (existing.status === 'Closed' || existing.status === 'Cancelled') {
        return next(new AppError(RFQ_MESSAGES.CANNOT_EDIT, HTTP_STATUS.BAD_REQUEST));
      }
      const rfq = await RFQService.update(req.params.id, req.body);
      await ActivityLogService.log({
        userId: req.user?.id,
        action: 'RFQ_UPDATED',
        entityType: 'RFQ',
        entityId: rfq!._id?.toString(),
        description: `RFQ updated: ${rfq!.title}`,
        req,
      });
      ResponseFormatter.send(res, HTTP_STATUS.OK, RFQ_MESSAGES.UPDATED, rfq);
    } catch (error) {
      next(error);
    }
  }

  public static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rfq = await RFQService.softDelete(req.params.id);
      if (!rfq) return next(new AppError(RFQ_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      await ActivityLogService.log({
        userId: req.user?.id,
        action: 'RFQ_DELETED',
        entityType: 'RFQ',
        entityId: rfq._id?.toString(),
        description: `RFQ deleted: ${rfq.title}`,
        req,
      });
      ResponseFormatter.send(res, HTTP_STATUS.OK, RFQ_MESSAGES.DELETED);
    } catch (error) {
      next(error);
    }
  }

  public static async assignVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await RFQService.findRaw(req.params.id);
      if (!existing) return next(new AppError(RFQ_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));

      const rfq = await RFQService.assignVendors(req.params.id, req.body.vendorIds);

      // Notify assigned vendors — find user accounts for these vendors
      const vendorEmails = await VendorService.list({ _id: { $in: req.body.vendorIds } }, { page: 1, limit: 100 });
      for (const vendor of vendorEmails.docs) {
        const vendorUser = await UserModel.findOne({ email: vendor.email, isDeleted: false }).exec();
        if (vendorUser) {
          await NotificationService.create({
            recipientId: vendorUser._id!,
            title: 'New RFQ Assignment',
            message: `You have been assigned to RFQ: ${existing.title}`,
            type: 'RFQ',
            relatedId: existing._id,
          });
        }
      }

      ResponseFormatter.send(res, HTTP_STATUS.OK, RFQ_MESSAGES.VENDORS_ASSIGNED, rfq);
    } catch (error) {
      next(error);
    }
  }

  public static async uploadAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        return next(new AppError('No file uploaded.', HTTP_STATUS.BAD_REQUEST));
      }
      const remoteUrl = await CloudinaryService.uploadFile(req.file.path);
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        // Ignore file delete errors
      }
      const rfq = await RFQService.addAttachment(req.params.id, remoteUrl);
      if (!rfq) return next(new AppError(RFQ_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      ResponseFormatter.send(res, HTTP_STATUS.OK, RFQ_MESSAGES.ATTACHMENT_UPLOADED, rfq);
    } catch (error) {
      next(error);
    }
  }

  public static async close(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rfq = await RFQService.close(req.params.id);
      if (!rfq) return next(new AppError(RFQ_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      await ActivityLogService.log({
        userId: req.user?.id,
        action: 'RFQ_CLOSED',
        entityType: 'RFQ',
        entityId: rfq._id?.toString(),
        description: `RFQ closed: ${rfq.title}`,
        req,
      });
      ResponseFormatter.send(res, HTTP_STATUS.OK, RFQ_MESSAGES.CLOSED, rfq);
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { VendorService } from '../../models/vendor/vendor.service.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { PaginationHelper } from '../../helpers/pagination.helper.js';
import { HTTP_STATUS, VENDOR_MESSAGES } from '../../constants/json/status.js';
import { AppError } from '../../utils/appError.js';
import { ActivityLogService } from '../../models/activityLog/activityLog.service.js';

export class VendorController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await VendorService.create(req.body);
      await ActivityLogService.log({
        userId: req.user?.id,
        action: 'VENDOR_REGISTERED',
        entityType: 'Vendor',
        entityId: vendor._id?.toString(),
        description: `Vendor registered: ${vendor.companyName}`,
        req,
      });
      ResponseFormatter.send(res, HTTP_STATUS.CREATED, VENDOR_MESSAGES.CREATED, vendor);
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, rating, status, keyword, page = 1, limit = 10, sortBy, order } = req.query;
      const filter: Record<string, any> = {};
      if (category) filter.category = category;
      if (status) filter.status = status;
      if (rating) filter.rating = { $gte: Number(rating) };
      if (keyword) filter.$text = { $search: String(keyword) };

      const options = {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: (order as 'asc' | 'desc') || 'desc',
      };

      const { docs, total } = await VendorService.list(filter, options);
      const paginated = PaginationHelper.mapResult(docs, total, options);
      ResponseFormatter.send(res, HTTP_STATUS.OK, VENDOR_MESSAGES.FETCHED, paginated);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await VendorService.findById(req.params.id);
      if (!vendor) return next(new AppError(VENDOR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      ResponseFormatter.send(res, HTTP_STATUS.OK, VENDOR_MESSAGES.FETCHED, vendor);
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await VendorService.update(req.params.id, req.body);
      if (!vendor) return next(new AppError(VENDOR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      await ActivityLogService.log({
        userId: req.user?.id,
        action: 'VENDOR_UPDATED',
        entityType: 'Vendor',
        entityId: vendor._id?.toString(),
        description: `Vendor updated: ${vendor.companyName}`,
        req,
      });
      ResponseFormatter.send(res, HTTP_STATUS.OK, VENDOR_MESSAGES.UPDATED, vendor);
    } catch (error) {
      next(error);
    }
  }

  public static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await VendorService.softDelete(req.params.id);
      if (!vendor) return next(new AppError(VENDOR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
      ResponseFormatter.send(res, HTTP_STATUS.OK, VENDOR_MESSAGES.DELETED);
    } catch (error) {
      next(error);
    }
  }

  public static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      return VendorController.list(req, res, next);
    } catch (error) {
      next(error);
    }
  }
}

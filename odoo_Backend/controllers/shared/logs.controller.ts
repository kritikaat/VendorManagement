import { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from '../../models/activityLog/activityLog.service.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { PaginationHelper } from '../../helpers/pagination.helper.js';
import { HTTP_STATUS } from '../../constants/json/status.js';

export class LogsController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dateFrom, dateTo, userId, action, page = 1, limit = 20 } = req.query;
      const filter: Record<string, any> = {};
      if (userId) filter.userId = userId;
      if (action) filter.action = action;
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(String(dateFrom));
        if (dateTo) filter.createdAt.$lte = new Date(String(dateTo));
      }

      const options = { page: Number(page), limit: Number(limit) };
      const { docs, total } = await ActivityLogService.list(filter, options);
      ResponseFormatter.send(res, HTTP_STATUS.OK, 'Activity logs fetched.', PaginationHelper.mapResult(docs, total, options));
    } catch (error) {
      next(error);
    }
  }
}

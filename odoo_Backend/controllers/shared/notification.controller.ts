import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../../models/notification/notification.service.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { PaginationHelper } from '../../helpers/pagination.helper.js';
import { HTTP_STATUS, NOTIFICATION_MESSAGES } from '../../constants/json/status.js';
import { AppError } from '../../utils/appError.js';

export class NotificationController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, unread } = req.query;
      const options = { page: Number(page), limit: Number(limit) };
      const unreadOnly = unread === 'true';
      const { docs, total } = await NotificationService.listForUser(req.user!.id, options, unreadOnly);
      ResponseFormatter.send(res, HTTP_STATUS.OK, NOTIFICATION_MESSAGES.FETCHED, PaginationHelper.mapResult(docs, total, options));
    } catch (error) {
      next(error);
    }
  }

  public static async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notif = await NotificationService.markRead(req.params.id);
      if (!notif) return next(new AppError('Notification not found.', HTTP_STATUS.NOT_FOUND));
      ResponseFormatter.send(res, HTTP_STATUS.OK, NOTIFICATION_MESSAGES.MARKED_READ, notif);
    } catch (error) {
      next(error);
    }
  }

  public static async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await NotificationService.markAllRead(req.user!.id);
      ResponseFormatter.send(res, HTTP_STATUS.OK, NOTIFICATION_MESSAGES.ALL_READ);
    } catch (error) {
      next(error);
    }
  }
}

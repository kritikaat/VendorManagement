import { NotificationModel } from './notification.model.js';
import { INotification, NotificationType } from './notification.type.js';
import { Types } from 'mongoose';
import { QueryOptions } from '../../types/common.type.js';

export class NotificationService {
  public static async create(data: {
    recipientId: string | Types.ObjectId;
    title: string;
    message: string;
    type: NotificationType;
    relatedId?: string | Types.ObjectId;
  }): Promise<INotification> {
    const notif = new NotificationModel(data);
    return notif.save();
  }

  public static async listForUser(
    userId: string,
    options: QueryOptions,
    unreadOnly = false
  ): Promise<{ docs: INotification[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = { recipientId: userId, isDeleted: false };
    if (unreadOnly) filter.readStatus = false;
    const [docs, total] = await Promise.all([
      NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      NotificationModel.countDocuments(filter).exec(),
    ]);
    return { docs, total };
  }

  public static async markRead(id: string): Promise<INotification | null> {
    return NotificationModel.findByIdAndUpdate(id, { readStatus: true }, { new: true }).exec();
  }

  public static async markAllRead(userId: string): Promise<void> {
    await NotificationModel.updateMany({ recipientId: userId, readStatus: false }, { readStatus: true }).exec();
  }
}

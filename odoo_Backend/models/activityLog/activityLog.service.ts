import { ActivityLogModel } from './activityLog.model.js';
import { IActivityLog, LogAction } from './activityLog.type.js';
import { Request } from 'express';
import { QueryOptions } from '../../types/common.type.js';

export class ActivityLogService {
  public static async log(data: {
    userId?: string;
    action: LogAction;
    entityType: string;
    entityId?: string;
    description: string;
    req?: Request;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await ActivityLogModel.create({
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        description: data.description,
        ipAddress: data.req?.ip,
        userAgent: data.req?.headers['user-agent'],
        metadata: data.metadata,
      });
    } catch (_e) {
      // Logging should never crash the main flow
    }
  }

  public static async list(
    filter: Record<string, any>,
    options: QueryOptions
  ): Promise<{ docs: IActivityLog[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      ActivityLogModel.find(filter)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      ActivityLogModel.countDocuments(filter).exec(),
    ]);
    return { docs, total };
  }
}

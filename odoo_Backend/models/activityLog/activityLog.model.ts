import { Schema, model } from 'mongoose';
import { IActivityLog } from './activityLog.type.js';
import { baseSchemaDefinition } from '../shared/schema.js';

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId },
    description: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ...baseSchemaDefinition,
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });

export const ActivityLogModel = model<IActivityLog>('ActivityLog', activityLogSchema);
export default ActivityLogModel;

import { Schema, model } from 'mongoose';
import { INotification } from './notification.type.js';
import { baseSchemaDefinition, softDeletePlugin } from '../shared/schema.js';

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['RFQ', 'APPROVAL', 'INVOICE', 'PO'],
      required: true,
      index: true,
    },
    readStatus: { type: Boolean, default: false, index: true },
    relatedId: { type: Schema.Types.ObjectId },
    ...baseSchemaDefinition,
  },
  { timestamps: true }
);

notificationSchema.plugin(softDeletePlugin);

export const NotificationModel = model<INotification>('Notification', notificationSchema);
export default NotificationModel;

import { Types } from 'mongoose';
import { BaseDocument } from '../shared/schema.type.js';

export type NotificationType = 'RFQ' | 'APPROVAL' | 'INVOICE' | 'PO';

export interface INotification extends BaseDocument {
  recipientId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  readStatus: boolean;
  relatedId?: Types.ObjectId;
}

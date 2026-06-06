import { Types } from 'mongoose';
import { BaseDocument } from '../shared/schema.type.js';

export type LogAction =
  | 'USER_LOGIN'
  | 'USER_SIGNUP'
  | 'RFQ_CREATED'
  | 'RFQ_UPDATED'
  | 'RFQ_DELETED'
  | 'RFQ_CLOSED'
  | 'VENDOR_REGISTERED'
  | 'VENDOR_UPDATED'
  | 'QUOTATION_SUBMITTED'
  | 'QUOTATION_UPDATED'
  | 'QUOTATION_WITHDRAWN'
  | 'APPROVAL_CREATED'
  | 'APPROVAL_APPROVED'
  | 'APPROVAL_REJECTED'
  | 'PO_GENERATED'
  | 'INVOICE_GENERATED'
  | 'INVOICE_PAID';

export interface IActivityLog extends BaseDocument {
  userId?: Types.ObjectId;
  action: LogAction;
  entityType: string;
  entityId?: Types.ObjectId;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

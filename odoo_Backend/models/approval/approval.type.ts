import { Types } from 'mongoose';
import { BaseDocument } from '../shared/schema.type.js';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface IApproval extends BaseDocument {
  rfqId: Types.ObjectId;
  quotationId: Types.ObjectId;
  approverId?: Types.ObjectId;
  remarks?: string;
  status: ApprovalStatus;
  approvedAt?: Date;
  requestedBy: Types.ObjectId;
}

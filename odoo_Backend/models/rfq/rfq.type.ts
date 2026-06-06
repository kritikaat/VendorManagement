import { Types } from 'mongoose';
import { BaseDocument } from '../shared/schema.type.js';

export type RFQStatus = 'Draft' | 'Published' | 'Closed' | 'Cancelled';

export interface RFQProduct {
  name: string;
  specification: string;
  quantity: number;
}

export interface IRFQ extends BaseDocument {
  title: string;
  description: string;
  products: RFQProduct[];
  attachments: string[];
  deadline: Date;
  status: RFQStatus;
  createdBy: Types.ObjectId;
  assignedVendors: Types.ObjectId[];
}

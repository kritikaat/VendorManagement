import { Types } from 'mongoose';
import { BaseDocument } from '../shared/schema.type.js';

export type POStatus = 'Generated' | 'Sent' | 'Accepted' | 'Closed';

export interface POItem {
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface IPurchaseOrder extends BaseDocument {
  poNumber: string;
  vendorId: Types.ObjectId;
  rfqId: Types.ObjectId;
  quotationId: Types.ObjectId;
  approvalId: Types.ObjectId;
  items: POItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  status: POStatus;
  pdfUrl?: string;
}

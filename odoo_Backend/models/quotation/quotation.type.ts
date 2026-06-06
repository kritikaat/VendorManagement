import { Types } from 'mongoose';
import { BaseDocument } from '../shared/schema.type.js';

export type QuotationStatus = 'Draft' | 'Submitted' | 'Withdrawn';

export interface QuotationPricingItem {
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface IQuotation extends BaseDocument {
  rfqId: Types.ObjectId;
  vendorId: Types.ObjectId;
  pricing: QuotationPricingItem[];
  deliveryTimeline: number;
  notes: string;
  submittedAt?: Date;
  status: QuotationStatus;
}

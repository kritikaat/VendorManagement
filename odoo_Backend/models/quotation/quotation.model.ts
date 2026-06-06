import { Schema, model } from 'mongoose';
import { IQuotation } from './quotation.type.js';
import { baseSchemaDefinition, softDeletePlugin } from '../shared/schema.js';

const pricingItemSchema = new Schema(
  {
    productName: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const quotationSchema = new Schema<IQuotation>(
  {
    rfqId: { type: Schema.Types.ObjectId, ref: 'RFQ', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    pricing: { type: [pricingItemSchema], required: true },
    deliveryTimeline: { type: Number, required: true, min: 1 },
    notes: { type: String, default: '' },
    submittedAt: { type: Date },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Withdrawn'],
      default: 'Draft',
      index: true,
    },
    ...baseSchemaDefinition,
  },
  { timestamps: true }
);

// One quotation per vendor per RFQ
quotationSchema.index({ rfqId: 1, vendorId: 1 }, { unique: true });
quotationSchema.plugin(softDeletePlugin);

export const QuotationModel = model<IQuotation>('Quotation', quotationSchema);
export default QuotationModel;

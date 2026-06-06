import { Schema, model } from 'mongoose';
import { IRFQ } from './rfq.type.js';
import { baseSchemaDefinition, softDeletePlugin } from '../shared/schema.js';

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    specification: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const rfqSchema = new Schema<IRFQ>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    products: { type: [productSchema], required: true },
    attachments: [{ type: String }],
    deadline: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Closed', 'Cancelled'],
      default: 'Draft',
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedVendors: [{ type: Schema.Types.ObjectId, ref: 'Vendor', index: true }],
    ...baseSchemaDefinition,
  },
  { timestamps: true }
);

rfqSchema.plugin(softDeletePlugin);

export const RFQModel = model<IRFQ>('RFQ', rfqSchema);
export default RFQModel;

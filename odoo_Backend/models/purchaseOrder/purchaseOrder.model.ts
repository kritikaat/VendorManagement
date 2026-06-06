import { Schema, model } from 'mongoose';
import { IPurchaseOrder } from './purchaseOrder.type.js';
import { baseSchemaDefinition, softDeletePlugin } from '../shared/schema.js';

const poItemSchema = new Schema(
  {
    productName: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: { type: String, required: true, unique: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    rfqId: { type: Schema.Types.ObjectId, ref: 'RFQ', required: true, index: true },
    quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true, index: true },
    approvalId: { type: Schema.Types.ObjectId, ref: 'Approval', required: true },
    items: { type: [poItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, required: true, default: 18 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Generated', 'Sent', 'Accepted', 'Closed'],
      default: 'Generated',
      index: true,
    },
    pdfUrl: { type: String },
    ...baseSchemaDefinition,
  },
  { timestamps: true }
);

purchaseOrderSchema.plugin(softDeletePlugin);

export const PurchaseOrderModel = model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);
export default PurchaseOrderModel;

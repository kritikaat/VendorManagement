import { Schema, model } from 'mongoose';
import { IInvoice } from './invoice.type.js';
import { baseSchemaDefinition, softDeletePlugin } from '../shared/schema.js';

const invoiceItemSchema = new Schema(
  {
    productName: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    poId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    items: { type: [invoiceItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, required: true, default: 18 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Paid', 'Cancelled'],
      default: 'Draft',
      index: true,
    },
    pdfUrl: { type: String },
    ...baseSchemaDefinition,
  },
  { timestamps: true }
);

invoiceSchema.plugin(softDeletePlugin);

export const InvoiceModel = model<IInvoice>('Invoice', invoiceSchema);
export default InvoiceModel;

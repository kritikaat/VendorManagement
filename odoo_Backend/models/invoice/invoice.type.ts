import { Types } from 'mongoose';
import { BaseDocument } from '../shared/schema.type.js';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Cancelled';

export interface InvoiceItem {
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface IInvoice extends BaseDocument {
  invoiceNumber: string;
  poId: Types.ObjectId;
  vendorId: Types.ObjectId;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  dueDate: Date;
  status: InvoiceStatus;
  pdfUrl?: string;
}

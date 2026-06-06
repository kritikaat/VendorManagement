export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  poId?: string;
  invoiceNumber: string;
  poNumber: string;
  vendor: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  // Optional fields from API for detail view
  vendorDetails?: {
    name?: string;
    email?: string;
    address?: string;
    gstin?: string;
  };
  lineItems?: {
    item?: string;
    productName?: string;
    qty?: number;
    quantity?: number;
    unitPrice: number;
    total?: number;
    totalPrice?: number;
  }[];
  billTo?: {
    name: string;
    address: string;
    gstin?: string;
  };
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  grandTotal?: number;
  invoiceDate?: string;
  poDate?: string;
}

export interface InvoiceLineItem {
  item: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poNumber: string;
  vendor: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
}

export interface InvoiceLineItem {
  item: string;
  qty: number;
  unitPrice: number;
  total: number;
}

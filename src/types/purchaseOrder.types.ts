export type PurchaseOrderStatus = 'draft' | 'approved' | 'pending' | 'delivered';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  amount: number;
  issueDate: string;
  deliveryDate: string;
  status: PurchaseOrderStatus;
}

export interface PurchaseOrderLineItem {
  item: string;
  qty: number;
  unitPrice: number;
  total: number;
}

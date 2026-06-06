export type RfqStatus = 'draft' | 'published' | 'closed' | 'cancelled';

export interface RfqLineItem {
  id: string;
  item: string;
  qty: number;
  unit: string;
}

export interface Rfq {
  id: string;
  title: string;
  category: string;
  deadline: string;
  description: string;
  status: RfqStatus;
  lineItems: RfqLineItem[];
  assignedVendorIds: string[];
}

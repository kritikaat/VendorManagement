export type RfqStatus = 'draft' | 'published' | 'closed' | 'cancelled';

export interface RfqProduct {
  id: string;
  name: string;
  specification: string;
  quantity: number;
}

export interface Rfq {
  id: string;
  title: string;
  category: string;
  deadline: string;
  description: string;
  status: RfqStatus;
  products: RfqProduct[];
  assignedVendorIds: string[];
}

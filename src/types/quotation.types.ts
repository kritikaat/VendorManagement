export interface QuotationLineItem {
  item: string;
  qty: number;
  unitPrice: number;
  total: number;
  deliveryDays: number;
}

export interface QuotationComparison {
  vendorId: string;
  vendorName: string;
  grandTotal: number;
  gstPercent: number;
  deliveryDays: number;
  rating: number;
  paymentTerms: string;
  isLowest?: boolean;
}

export interface QuotationDraft {
  rfqId: string;
  lineItems: QuotationLineItem[];
  gstPercent: number;
  notes: string;
}

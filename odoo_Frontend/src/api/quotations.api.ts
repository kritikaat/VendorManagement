import { api, unwrap, unwrapPaginated } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { normalizeStatus, resolveId } from '@/api/mappers';

export interface QuotationListItem {
  id: string;
  rfqId: string;
  rfqTitle: string;
  vendorName: string;
  totalCost: number;
  deliveryTimeline: number;
  status: string;
  submittedAt: string;
}

interface ApiQuotation {
  _id?: string;
  id?: string;
  rfqId?: { _id?: string; title?: string } | string;
  vendorId?: { companyName?: string; name?: string } | string;
  totalCost?: number;
  grandTotal?: number;
  deliveryTimeline?: number;
  status: string;
  createdAt?: string;
}

function mapQuotation(q: ApiQuotation, rfqTitle = 'RFQ'): QuotationListItem {
  const rfqId =
    typeof q.rfqId === 'object' ? resolveId(q.rfqId) : String(q.rfqId ?? '');
  const title =
    typeof q.rfqId === 'object' && q.rfqId?.title ? q.rfqId.title : rfqTitle;
  const vendor =
    typeof q.vendorId === 'object'
      ? (q.vendorId.companyName ?? q.vendorId.name ?? 'Vendor')
      : 'Vendor';

  return {
    id: resolveId(q),
    rfqId,
    rfqTitle: title,
    vendorName: vendor,
    totalCost: q.totalCost ?? q.grandTotal ?? 0,
    deliveryTimeline: q.deliveryTimeline ?? 0,
    status: normalizeStatus(q.status),
    submittedAt: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '—',
  };
}

export const quotationsApi = {
  listByRfq: async (rfqId: string) => {
    const raw = await unwrap<ApiQuotation[]>(api.get(ENDPOINTS.quotationsByRfq(rfqId)));
    return (Array.isArray(raw) ? raw : []).map((q) => mapQuotation(q));
  },

  listForVendor: async () => {
    const raw = await unwrap<ApiQuotation[]>(api.get(ENDPOINTS.quotationsVendor));
    return (Array.isArray(raw) ? raw : []).map((q) => mapQuotation(q));
  },

  list: async (params: { page?: number; limit?: number; rfqId?: string; status?: string } = {}) => {
    const result = await unwrapPaginated<ApiQuotation>(
      api.get(ENDPOINTS.quotations, { params }),
    );
    return { ...result, items: result.items.map((q) => mapQuotation(q)) };
  },

  submit: (payload: {
    rfqId: string;
    pricing: {
      productName: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
    }[];
    deliveryTimeline: number;
    notes?: string;
  }) => unwrap(api.post(ENDPOINTS.quotations, payload)),

  update: (id: string, payload: { deliveryTimeline?: number; notes?: string }) =>
    unwrap(api.put(ENDPOINTS.quotation(id), payload)),

  withdraw: (id: string) => unwrap(api.put(ENDPOINTS.quotationWithdraw(id))),
};

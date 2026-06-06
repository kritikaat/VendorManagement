import { api, unwrap } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { resolveId } from '@/api/mappers';
import type { QuotationComparison } from '@/types/quotation.types';

interface ApiComparisonQuote {
  _id?: string;
  id?: string;
  vendorId?: {
    _id?: string;
    companyName?: string;
    name?: string;
    rating?: number;
  } | string;
  totalCost?: number;
  grandTotal?: number;
  deliveryTimeline?: number;
  deliveryDays?: number;
  notes?: string;
  gstPercent?: number;
}

interface ComparisonResponse {
  quotations: ApiComparisonQuote[];
  summary?: {
    lowestPriceQuote?: string;
    fastestDeliveryQuote?: string;
    highestRatedVendorQuote?: string;
  };
  rfq?: { title?: string; deadline?: string };
}

export const comparisonsApi = {
  compare: async (rfqId: string, sortBy: 'price' | 'delivery' | 'rating' = 'price') => {
    const data = await unwrap<ComparisonResponse>(
      api.get(ENDPOINTS.comparisons(rfqId), { params: { sortBy } }),
    );

    const lowestId = data.summary?.lowestPriceQuote;

    const quotations: QuotationComparison[] = (data.quotations ?? []).map((q) => {
      const id = resolveId(q);
      const vendor =
        typeof q.vendorId === 'object'
          ? {
              id: resolveId(q.vendorId),
              name: q.vendorId.companyName ?? q.vendorId.name ?? 'Vendor',
              rating: q.vendorId.rating ?? 0,
            }
          : { id: String(q.vendorId ?? ''), name: 'Vendor', rating: 0 };

      return {
        id,
        vendorId: vendor.id,
        vendorName: vendor.name,
        grandTotal: q.totalCost ?? q.grandTotal ?? 0,
        gstPercent: q.gstPercent ?? 0,
        deliveryDays: q.deliveryTimeline ?? q.deliveryDays ?? 0,
        rating: vendor.rating,
        paymentTerms: q.notes ?? '—',
        isLowest: lowestId ? id === lowestId : undefined,
      };
    });

    return {
      rfq: {
        id: rfqId,
        title: data.rfq?.title ?? 'RFQ',
        deadline: data.rfq?.deadline
          ? new Date(data.rfq.deadline).toLocaleDateString()
          : '—',
      },
      quotations,
    };
  },
};

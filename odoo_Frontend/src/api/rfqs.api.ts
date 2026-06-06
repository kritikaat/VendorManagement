import { api, unwrap, unwrapPaginated } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { normalizeStatus, resolveId, toApiStatus } from '@/api/mappers';
import type { Rfq, RfqProduct, RfqStatus } from '@/types/rfq.types';

interface ApiProduct {
  _id?: string;
  name: string;
  specification?: string;
  quantity: number;
  item?: string;
  qty?: number;
  unit?: string;
}

interface ApiRfq {
  _id?: string;
  id?: string;
  title: string;
  category?: string;
  deadline: string;
  description?: string;
  status: string;
  products?: ApiProduct[];
  lineItems?: ApiProduct[];
  assignedVendors?: string[];
  assignedVendorIds?: string[];
}

function mapProduct(p: ApiProduct, index: number): RfqProduct {
  return {
    id: p._id ?? `product-${index}`,
    name: p.name ?? p.item ?? '',
    specification: p.specification ?? p.unit ?? '',
    quantity: p.quantity ?? p.qty ?? 1,
  };
}

function mapRfq(r: ApiRfq): Rfq {
  const products = r.products ?? r.lineItems ?? [];
  return {
    id: resolveId(r),
    title: r.title,
    category: r.category ?? '—',
    deadline: r.deadline ? new Date(r.deadline).toISOString().slice(0, 10) : '—',
    description: r.description ?? '',
    status: normalizeStatus(r.status) as RfqStatus,
    products: products.map(mapProduct),
    assignedVendorIds: r.assignedVendors ?? r.assignedVendorIds ?? [],
  };
}

export const rfqsApi = {
  list: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}) => {
    const result = await unwrapPaginated<ApiRfq>(
      api.get(ENDPOINTS.rfqs, {
        params: {
          ...params,
          status: params.status ? toApiStatus(params.status) : undefined,
        },
      }),
    );
    return { ...result, items: result.items.map(mapRfq) };
  },

  getById: async (id: string) => mapRfq(await unwrap<ApiRfq>(api.get(ENDPOINTS.rfq(id)))),

  create: async (payload: {
    title: string;
    description?: string;
    products: { name: string; specification?: string; quantity: number }[];
    deadline: string;
  }) => {
    const raw = await unwrap<ApiRfq>(api.post(ENDPOINTS.rfqs, payload));
    return mapRfq(raw);
  },

  update: (id: string, payload: Partial<{ title: string; description: string; deadline: string }>) =>
    unwrap(api.put(ENDPOINTS.rfq(id), payload)),

  assignVendors: (id: string, vendorIds: string[]) =>
    unwrap(api.post(ENDPOINTS.rfqVendors(id), { vendorIds })),

  close: (id: string) => unwrap(api.put(ENDPOINTS.rfqClose(id))),

  remove: (id: string) => unwrap(api.delete(ENDPOINTS.rfq(id))),
};

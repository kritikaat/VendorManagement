import { api, unwrap, unwrapPaginated } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { normalizeStatus, resolveId, toApiStatus } from '@/api/mappers';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchaseOrder.types';

interface ApiPO {
  _id?: string;
  id?: string;
  poNumber: string;
  vendorId?: { companyName?: string; name?: string } | string;
  vendorDetails?: { name?: string };
  total?: number;
  grandTotal?: number;
  poDate?: string;
  createdAt?: string;
  expectedDeliveryDate?: string;
  status: string;
}

function mapPO(p: ApiPO): PurchaseOrder {
  const vendorName =
    p.vendorDetails?.name ??
    (typeof p.vendorId === 'object'
      ? (p.vendorId.companyName ?? p.vendorId.name ?? 'Vendor')
      : 'Vendor');

  return {
    id: resolveId(p),
    poNumber: p.poNumber,
    vendor: vendorName,
    amount: p.total ?? p.grandTotal ?? 0,
    issueDate: p.poDate
      ? new Date(p.poDate).toLocaleDateString()
      : p.createdAt
        ? new Date(p.createdAt).toLocaleDateString()
        : '—',
    deliveryDate: p.expectedDeliveryDate
      ? new Date(p.expectedDeliveryDate).toLocaleDateString()
      : '—',
    status: normalizeStatus(p.status) as PurchaseOrderStatus,
  };
}

export const purchaseOrdersApi = {
  list: async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const result = await unwrapPaginated<ApiPO>(
      api.get(ENDPOINTS.purchaseOrders, {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 50,
          status: params.status ? toApiStatus(params.status) : undefined,
        },
      }),
    );
    return { ...result, items: result.items.map(mapPO) };
  },

  getById: async (id: string) => unwrap<ApiPO>(api.get(ENDPOINTS.purchaseOrder(id))),

  generate: (quotationId: string, taxRate = 18) =>
    unwrap(api.post(ENDPOINTS.purchaseOrders, { quotationId, taxRate })),

  downloadPdf: async (id: string, filename: string) => {
    const response = await api.get(ENDPOINTS.purchaseOrderPdf(id), { responseType: 'blob' });
    return { blob: response.data as Blob, filename };
  },

  email: (id: string) => unwrap(api.post(ENDPOINTS.purchaseOrderEmail(id))),
};

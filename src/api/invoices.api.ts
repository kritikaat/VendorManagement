import { api, unwrap, unwrapPaginated } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { normalizeStatus, resolveId, toApiStatus } from '@/api/mappers';
import type { Invoice, InvoiceStatus } from '@/types/invoice.types';

interface ApiInvoice {
  _id?: string;
  id?: string;
  invoiceNumber: string;
  poId?: { _id?: string } | string;
  poNumber: string;
  vendorId?: { companyName?: string; name?: string } | string;
  vendorDetails?: { name?: string; email?: string };
  total?: number;
  grandTotal: number;
  invoiceDate?: string;
  dueDate?: string;
  status: string;
  lineItems?: { item?: string; productName?: string; qty?: number; quantity?: number; unitPrice: number; total: number; totalPrice?: number }[];
  billTo?: { name: string; address: string; gstin?: string };
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  poDate?: string;
}

function mapInvoiceStatus(status: string): InvoiceStatus {
  const s = normalizeStatus(status);
  if (s.includes('paid')) return 'paid';
  if (s.includes('overdue')) return 'overdue';
  return 'pending';
}

function mapInvoiceListItem(i: ApiInvoice): Invoice {
  const vendorName =
    i.vendorDetails?.name ??
    (typeof i.vendorId === 'object'
      ? (i.vendorId.companyName ?? i.vendorId.name ?? 'Vendor')
      : 'Vendor');

  return {
    id: resolveId(i),
    poId: resolveId(i.poId),
    invoiceNumber: i.invoiceNumber,
    poNumber: i.poNumber,
    vendor: vendorName,
    amount: i.grandTotal ?? i.total ?? 0,
    issueDate: i.invoiceDate ? new Date(i.invoiceDate).toLocaleDateString() : '—',
    dueDate: i.dueDate ? new Date(i.dueDate).toLocaleDateString() : '—',
    status: mapInvoiceStatus(i.status),
  };
}

export const invoicesApi = {
  list: async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const result = await unwrapPaginated<ApiInvoice>(
      api.get(ENDPOINTS.invoices, {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 50,
          status: params.status ? toApiStatus(params.status) : undefined,
        },
      }),
    );
    return { ...result, items: result.items.map(mapInvoiceListItem) };
  },

  getById: async (id: string) => unwrap<ApiInvoice>(api.get(ENDPOINTS.invoice(id))),

  generate: (payload: { poId: string; dueDate: string; taxRate?: number }) =>
    unwrap(api.post(ENDPOINTS.invoices, payload)),

  markPaid: (id: string) => unwrap(api.put(ENDPOINTS.invoicePaid(id))),

  downloadPdf: async (id: string, filename: string) => {
    const response = await api.get(ENDPOINTS.invoicePdf(id), { responseType: 'blob' });
    return { blob: response.data as Blob, filename };
  },

  email: (id: string, email?: string) =>
    unwrap(api.post(ENDPOINTS.invoiceEmail(id), email ? { email } : {})),
};

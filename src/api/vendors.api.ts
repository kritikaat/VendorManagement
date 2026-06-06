import { api, unwrap, unwrapPaginated } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { normalizeStatus, resolveId, toApiStatus } from '@/api/mappers';
import type { Vendor, VendorStatus } from '@/types/vendor.types';

interface ApiVendor {
  _id?: string;
  id?: string;
  companyName?: string;
  name?: string;
  category?: string;
  GSTNumber?: string;
  gstNumber?: string;
  contactNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status: string;
  rating?: number;
  vendorCode?: string;
}

function mapVendorStatus(status: string): VendorStatus {
  const s = normalizeStatus(status);
  if (s === 'inactive' || s === 'blocked') return 'blocked';
  if (s === 'pending') return 'pending';
  return 'active';
}

function mapVendor(v: ApiVendor): Vendor {
  return {
    id: resolveId(v),
    name: v.companyName ?? v.name ?? '—',
    category: v.category ?? '—',
    gstNumber: v.GSTNumber ?? v.gstNumber ?? '—',
    contactNumber: v.phone ?? v.contactNumber ?? '—',
    email: v.email,
    address: [v.address, v.city, v.state, v.country].filter(Boolean).join(', ') || undefined,
    status: mapVendorStatus(v.status),
    rating: v.rating,
    vendorCode: v.vendorCode,
  };
}

export interface CreateVendorPayload {
  companyName: string;
  category: string;
  GSTNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  rating?: number;
}

export const vendorsApi = {
  list: async (params: {
    page?: number;
    limit?: number;
    keyword?: string;
    category?: string;
    status?: string;
  } = {}) => {
    const result = await unwrapPaginated<ApiVendor>(
      api.get(ENDPOINTS.vendors, {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 50,
          keyword: params.keyword || undefined,
          category: params.category || undefined,
          status:
            params.status && params.status !== 'all'
              ? params.status === 'active'
                ? 'Active'
                : 'Inactive'
              : undefined,
        },
      }),
    );
    return { ...result, items: result.items.map(mapVendor) };
  },

  search: async (params: { category?: string; status?: string } = {}) => {
    const raw = await unwrap<ApiVendor[]>(
      api.get(ENDPOINTS.vendorSearch, {
        params: {
          category: params.category,
          status: params.status ? toApiStatus(params.status) : undefined,
        },
      }),
    );
    return (Array.isArray(raw) ? raw : []).map(mapVendor);
  },

  getById: async (id: string) => mapVendor(await unwrap<ApiVendor>(api.get(ENDPOINTS.vendor(id)))),

  create: async (payload: CreateVendorPayload) =>
    mapVendor(await unwrap<ApiVendor>(api.post(ENDPOINTS.vendors, payload))),

  update: async (id: string, payload: Partial<CreateVendorPayload>) =>
    mapVendor(await unwrap<ApiVendor>(api.put(ENDPOINTS.vendor(id), payload))),

  remove: (id: string) => unwrap(api.delete(ENDPOINTS.vendor(id))),
};

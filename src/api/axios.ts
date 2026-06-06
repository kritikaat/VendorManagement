import axios from 'axios';
import { extractPaginated, type PaginatedEnvelope } from '@/api/mappers';
import type { ApiErrorBody, ApiResponse } from '@/api/types';

const STORAGE_KEY = 'vendorbridge_session';

function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';
  if (!raw) return '/api/v1';

  const normalized = raw.replace(/\/+$/, '');
  if (normalized.endsWith('/api/v1')) return normalized;

  return `${normalized}/api/v1`;
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const session = JSON.parse(raw) as { token?: string };
      if (session.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const body = error.response?.data as ApiErrorBody | undefined;

    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem(STORAGE_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const message = body?.message ?? error.message ?? 'Request failed';
    return Promise.reject(new Error(message));
  },
);

export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise;
  return data.data;
}

export async function unwrapPaginated<T>(
  promise: Promise<{ data: ApiResponse<T[] | PaginatedEnvelope<T>> }>,
): Promise<{ items: T[]; meta: { page: number; limit: number; total: number } }> {
  const { data } = await promise;
  return extractPaginated(data.data, data.meta);
}

export function resolveId(
  value: { _id?: string; id?: string } | string | null | undefined,
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id ?? value.id ?? '';
}

export function normalizeStatus(status: string): string {
  return status.toLowerCase().replace(/\s+/g, '_');
}

export function toApiStatus(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === 'all') return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export interface PaginatedEnvelope<T> {
  docs?: T[];
  totalDocs?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export function extractPaginated<T>(
  payload: T[] | PaginatedEnvelope<T> | null | undefined,
  meta?: { page?: number; limit?: number; total?: number },
): { items: T[]; meta: { page: number; limit: number; total: number } } {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      meta: {
        page: meta?.page ?? 1,
        limit: meta?.limit ?? payload.length,
        total: meta?.total ?? payload.length,
      },
    };
  }

  if (payload && typeof payload === 'object' && 'docs' in payload) {
    const page = payload as PaginatedEnvelope<T>;
    return {
      items: page.docs ?? [],
      meta: {
        page: page.page ?? 1,
        limit: page.limit ?? 10,
        total: page.totalDocs ?? page.docs?.length ?? 0,
      },
    };
  }

  return { items: [], meta: { page: 1, limit: 10, total: 0 } };
}

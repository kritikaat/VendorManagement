import { api, unwrapPaginated } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { resolveId } from '@/api/mappers';
import type { ActivityEventType, ActivityLog } from '@/types/activity.types';

interface ApiLog {
  _id?: string;
  id?: string;
  action?: string;
  eventType?: string;
  title?: string;
  message?: string;
  description?: string;
  createdAt?: string;
}

const ACTION_TYPE_MAP: Record<string, ActivityEventType> = {
  RFQ_CREATED: 'rfq',
  RFQ_PUBLISHED: 'rfq',
  QUOTATION_SUBMITTED: 'quotation',
  APPROVAL: 'approval',
  INVOICE: 'invoice',
  VENDOR: 'vendor',
  USER_LOGIN: 'rfq',
};

function inferType(log: ApiLog): ActivityEventType {
  const key = (log.action ?? log.eventType ?? '').toUpperCase();
  for (const [pattern, type] of Object.entries(ACTION_TYPE_MAP)) {
    if (key.includes(pattern.split('_')[0]!)) return type;
  }
  if (key.includes('RFQ')) return 'rfq';
  if (key.includes('QUOTATION')) return 'quotation';
  if (key.includes('APPROVAL')) return 'approval';
  if (key.includes('INVOICE')) return 'invoice';
  if (key.includes('VENDOR')) return 'vendor';
  return 'rfq';
}

function mapLog(log: ApiLog): ActivityLog {
  return {
    id: resolveId(log),
    type: inferType(log),
    title: log.title ?? log.action ?? 'Activity',
    description: log.description ?? log.message ?? '—',
    timestamp: log.createdAt
      ? new Date(log.createdAt).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : '—',
  };
}

export const logsApi = {
  list: async (params: {
    page?: number;
    limit?: number;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}) => {
    const result = await unwrapPaginated<ApiLog>(
      api.get(ENDPOINTS.logs, {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 50,
          action: params.action && params.action !== 'all' ? params.action : undefined,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }),
    );
    return { ...result, items: result.items.map(mapLog) };
  },
};

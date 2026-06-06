import { api, unwrap } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { resolveId } from '@/api/mappers';

interface ChartPoint {
  x: string;
  y: number;
  count?: number;
}

interface DashboardApiResponse {
  role?: string;
  pendingApprovals?: number;
  activeRFQs?: number;
  metrics?: Record<string, number>;
  analytics?: Record<string, number>;
  charts?: {
    poTrend?: ChartPoint[];
    invoiceTrend?: ChartPoint[];
    revenueTrend?: ChartPoint[];
    spendByVendor?: ChartPoint[];
  };
  tables?: {
    recentHighValuePOs?: {
      _id?: string;
      poNumber: string;
      total?: number;
      status: string;
      vendorName?: string;
    }[];
    recentPurchaseOrders?: {
      poNumber: string;
      vendorName?: string;
      amount?: number;
      total?: number;
      status: string;
    }[];
    topVendors?: { companyName?: string; vendorName?: string; totalSpend?: number }[];
  };
  spendingTrend?: { month: string; amount: number }[];
  activeRfqs?: number;
  posThisMonth?: number;
  overdueInvoices?: number;
}

export interface DashboardViewModel {
  pendingApprovals: number;
  activeRfqs: number;
  posThisMonth: number;
  overdueInvoices: number;
  totalSpend: number;
  activeVendors: number;
  recentPurchaseOrders: {
    id: string;
    poNumber: string;
    vendorName: string;
    amount: number;
    status: string;
  }[];
  spendingTrend: { month: string; amount: number }[];
}

function mapDashboard(raw: DashboardApiResponse): DashboardViewModel {
  const metrics = raw.metrics ?? {};
  const analytics = raw.analytics ?? {};

  const recentFromTables =
    raw.tables?.recentHighValuePOs?.map((po) => ({
      id: resolveId(po),
      poNumber: po.poNumber,
      vendorName: po.vendorName ?? '—',
      amount: po.total ?? 0,
      status: po.status,
    })) ??
    raw.tables?.recentPurchaseOrders?.map((po) => ({
      id: po.poNumber,
      poNumber: po.poNumber,
      vendorName: po.vendorName ?? '—',
      amount: po.amount ?? po.total ?? 0,
      status: po.status,
    })) ??
    [];

  const trendFromCharts =
    raw.charts?.poTrend?.map((p) => ({
      month: p.x,
      amount: p.y,
    })) ?? raw.spendingTrend ?? [];

  return {
    pendingApprovals: raw.pendingApprovals ?? metrics.pendingApprovals ?? 0,
    activeRfqs: raw.activeRFQs ?? raw.activeRfqs ?? metrics.totalRFQs ?? 0,
    posThisMonth: raw.posThisMonth ?? analytics.monthlySpend ?? metrics.totalSpend ?? 0,
    overdueInvoices: raw.overdueInvoices ?? 0,
    totalSpend: metrics.totalSpend ?? analytics.monthlySpend ?? 0,
    activeVendors: metrics.activeVendors ?? analytics.totalVendors ?? 0,
    recentPurchaseOrders: recentFromTables,
    spendingTrend: trendFromCharts,
  };
}

export const dashboardApi = {
  get: async (params?: {
    startDate?: string;
    endDate?: string;
    interval?: 'day' | 'month' | 'year';
  }) => {
    const raw = await unwrap<DashboardApiResponse>(
      api.get(ENDPOINTS.dashboard, { params }),
    );
    return mapDashboard(raw);
  },
};

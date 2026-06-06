import { api, unwrap } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';

export interface ProcurementSummary {
  totalRfqs?: number;
  totalPos?: number;
  totalSpend?: number;
  activeVendors?: number;
  pendingApprovals?: number;
}

export interface MonthlyTrends {
  rfqTrends: { month: string; value: number }[];
  poTrends: { month: string; value: number; count?: number }[];
  invoiceTrends: { month: string; value: number; count?: number }[];
}

export interface SpendAnalysis {
  spendByCategory: { category: string; amount: number }[];
  topVendors: { vendorName: string; spend: number; poCount: number }[];
}

function mapChartPoint(p: { x: string; y: number; count?: number }) {
  return { month: p.x, value: p.y, count: p.count };
}

export const reportsApi = {
  procurementSummary: () => unwrap<ProcurementSummary>(api.get(ENDPOINTS.reports.procurementSummary)),

  monthlyTrends: async (): Promise<MonthlyTrends> => {
    const raw = await unwrap<{
      rfqTrends?: { x: string; y: number }[];
      poTrends?: { x: string; y: number; count?: number }[];
      invoiceTrends?: { x: string; y: number; count?: number }[];
    }>(api.get(ENDPOINTS.reports.monthlyTrends));

    return {
      rfqTrends: (raw.rfqTrends ?? []).map(mapChartPoint),
      poTrends: (raw.poTrends ?? []).map(mapChartPoint),
      invoiceTrends: (raw.invoiceTrends ?? []).map(mapChartPoint),
    };
  },

  spendAnalysis: async (): Promise<SpendAnalysis> => {
    const raw = await unwrap<{
      spendByCategory?: { category: string; amount: number }[];
      topVendors?: { vendorName?: string; companyName?: string; spend: number; poCount: number }[];
    }>(api.get(ENDPOINTS.reports.spendAnalysis));

    return {
      spendByCategory: raw.spendByCategory ?? [],
      topVendors: (raw.topVendors ?? []).map((v) => ({
        vendorName: v.vendorName ?? v.companyName ?? 'Unknown',
        spend: v.spend,
        poCount: v.poCount,
      })),
    };
  },

  vendorPerformance: () => unwrap(api.get(ENDPOINTS.reports.vendorPerformance)),

  exportData: (format: 'json' | 'csv' = 'json') =>
    api.get(ENDPOINTS.reports.export, {
      params: { format: format === 'csv' ? 'csv' : undefined },
      responseType: format === 'csv' ? 'blob' : 'json',
    }),
};

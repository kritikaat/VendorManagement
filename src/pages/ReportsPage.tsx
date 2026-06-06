import { Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageState } from '@/components/shared/PageState';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { reportsApi } from '@/api/reports.api';
import { queryKeys } from '@/api/queryKeys';
import { formatCurrency, formatNumber } from '@/lib/formatCurrency';
import { downloadBlob } from '@/lib/downloadFile';
import { cn } from '@/lib/utils';

const CATEGORY_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-rose-500',
];

export function ReportsPage() {
  const summaryQuery = useQuery({
    queryKey: queryKeys.reports.summary,
    queryFn: reportsApi.procurementSummary,
  });

  const trendsQuery = useQuery({
    queryKey: queryKeys.reports.trends,
    queryFn: reportsApi.monthlyTrends,
  });

  const spendQuery = useQuery({
    queryKey: queryKeys.reports.spend,
    queryFn: reportsApi.spendAnalysis,
  });

  const isLoading =
    summaryQuery.isLoading || trendsQuery.isLoading || spendQuery.isLoading;
  const error = summaryQuery.error ?? trendsQuery.error ?? spendQuery.error;

  const summary = summaryQuery.data;
  const trends = trendsQuery.data;
  const spend = spendQuery.data;

  const maxTrend = Math.max(...(trends?.poTrends.map((t) => t.value) ?? [1]), 1);
  const maxCategorySpend = Math.max(...(spend?.spendByCategory.map((c) => c.amount) ?? [1]), 1);

  const handleExport = async () => {
    const response = await reportsApi.exportData('csv');
    downloadBlob(response.data as Blob, 'procurement-report.csv');
  };

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Procurement insights and spend analysis"
        action={
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <PageState isLoading={isLoading} error={error}>
        {summary ? (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total spend"
                value={formatCurrency(summary.totalSpend ?? 0)}
                colorClass="text-blue-700"
              />
              <StatCard
                label="Active vendors"
                value={summary.activeVendors ?? 0}
                colorClass="text-emerald-700"
              />
              <StatCard
                label="Total RFQs"
                value={summary.totalRfqs ?? 0}
                colorClass="text-amber-700"
              />
              <StatCard
                label="Pending approvals"
                value={summary.pendingApprovals ?? 0}
                colorClass="text-red-600"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="mb-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Spend by Category
                </h3>
                <div className="space-y-5">
                  {(spend?.spendByCategory ?? []).map((cat, i) => (
                    <div key={cat.category}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{cat.category}</span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(cat.amount)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-sm bg-slate-100">
                        <div
                          className={cn('h-full rounded-sm', CATEGORY_COLORS[i % CATEGORY_COLORS.length])}
                          style={{ width: `${(cat.amount / maxCategorySpend) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Top Vendors by Spend
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                      <th className="pb-2 text-left font-semibold">Vendor</th>
                      <th className="pb-2 text-left font-semibold">Spend (₹)</th>
                      <th className="pb-2 text-left font-semibold">POs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(spend?.topVendors ?? []).map((v) => (
                      <tr key={v.vendorName} className="border-b border-slate-100">
                        <td className="py-3 font-medium text-slate-800">{v.vendorName}</td>
                        <td className="py-3 text-slate-700">{formatNumber(v.spend)}</td>
                        <td className="py-3 text-slate-700">{v.poCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
                <h3 className="mb-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Monthly PO Trends
                </h3>
                <div className="flex h-48 items-end justify-between gap-3">
                  {(trends?.poTrends ?? []).map((bar, i) => (
                    <div key={bar.month} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className={cn(
                          'w-full rounded-sm',
                          i === (trends?.poTrends.length ?? 0) - 1
                            ? 'bg-emerald-700'
                            : 'bg-slate-300',
                        )}
                        style={{ height: `${Math.max((bar.value / maxTrend) * 100, 4)}%` }}
                      />
                      <span className="text-xs text-slate-500">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </PageState>
    </div>
  );
}

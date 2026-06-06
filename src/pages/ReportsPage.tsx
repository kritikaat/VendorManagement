import { Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { MOCK_REPORTS } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function ReportsPage() {
  const { kpis, categorySpend, topVendors, monthlyTrend, month } = MOCK_REPORTS;

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle={`Procurement insights — ${month}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              {month}
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total spend" value={kpis.totalSpend} colorClass="text-blue-700" />
        <StatCard label="Active vendors" value={kpis.activeVendors} colorClass="text-emerald-700" />
        <StatCard label="PO Fulfillment" value={kpis.poFulfillment} colorClass="text-amber-700" />
        <StatCard label="Overdue invoices" value={kpis.overdueInvoices} colorClass="text-red-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Spend by Category
          </h3>
          <div className="space-y-5">
            {categorySpend.map((cat) => (
              <div key={cat.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{cat.name}</span>
                  <span className="font-medium text-slate-900">{cat.amount}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-sm bg-slate-100">
                  <div
                    className={cn('h-full rounded-sm', cat.color)}
                    style={{ width: `${cat.percent}%` }}
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
              {topVendors.map((v) => (
                <tr key={v.vendor} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-slate-800">{v.vendor}</td>
                  <td className="py-3 text-slate-700">{v.spend}</td>
                  <td className="py-3 text-slate-700">{v.pos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
          <h3 className="mb-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Monthly Trend
          </h3>
          <div className="flex h-48 items-end justify-between gap-3">
            {monthlyTrend.map((bar, i) => (
              <div key={bar.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-full rounded-sm',
                    i === monthlyTrend.length - 1 ? 'bg-emerald-700' : 'bg-slate-300',
                  )}
                  style={{ height: `${bar.value}%` }}
                />
                <span className="text-xs text-slate-500">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

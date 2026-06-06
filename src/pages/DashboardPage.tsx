import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageState } from '@/components/shared/PageState';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { dashboardApi } from '@/api/dashboard.api';
import { queryKeys } from '@/api/queryKeys';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { formatCurrency, formatNumber } from '@/lib/formatCurrency';
import { USER_ROLES } from '@/types/auth.types';

export function DashboardPage() {
  const { user } = useAuth();
  const { can, role } = usePermission();
  const roleLabel = user?.role.replace(/_/g, ' ') ?? 'User';

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: dashboardApi.get,
  });

  const stats =
    role === USER_ROLES.VENDOR
      ? [
          { label: 'Active RFQs', value: data?.activeRfqs ?? 0, color: 'text-blue-700' },
          { label: 'POs This Month', value: formatCurrency(data?.posThisMonth ?? 0), color: 'text-emerald-700' },
          { label: 'Pending Approvals', value: data?.pendingApprovals ?? 0, color: 'text-amber-700' },
          { label: 'Overdue Invoices', value: data?.overdueInvoices ?? 0, color: 'text-red-600' },
        ]
      : role === USER_ROLES.APPROVER
        ? [
            { label: 'Pending Approvals', value: data?.pendingApprovals ?? 0, color: 'text-emerald-700' },
            { label: 'Active RFQs', value: data?.activeRfqs ?? 0, color: 'text-blue-700' },
            { label: "PO's This Month", value: formatCurrency(data?.posThisMonth ?? 0), color: 'text-amber-700' },
            { label: 'Overdue Invoices', value: data?.overdueInvoices ?? 0, color: 'text-red-600' },
          ]
        : [
            { label: 'Active RFQs', value: data?.activeRfqs ?? 0, color: 'text-blue-700' },
            { label: 'Pending Approvals', value: data?.pendingApprovals ?? 0, color: 'text-emerald-700' },
            { label: "PO's This Month", value: formatCurrency(data?.posThisMonth ?? 0), color: 'text-amber-700' },
            { label: 'Overdue Invoices', value: data?.overdueInvoices ?? 0, color: 'text-red-600' },
          ];

  const maxTrend = Math.max(...(data?.spendingTrend.map((t) => t.amount) ?? [1]), 1);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${roleLabel} — today's overview`}
      />

      <PageState isLoading={isLoading} error={error}>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              colorClass={stat.color}
            />
          ))}
        </div>

        {can('po:read') ? (
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <h2 className="font-semibold text-slate-900">Recent Purchase Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase text-muted-foreground">
                      <th className="px-5 py-2 text-left">PO#</th>
                      <th className="px-5 py-2 text-left">Vendor</th>
                      <th className="px-5 py-2 text-left">Amount</th>
                      <th className="px-5 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recentPurchaseOrders ?? []).map((po) => (
                      <tr key={po.poNumber} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium">{po.poNumber}</td>
                        <td className="px-5 py-3">{po.vendorName}</td>
                        <td className="px-5 py-3">{formatNumber(po.amount)}</td>
                        <td className="px-5 py-3">
                          <StatusBadge status={po.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {can('reports:view') ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">
                  Spending Trends — last 6 months
                </h2>
                <div className="flex h-44 items-end justify-between gap-2">
                  {(data?.spendingTrend ?? []).map((point) => (
                    <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-sm bg-emerald-700"
                        style={{ height: `${Math.max((point.amount / maxTrend) * 100, 4)}%` }}
                      />
                      <span className="text-xs text-slate-500">{point.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {can('rfq:create') ? (
            <Button asChild>
              <Link to="/rfqs/new">+ New RFQ</Link>
            </Button>
          ) : null}
          {can('quotation:submit') ? (
            <Button asChild>
              <Link to="/quotations">Submit Quotation</Link>
            </Button>
          ) : null}
          {can('approval:view') ? (
            <Button variant="outline" asChild>
              <Link to="/approvals">Review Approvals</Link>
            </Button>
          ) : null}
          {can('vendor:create') ? (
            <Button variant="outline" asChild>
              <Link to="/vendors">Manage Vendors</Link>
            </Button>
          ) : null}
          {can('invoice:read') ? (
            <Button variant="outline" asChild>
              <Link to="/invoices">View Invoices</Link>
            </Button>
          ) : null}
        </div>
      </PageState>
    </div>
  );
}

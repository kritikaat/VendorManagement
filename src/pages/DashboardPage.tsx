import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { USER_ROLES } from '@/types/auth.types';

const RECENT_POS = [
  { po: 'PO-2025-0068', vendor: 'Infra Supplies', amount: '₹87,000', status: 'Approved' },
  { po: 'PO-2025-0067', vendor: 'Tech Core', amount: '₹1,40,000', status: 'Pending' },
  { po: 'PO-2025-0066', vendor: 'OfficeNeed Co', amount: '₹34,900', status: 'draft' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { can, role } = usePermission();
  const roleLabel = user?.role.replace(/_/g, ' ') ?? 'User';

  const stats =
    role === USER_ROLES.VENDOR
      ? [
          { label: 'Assigned RFQs', value: 3, color: 'text-blue-700' },
          { label: 'Submitted Quotes', value: 2, color: 'text-emerald-700' },
          { label: 'Active POs', value: 1, color: 'text-amber-700' },
          { label: 'Pending Invoices', value: 1, color: 'text-red-600' },
        ]
      : role === USER_ROLES.APPROVER
        ? [
            { label: 'Pending Approvals', value: 5, color: 'text-emerald-700' },
            { label: 'Approved This Week', value: 8, color: 'text-blue-700' },
            { label: 'Rejected', value: 1, color: 'text-red-600' },
            { label: 'Avg. Cycle (days)', value: 2.4, color: 'text-amber-700' },
          ]
        : role === USER_ROLES.ADMIN
          ? [
              { label: 'Active Vendors', value: 28, color: 'text-blue-700' },
              { label: 'Active RFQs', value: 12, color: 'text-emerald-700' },
              { label: 'Total Spend (month)', value: '₹12.4L', color: 'text-amber-700' },
              { label: 'System Users', value: 24, color: 'text-slate-700' },
            ]
          : [
              { label: 'Active RFQs', value: 12, color: 'text-blue-700' },
              { label: 'Pending Approvals', value: 5, color: 'text-emerald-700' },
              { label: "PO's this month", value: '₹2.3L', color: 'text-amber-700' },
              { label: 'Overdue Invoices', value: 3, color: 'text-red-600' },
            ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${roleLabel} — today's overview`}
      />

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
                  {RECENT_POS.map((po) => (
                    <tr key={po.po} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium">{po.po}</td>
                      <td className="px-5 py-3">{po.vendor}</td>
                      <td className="px-5 py-3">{po.amount}</td>
                      <td className="px-5 py-3">
                        <StatusBadge
                          status={po.status}
                          variant={po.status === 'Approved' ? 'approved' : 'pending'}
                        />
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
                {[40, 55, 45, 60, 50, 72].map((height, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-sm bg-emerald-700"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-slate-500">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                    </span>
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
    </div>
  );
}

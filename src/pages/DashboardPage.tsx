import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const RECENT_POS = [
  { po: 'PO-2025-0068', vendor: 'Infra Supplies', amount: '₹87,000', status: 'Approved' },
  { po: 'PO-2025-0067', vendor: 'Tech Core', amount: '₹1,40,000', status: 'Pending' },
  { po: 'PO-2025-0066', vendor: 'OfficeNeed Co', amount: '₹34,900', status: 'draft' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const roleLabel = user?.role.replace('_', ' ') ?? 'User';

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${roleLabel} — Today's Overview`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active RFQ's" value={12} colorClass="text-blue-700" />
        <StatCard label="Pending Approvals" value={5} colorClass="text-emerald-700" />
        <StatCard label="PO's this month" value="₹2.3L" colorClass="text-amber-700" />
        <StatCard label="Overdue Invoices" value={3} colorClass="text-red-600" />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
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
                  <tr key={po.po} className="border-b border-slate-50 hover:bg-emerald-50/30">
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

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Spending Trends — last 6 months</h2>
          <div className="flex h-44 items-end justify-between gap-2">
            {[40, 55, 45, 60, 50, 72].map((height, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-sm bg-emerald-600"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs font-medium text-slate-500">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/rfqs/new">+ New RFQ</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/vendors">Add Vendor</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/invoices">View Invoices</Link>
        </Button>
      </div>
    </div>
  );
}

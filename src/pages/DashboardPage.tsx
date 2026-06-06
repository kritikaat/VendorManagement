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
        <StatCard label="Active RFQ's" value={12} colorClass="text-blue-400" />
        <StatCard label="Pending Approvals" value={5} colorClass="text-emerald-400" />
        <StatCard label="PO's this month" value="₹2.3L" colorClass="text-orange-400" />
        <StatCard label="Overdue Invoices" value={3} colorClass="text-red-400" />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">Recent Purchase Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-2 text-left">PO#</th>
                  <th className="px-4 py-2 text-left">Vendor</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_POS.map((po) => (
                  <tr key={po.po} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{po.po}</td>
                    <td className="px-4 py-3">{po.vendor}</td>
                    <td className="px-4 py-3">{po.amount}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={po.status}
                        variant={po.status === 'Approved' ? 'active' : 'pending'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-6 text-zinc-900">
          <h2 className="mb-4 text-sm font-medium">Spending Trends last 6 months</h2>
          <div className="flex h-40 items-end justify-between gap-2">
            {[40, 55, 45, 60, 50, 70].map((height, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-blue-400"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-zinc-500">
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

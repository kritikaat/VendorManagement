import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { MOCK_APPROVALS } from '@/data/mockData';
import { formatNumber } from '@/lib/formatCurrency';
import type { Approval, ApprovalStatus } from '@/types/approval.types';

export function ApprovalListPage() {
  return (
    <div>
      <PageHeader
        title="Approvals"
        subtitle="Review and action pending procurement approvals"
      />

      <DataTable<Approval>
        data={MOCK_APPROVALS}
        getRowKey={(row) => row.id}
        columns={[
          { key: 'rfq', header: 'RFQ', render: (row) => row.rfqTitle },
          { key: 'vendor', header: 'Vendor', render: (row) => row.vendor },
          {
            key: 'amount',
            header: 'Amount (₹)',
            render: (row) => formatNumber(row.amount),
          },
          { key: 'step', header: 'Current Step', render: (row) => row.currentStep },
          {
            key: 'status',
            header: 'Status',
            render: (row) => (
              <StatusBadge status={row.status} variant={row.status as ApprovalStatus} />
            ),
          },
          {
            key: 'action',
            header: 'Action',
            render: (row) => (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/approvals/${row.id}`}>Review</Link>
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}

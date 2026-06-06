import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageState } from '@/components/shared/PageState';
import { FilterPills } from '@/components/shared/FilterPills';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { approvalsApi } from '@/api/approvals.api';
import { queryKeys } from '@/api/queryKeys';
import { formatNumber } from '@/lib/formatCurrency';
import type { Approval, ApprovalStatus } from '@/types/approval.types';

const STATUS_FILTERS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export function ApprovalListPage() {
  const [statusFilter, setStatusFilter] = useState('pending');

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.approvals.list(statusFilter),
    queryFn: () => approvalsApi.list({ status: statusFilter, limit: 100 }),
  });

  const approvals = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Approvals"
        subtitle="Review and action pending procurement approvals"
      />

      <div className="mb-6">
        <FilterPills
          options={STATUS_FILTERS}
          active={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <PageState isLoading={isLoading} error={error} isEmpty={!approvals.length}>
        <DataTable<Approval>
          data={approvals}
          getRowKey={(row) => row.id}
          emptyMessage={`No ${statusFilter} approvals`}
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
      </PageState>
    </div>
  );
}

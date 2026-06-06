import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageState } from '@/components/shared/PageState';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { rfqsApi } from '@/api/rfqs.api';
import { queryKeys } from '@/api/queryKeys';
import type { Rfq } from '@/types/rfq.types';

export function RfqListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.rfqs.list(),
    queryFn: () => rfqsApi.list({ limit: 100 }),
  });

  const rfqs = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="RFQs"
        subtitle="Manage requests for quotation"
        action={
          <Button asChild>
            <Link to="/rfqs/new">
              <Plus className="h-4 w-4" />
              Create RFQ
            </Link>
          </Button>
        }
      />

      <PageState isLoading={isLoading} error={error} isEmpty={!rfqs.length}>
        <DataTable<Rfq>
          data={rfqs}
          getRowKey={(row) => row.id}
          columns={[
            { key: 'title', header: 'Title', render: (row) => row.title },
            { key: 'deadline', header: 'Deadline', render: (row) => row.deadline },
            {
              key: 'status',
              header: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'items',
              header: 'Products',
              render: (row) => row.products.length,
            },
            {
              key: 'action',
              header: 'Action',
              render: (row) =>
                row.status === 'published' ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/quotations/compare/${row.id}`}>Compare</Link>
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">Draft</span>
                ),
            },
          ]}
        />
      </PageState>
    </div>
  );
}

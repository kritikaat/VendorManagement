import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { MOCK_RFQS } from '@/data/mockData';
import type { Rfq } from '@/types/rfq.types';

export function RfqListPage() {
  return (
    <div>
      <PageHeader
        title="RFQ's"
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

      <DataTable<Rfq>
        data={MOCK_RFQS}
        getRowKey={(row) => row.id}
        columns={[
          { key: 'title', header: 'Title', render: (row) => row.title },
          { key: 'category', header: 'Category', render: (row) => row.category },
          { key: 'deadline', header: 'Deadline', render: (row) => row.deadline },
          {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
          },
          {
            key: 'items',
            header: 'Line Items',
            render: (row) => row.lineItems.length,
          },
          {
            key: 'action',
            header: 'Action',
            render: (row) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/quotations/compare/${row.id}`}>Compare</Link>
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

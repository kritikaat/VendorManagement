import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { MOCK_RFQS } from '@/data/mockData';
import { USER_ROLES } from '@/types/auth.types';
import { useAuth } from '@/hooks/useAuth';
import type { Rfq } from '@/types/rfq.types';

export function QuotationListPage() {
  const { user } = useAuth();
  const isVendor = user?.role === USER_ROLES.VENDOR;

  return (
    <div>
      <PageHeader
        title="Quotations"
        subtitle={
          isVendor
            ? 'View assigned RFQs and submit your quotations'
            : 'Review and compare vendor quotations'
        }
      />

      <DataTable<Rfq>
        data={MOCK_RFQS.filter((rfq) => rfq.status === 'published')}
        getRowKey={(row) => row.id}
        emptyMessage="No published RFQs available"
        columns={[
          { key: 'title', header: 'RFQ Title', render: (row) => row.title },
          { key: 'category', header: 'Category', render: (row) => row.category },
          { key: 'deadline', header: 'Deadline', render: (row) => row.deadline },
          {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
          },
          {
            key: 'action',
            header: 'Action',
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                {isVendor ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/quotations/submit/${row.id}`}>Submit Quotation</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/quotations/compare/${row.id}`}>Compare</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to={`/quotations/submit/${row.id}`}>View Submit Form</Link>
                    </Button>
                  </>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

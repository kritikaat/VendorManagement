import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageState } from '@/components/shared/PageState';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { rfqsApi } from '@/api/rfqs.api';
import { quotationsApi } from '@/api/quotations.api';
import { queryKeys } from '@/api/queryKeys';
import { formatNumber } from '@/lib/formatCurrency';
import { usePermission } from '@/hooks/usePermission';
import type { Rfq } from '@/types/rfq.types';
import type { QuotationListItem } from '@/api/quotations.api';

export function QuotationListPage() {
  const { can } = usePermission();
  const isVendor = can('quotation:submit');

  const rfqQuery = useQuery({
    queryKey: queryKeys.rfqs.list('published'),
    queryFn: () => rfqsApi.list({ status: 'published', limit: 100 }),
    enabled: isVendor,
  });

  const vendorQuotationsQuery = useQuery({
    queryKey: queryKeys.quotations.vendor,
    queryFn: quotationsApi.listForVendor,
    enabled: isVendor,
  });

  const officerQuotationsQuery = useQuery({
    queryKey: queryKeys.quotations.list({ status: 'submitted' }),
    queryFn: () => quotationsApi.list({ status: 'submitted', limit: 100 }),
    enabled: !isVendor,
  });

  if (isVendor) {
    const rfqs = rfqQuery.data?.items ?? [];
    const isLoading = rfqQuery.isLoading;
    const error = rfqQuery.error;

    return (
      <div>
        <PageHeader
          title="Quotations"
          subtitle="View assigned RFQs and submit your quotations"
        />
        <PageState isLoading={isLoading} error={error} isEmpty={!rfqs.length}>
          <DataTable<Rfq>
            data={rfqs}
            getRowKey={(row) => row.id}
            columns={[
              { key: 'title', header: 'RFQ Title', render: (row) => row.title },
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
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/quotations/submit/${row.id}`}>Submit Quotation</Link>
                  </Button>
                ),
              },
            ]}
          />
        </PageState>

        {(vendorQuotationsQuery.data?.length ?? 0) > 0 ? (
          <div className="mt-8">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Your Submitted Quotations</h3>
            <DataTable<QuotationListItem>
              data={vendorQuotationsQuery.data ?? []}
              getRowKey={(row) => row.id}
              columns={[
                { key: 'rfq', header: 'RFQ', render: (row) => row.rfqTitle },
                {
                  key: 'amount',
                  header: 'Total (₹)',
                  render: (row) => formatNumber(row.totalCost),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => <StatusBadge status={row.status} />,
                },
              ]}
            />
          </div>
        ) : null}
      </div>
    );
  }

  const quotations = officerQuotationsQuery.data?.items ?? [];

  return (
    <div>
      <PageHeader title="Quotations" subtitle="Review submitted vendor quotations" />
      <PageState
        isLoading={officerQuotationsQuery.isLoading}
        error={officerQuotationsQuery.error}
        isEmpty={!quotations.length}
      >
        <DataTable<QuotationListItem>
          data={quotations}
          getRowKey={(row) => row.id}
          columns={[
            { key: 'rfq', header: 'RFQ', render: (row) => row.rfqTitle },
            { key: 'vendor', header: 'Vendor', render: (row) => row.vendorName },
            {
              key: 'amount',
              header: 'Total (₹)',
              render: (row) => formatNumber(row.totalCost),
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'action',
              header: 'Action',
              render: (row) =>
                can('quotation:compare') ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/quotations/compare/${row.rfqId}`}>Compare</Link>
                  </Button>
                ) : null,
            },
          ]}
        />
      </PageState>
    </div>
  );
}

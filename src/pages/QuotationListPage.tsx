import { Link } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
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

  // For admin/officer: fetch all RFQs first, then quotations per RFQ in parallel
  const allRfqsQuery = useQuery({
    queryKey: queryKeys.rfqs.list('all'),
    queryFn: () => rfqsApi.list({ limit: 100 }),
    enabled: !isVendor,
  });

  const rfqIds = allRfqsQuery.data?.items.map((r) => r.id) ?? [];

  const perRfqQueries = useQueries({
    queries: rfqIds.map((rfqId) => ({
      queryKey: queryKeys.quotations.byRfq(rfqId),
      queryFn: () => quotationsApi.listByRfq(rfqId),
      enabled: !isVendor && rfqIds.length > 0,
    })),
  });

  const officerQuotations: QuotationListItem[] = perRfqQueries.flatMap((q) => q.data ?? []);
  const officerLoading = allRfqsQuery.isLoading || perRfqQueries.some((q) => q.isLoading);
  const officerError = allRfqsQuery.error ?? perRfqQueries.find((q) => q.error)?.error ?? null;

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

  const quotations = officerQuotations;

  return (
    <div>
      <PageHeader title="Quotations" subtitle="Review submitted vendor quotations" />
      <PageState
        isLoading={officerLoading}
        error={officerError}
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

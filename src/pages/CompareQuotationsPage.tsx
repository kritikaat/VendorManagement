import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageState } from '@/components/shared/PageState';
import { Button } from '@/components/ui/button';
import { comparisonsApi } from '@/api/comparisons.api';
import { approvalsApi } from '@/api/approvals.api';
import { queryKeys } from '@/api/queryKeys';
import { formatNumber } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import type { QuotationComparison } from '@/types/quotation.types';

const COMPARISON_ROWS: {
  label: string;
  getValue: (quote: QuotationComparison) => string;
}[] = [
  { label: 'Total Cost', getValue: (q) => formatNumber(q.grandTotal) },
  { label: 'Delivery (days)', getValue: (q) => String(q.deliveryDays) },
  { label: 'Vendor rating', getValue: (q) => `${q.rating}/5` },
];

export function CompareQuotationsPage() {
  const { rfqId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.comparisons.detail(rfqId),
    queryFn: () => comparisonsApi.compare(rfqId, 'price'),
    enabled: Boolean(rfqId),
  });

  const createApprovalMutation = useMutation({
    mutationFn: (quotationId: string) =>
      approvalsApi.create({ rfqId, quotationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.list() });
      navigate('/approvals');
    },
  });

  const quotes = data?.quotations ?? [];

  return (
    <div>
      <PageHeader
        title="Quotation Comparison"
        subtitle={
          data
            ? `RFQ: ${data.rfq.title} — ${quotes.length} quotation${quotes.length === 1 ? '' : 's'}`
            : 'Compare vendor quotations'
        }
      />

      <PageState
        isLoading={isLoading}
        error={error}
        isEmpty={!quotes.length}
        emptyMessage="No quotations submitted for this RFQ yet"
      >
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Criteria
                  </th>
                  {quotes.map((quote) => (
                    <th
                      key={quote.vendorId}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold uppercase',
                        quote.isLowest ? 'bg-emerald-50 text-emerald-900' : 'text-slate-500',
                      )}
                    >
                      {quote.vendorName}
                      {quote.isLowest ? ' (Lowest)' : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.label}</td>
                    {quotes.map((quote) => (
                      <td
                        key={quote.vendorId}
                        className={cn(
                          'px-4 py-3',
                          quote.isLowest && 'bg-emerald-50/60 font-medium text-emerald-900',
                        )}
                      >
                        {row.getValue(quote)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="px-4 py-3" />
                  {quotes.map((quote) => (
                    <td
                      key={quote.vendorId}
                      className={cn('px-4 py-4', quote.isLowest && 'bg-emerald-50/60')}
                    >
                      <Button
                        variant={quote.isLowest ? 'default' : 'outline'}
                        size="sm"
                        className="w-full"
                        disabled={!quote.id || createApprovalMutation.isPending}
                        onClick={() => quote.id && createApprovalMutation.mutate(quote.id)}
                      >
                        {createApprovalMutation.isPending
                          ? 'Creating...'
                          : 'Request Approval'}
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {createApprovalMutation.error ? (
          <p className="mt-4 text-sm text-red-600">{createApprovalMutation.error.message}</p>
        ) : null}

        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link to="/rfqs">Back to RFQs</Link>
          </Button>
        </div>
      </PageState>
    </div>
  );
}

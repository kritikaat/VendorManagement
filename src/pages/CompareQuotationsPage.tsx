import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { MOCK_QUOTATION_COMPARISONS, MOCK_RFQ } from '@/data/mockData';
import { formatNumber } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

const COMPARISON_ROWS: {
  label: string;
  getValue: (quote: (typeof MOCK_QUOTATION_COMPARISONS)[number]) => string;
}[] = [
  { label: 'Grand Total', getValue: (q) => formatNumber(q.grandTotal) },
  { label: 'GST %', getValue: (q) => String(q.gstPercent) },
  { label: 'Delivery (days)', getValue: (q) => String(q.deliveryDays) },
  { label: 'Vendor rating', getValue: (q) => `${q.rating}/5` },
  { label: 'Payment terms', getValue: (q) => q.paymentTerms },
];

export function CompareQuotationsPage() {
  return (
    <div>
      <PageHeader
        title="Quotation Comparison"
        subtitle={`RFQ: ${MOCK_RFQ.title.toLowerCase()} — 3 quotations received`}
      />

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                Criteria
              </th>
              {MOCK_QUOTATION_COMPARISONS.map((quote) => (
                <th
                  key={quote.vendorId}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium uppercase',
                    quote.isLowest
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-muted-foreground',
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
              <tr key={row.label} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{row.label}</td>
                {MOCK_QUOTATION_COMPARISONS.map((quote) => (
                  <td
                    key={quote.vendorId}
                    className={cn(
                      'px-4 py-3',
                      quote.isLowest && 'bg-emerald-500/10 font-medium text-emerald-400',
                    )}
                  >
                    {row.getValue(quote)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="px-4 py-3" />
              {MOCK_QUOTATION_COMPARISONS.map((quote) => (
                <td
                  key={quote.vendorId}
                  className={cn('px-4 py-4', quote.isLowest && 'bg-emerald-500/10')}
                >
                  <Button
                    variant={quote.isLowest ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                  >
                    {quote.isLowest ? 'Select & Approve' : 'Select'}
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-red-400">
        Green = lowest price, selecting vendor initiates the approval workflow.
      </p>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link to="/rfqs">Back to RFQ&apos;s</Link>
        </Button>
      </div>
    </div>
  );
}

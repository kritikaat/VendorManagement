import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageState } from '@/components/shared/PageState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { rfqsApi } from '@/api/rfqs.api';
import { quotationsApi } from '@/api/quotations.api';
import { queryKeys } from '@/api/queryKeys';
import { formatNumber } from '@/lib/formatCurrency';

interface PricingRow {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export function SubmitQuotationPage() {
  const { rfqId = '' } = useParams();
  const navigate = useNavigate();
  const [deliveryTimeline, setDeliveryTimeline] = useState(14);
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: rfq, isLoading, error } = useQuery({
    queryKey: queryKeys.rfqs.detail(rfqId),
    queryFn: () => rfqsApi.getById(rfqId),
    enabled: Boolean(rfqId),
  });

  const [rows, setRows] = useState<PricingRow[]>([]);

  const effectiveRows =
    rows.length > 0
      ? rows
      : (rfq?.products ?? []).map((p) => ({
          productName: p.name,
          quantity: p.quantity,
          unitPrice: 0,
        }));

  const grandTotal = useMemo(
    () => effectiveRows.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0),
    [effectiveRows],
  );

  const updateRow = (index: number, field: keyof PricingRow, value: string | number) => {
    setRows((prev) => {
      const base = prev.length > 0 ? prev : effectiveRows;
      const next = [...base];
      const row = next[index];
      if (row) next[index] = { ...row, [field]: value };
      return next;
    });
  };

  const submitMutation = useMutation({
    mutationFn: () =>
      quotationsApi.submit({
        rfqId,
        pricing: effectiveRows.map((row) => ({
          productName: row.productName,
          unitPrice: row.unitPrice,
          quantity: row.quantity,
          totalPrice: row.quantity * row.unitPrice,
        })),
        deliveryTimeline,
        notes: notes || undefined,
      }),
    onSuccess: () => navigate('/quotations'),
    onError: (err: Error) => setSubmitError(err.message),
  });

  return (
    <div>
      <PageHeader
        title="Submit Quotation"
        subtitle={rfq ? `RFQ: ${rfq.title} — deadline ${rfq.deadline}` : 'Submit your quotation'}
      />

      <PageState isLoading={isLoading} error={error}>
        {rfq ? (
          <>
            <div className="mb-6 rounded-lg border border-border bg-card p-4 text-sm">
              <span className="font-medium">RFQ Summary: </span>
              {rfq.products.map((p) => `${p.name} × ${p.quantity}`).join(', ')}
            </div>

            <div className="mb-6 overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-card text-xs uppercase text-muted-foreground">
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Qty</th>
                    <th className="px-4 py-3 text-left">Unit price</th>
                    <th className="px-4 py-3 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {effectiveRows.map((row, index) => (
                    <tr key={`${row.productName}-${index}`} className="border-b border-border">
                      <td className="px-4 py-3">{row.productName}</td>
                      <td className="px-4 py-3">{row.quantity}</td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={row.unitPrice}
                          onChange={(e) => updateRow(index, 'unitPrice', Number(e.target.value))}
                          className="h-8 w-28"
                        />
                      </td>
                      <td className="px-4 py-3">{formatNumber(row.quantity * row.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery">Delivery timeline (days)</Label>
                  <Input
                    id="delivery"
                    type="number"
                    value={deliveryTimeline}
                    onChange={(e) => setDeliveryTimeline(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes / terms</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex justify-between text-base font-semibold">
                  <span>Grand total</span>
                  <span>{formatNumber(grandTotal)}</span>
                </div>
              </div>
            </div>

            {submitError ? <p className="mt-4 text-sm text-red-600">{submitError}</p> : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                disabled={submitMutation.isPending || effectiveRows.some((r) => r.unitPrice <= 0)}
                onClick={() => submitMutation.mutate()}
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Quotation'}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/quotations">Back</Link>
              </Button>
            </div>
          </>
        ) : null}
      </PageState>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MOCK_RFQ, MOCK_SUBMIT_QUOTATION_ITEMS } from '@/data/mockData';
import { formatNumber } from '@/lib/formatCurrency';

interface QuotationRow {
  item: string;
  qty: number;
  unitPrice: number;
  deliveryDays: number;
}

export function SubmitQuotationPage() {
  const [rows, setRows] = useState<QuotationRow[]>(MOCK_SUBMIT_QUOTATION_ITEMS);
  const [gstPercent, setGstPercent] = useState(18);
  const [notes, setNotes] = useState('Payment terms: 20 days net...');

  const subtotal = useMemo(
    () => rows.reduce((sum, row) => sum + row.qty * row.unitPrice, 0),
    [rows],
  );
  const gstAmount = useMemo(() => Math.round(subtotal * (gstPercent / 100)), [subtotal, gstPercent]);
  const grandTotal = subtotal + gstAmount;

  const updateRow = (index: number, field: keyof QuotationRow, value: string | number) => {
    setRows((prev) => {
      const next = [...prev];
      const row = next[index];
      if (row) {
        next[index] = { ...row, [field]: value };
      }
      return next;
    });
  };

  return (
    <div>
      <PageHeader
        title="Submit Quotations"
        subtitle={`RFQ: ${MOCK_RFQ.title.toLowerCase()} — deadline 15 June 2025`}
      />

      <div className="mb-6 rounded-lg border border-border bg-card p-4 text-sm">
        <span className="font-medium">RFQ Summary: </span>
        Ergonomic chair × 25, standing desk × 10 — category {MOCK_RFQ.category.toLowerCase()}
      </div>

      <div className="mb-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3 text-left">Qty</th>
              <th className="px-4 py-3 text-left">Unit price</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Delivery (days)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.item} className="border-b border-border last:border-0">
                <td className="px-4 py-3">{row.item}</td>
                <td className="px-4 py-3">{row.qty}</td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    value={row.unitPrice}
                    onChange={(e) => updateRow(index, 'unitPrice', Number(e.target.value))}
                    className="h-8 w-28"
                  />
                </td>
                <td className="px-4 py-3">{formatNumber(row.qty * row.unitPrice)}</td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    value={row.deliveryDays}
                    onChange={(e) => updateRow(index, 'deliveryDays', Number(e.target.value))}
                    className="h-8 w-20"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gst">Tax / GST %</Label>
            <Input
              id="gst"
              type="number"
              value={gstPercent}
              onChange={(e) => setGstPercent(Number(e.target.value))}
              className="w-24"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Note / terms</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatNumber(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST ({gstPercent}%)</span>
              <span>{formatNumber(gstAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Grand total</span>
              <span>{formatNumber(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button>Submit Quotation</Button>
        <Button variant="outline">Save Draft</Button>
        <Button variant="outline" asChild>
          <Link to="/quotations">Back to list</Link>
        </Button>
      </div>
    </div>
  );
}

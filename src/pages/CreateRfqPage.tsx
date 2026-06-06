import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Upload, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Stepper } from '@/components/shared/Stepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MOCK_RFQ, MOCK_VENDORS } from '@/data/mockData';
import type { RfqLineItem } from '@/types/rfq.types';

const STEPS = [
  { label: 'RFQ Details' },
  { label: 'Line Items & Vendors' },
  { label: 'Review & Send' },
];

export function CreateRfqPage() {
  const [title, setTitle] = useState(MOCK_RFQ.title);
  const [category, setCategory] = useState(MOCK_RFQ.category);
  const [deadline, setDeadline] = useState(MOCK_RFQ.deadline);
  const [description, setDescription] = useState(MOCK_RFQ.description);
  const [lineItems, setLineItems] = useState<RfqLineItem[]>(MOCK_RFQ.lineItems);
  const [assignedVendors, setAssignedVendors] = useState(
    MOCK_VENDORS.filter((v) => MOCK_RFQ.assignedVendorIds.includes(v.id)),
  );

  const removeVendor = (vendorId: string) => {
    setAssignedVendors((prev) => prev.filter((v) => v.id !== vendorId));
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: `li-${Date.now()}`, item: '', qty: 1, unit: 'NOS' },
    ]);
  };

  return (
    <div>
      <PageHeader title="Create RFQ's" subtitle="New request for quotation" />

      <Stepper steps={STEPS} currentStep={1} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="title">RFQ&apos;s title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline *</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-medium">Line Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                    <th className="pb-2 text-left">Item</th>
                    <th className="pb-2 text-left">Qty</th>
                    <th className="pb-2 text-left">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-2">
                        <Input
                          value={item.item}
                          onChange={(e) => {
                            const next = [...lineItems];
                            const row = next[index];
                            if (row) row.item = e.target.value;
                            setLineItems(next);
                          }}
                          className="h-8"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => {
                            const next = [...lineItems];
                            const row = next[index];
                            if (row) row.qty = Number(e.target.value);
                            setLineItems(next);
                          }}
                          className="h-8 w-20"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          value={item.unit}
                          onChange={(e) => {
                            const next = [...lineItems];
                            const row = next[index];
                            if (row) row.unit = e.target.value;
                            setLineItems(next);
                          }}
                          className="h-8 w-20"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" className="mt-4" onClick={addLineItem}>
              <Plus className="h-4 w-4" />
              Add line item
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-medium">Assign Vendors</h3>
            <div className="space-y-2">
              {assignedVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span>{vendor.name}</span>
                  <button
                    type="button"
                    onClick={() => removeVendor(vendor.id)}
                    className="text-muted-foreground hover:text-red-400"
                    aria-label={`Remove ${vendor.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4">
              <Plus className="h-4 w-4" />
              Add vendor
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6 border-t border-border pt-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <Button>Save &amp; Send to Vendors</Button>
          <Button variant="outline">Save as Draft</Button>
          <Button variant="outline" asChild>
            <Link to="/rfqs">Cancel</Link>
          </Button>
        </div>

        <div className="flex h-32 w-full max-w-sm items-center justify-center rounded-lg border border-dashed border-border bg-card text-sm text-muted-foreground lg:w-80">
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload className="h-6 w-6" />
            <span>Drag &amp; drop files or click to upload</span>
          </div>
        </div>
      </div>
    </div>
  );
}

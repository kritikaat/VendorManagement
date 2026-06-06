import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Stepper } from '@/components/shared/Stepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { rfqsApi } from '@/api/rfqs.api';
import { vendorsApi } from '@/api/vendors.api';
import { queryKeys } from '@/api/queryKeys';
import type { RfqProduct } from '@/types/rfq.types';
import type { Vendor } from '@/types/vendor.types';

const STEPS = [
  { label: 'RFQ Details' },
  { label: 'Products & Vendors' },
  { label: 'Review & Send' },
];

export function CreateRfqPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState<RfqProduct[]>([
    { id: 'p-1', name: '', specification: '', quantity: 1 },
  ]);
  const [assignedVendors, setAssignedVendors] = useState<Vendor[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: vendorsData } = useQuery({
    queryKey: queryKeys.vendors.list({ status: 'active' }),
    queryFn: () => vendorsApi.list({ status: 'active', limit: 100 }),
  });

  const availableVendors = (vendorsData?.items ?? []).filter(
    (v) => !assignedVendors.some((a) => a.id === v.id),
  );

  const createMutation = useMutation({
    mutationFn: async (assignVendors: boolean) => {
      if (!title.trim() || !deadline) throw new Error('Title and deadline are required');
      if (products.some((p) => !p.name.trim())) throw new Error('All products must have a name');
      if (assignVendors && assignedVendors.length === 0) {
        throw new Error('Assign at least one vendor before publishing');
      }

      const created = await rfqsApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: new Date(deadline).toISOString(),
        products: products.map(({ name, specification, quantity }) => ({
          name,
          specification: specification || undefined,
          quantity,
        })),
      });

      if (assignVendors) {
        await rfqsApi.assignVendors(
          created.id,
          assignedVendors.map((v) => v.id),
        );
      }
    },
    onSuccess: () => navigate('/rfqs'),
    onError: (err: Error) => setFormError(err.message),
  });

  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      { id: `p-${Date.now()}`, name: '', specification: '', quantity: 1 },
    ]);
  };

  return (
    <div>
      <PageHeader title="Create RFQ" subtitle="New request for quotation" />
      <Stepper steps={STEPS} currentStep={1} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
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
            <h3 className="mb-4 text-sm font-medium">Products</h3>
            <div className="space-y-3">
              {products.map((product, index) => (
                <div key={product.id} className="grid gap-2 rounded border border-border p-3">
                  <Input
                    placeholder="Product name"
                    value={product.name}
                    onChange={(e) => {
                      const next = [...products];
                      const row = next[index];
                      if (row) row.name = e.target.value;
                      setProducts(next);
                    }}
                  />
                  <Input
                    placeholder="Specification"
                    value={product.specification}
                    onChange={(e) => {
                      const next = [...products];
                      const row = next[index];
                      if (row) row.specification = e.target.value;
                      setProducts(next);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={product.quantity}
                    onChange={(e) => {
                      const next = [...products];
                      const row = next[index];
                      if (row) row.quantity = Number(e.target.value);
                      setProducts(next);
                    }}
                  />
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4" onClick={addProduct}>
              <Plus className="h-4 w-4" />
              Add product
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
                    onClick={() =>
                      setAssignedVendors((prev) => prev.filter((v) => v.id !== vendor.id))
                    }
                    className="text-muted-foreground hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {availableVendors.length > 0 ? (
              <select
                className="mt-4 h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                defaultValue=""
                onChange={(e) => {
                  const vendor = availableVendors.find((v) => v.id === e.target.value);
                  if (vendor) setAssignedVendors((prev) => [...prev, vendor]);
                  e.target.value = '';
                }}
              >
                <option value="" disabled>
                  Select vendor
                </option>
                {availableVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        </div>
      </div>

      {formError ? <p className="mt-4 text-sm text-red-600">{formError}</p> : null}

      <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
        <Button disabled={createMutation.isPending} onClick={() => createMutation.mutate(true)}>
          {createMutation.isPending ? 'Saving...' : 'Save & Assign Vendors'}
        </Button>
        <Button
          variant="outline"
          disabled={createMutation.isPending}
          onClick={() => createMutation.mutate(false)}
        >
          Save as Draft
        </Button>
        <Button variant="outline" asChild>
          <Link to="/rfqs">Cancel</Link>
        </Button>
      </div>
    </div>
  );
}

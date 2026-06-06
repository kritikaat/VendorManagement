import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { vendorsApi, type CreateVendorPayload } from '@/api/vendors.api';
import { queryKeys } from '@/api/queryKeys';
import type { Vendor, VendorStatus } from '@/types/vendor.types';

interface DialogShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function DialogShell({ title, onClose, children }: DialogShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const EMPTY_VENDOR_FORM: CreateVendorPayload = {
  companyName: '',
  category: '',
  GSTNumber: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
};

export function AddVendorDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateVendorPayload>(EMPTY_VENDOR_FORM);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () => vendorsApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  const update = (field: keyof CreateVendorPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <DialogShell title="Add Vendor" onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          createMutation.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gst">GST Number *</Label>
            <Input
              id="gst"
              value={form.GSTNumber}
              onChange={(e) => update('GSTNumber', e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input id="city" value={form.city} onChange={(e) => update('city', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input id="state" value={form.state} onChange={(e) => update('state', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              required
            />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Saving...' : 'Create Vendor'}
          </Button>
        </div>
      </form>
    </DialogShell>
  );
}

export function VendorDetailDialog({
  vendorId,
  onClose,
}: {
  vendorId: string;
  onClose: () => void;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.vendors.detail(vendorId),
    queryFn: () => vendorsApi.getById(vendorId),
  });

  return (
    <DialogShell title="Vendor Details" onClose={onClose}>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error.message}</p>
      ) : data ? (
        <dl className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <StatusBadge status={data.status} variant={data.status as VendorStatus} />
            </dd>
          </div>
          <DetailRow label="Company" value={data.name} />
          <DetailRow label="Category" value={data.category} />
          <DetailRow label="GST Number" value={data.gstNumber} />
          <DetailRow label="Phone" value={data.contactNumber} />
          <DetailRow label="Email" value={data.email ?? '—'} />
          <DetailRow label="Address" value={data.address ?? '—'} />
          {data.vendorCode ? <DetailRow label="Vendor Code" value={data.vendorCode} /> : null}
          {data.rating != null ? <DetailRow label="Rating" value={`${data.rating}/5`} /> : null}
        </dl>
      ) : null}
    </DialogShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}

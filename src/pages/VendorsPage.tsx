import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageState } from '@/components/shared/PageState';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterPills } from '@/components/shared/FilterPills';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { AddVendorDialog, VendorDetailDialog } from '@/components/vendors/VendorDialogs';
import { vendorsApi } from '@/api/vendors.api';
import { queryKeys } from '@/api/queryKeys';
import { usePermission } from '@/hooks/usePermission';
import type { Vendor, VendorStatus } from '@/types/vendor.types';

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'blocked' },
];

export function VendorsPage() {
  const { can } = usePermission();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [viewVendorId, setViewVendorId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.vendors.list({ keyword, status: statusFilter }),
    queryFn: () =>
      vendorsApi.list({
        keyword,
        status: statusFilter,
        limit: 100,
      }),
  });

  const vendors = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="Manage supplier profiles and registrations"
        action={
          can('vendor:create') ? (
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4">
        <SearchBar value={keyword} onChange={setKeyword} placeholder="Search by company name..." />
      </div>

      <div className="mb-6">
        <FilterPills options={FILTER_OPTIONS} active={statusFilter} onChange={setStatusFilter} />
      </div>

      <PageState isLoading={isLoading} error={error} isEmpty={!vendors.length}>
        <DataTable<Vendor>
          data={vendors}
          getRowKey={(row) => row.id}
          columns={[
            { key: 'name', header: 'Company', render: (row) => row.name },
            { key: 'category', header: 'Category', render: (row) => row.category },
            { key: 'gst', header: 'GST no.', render: (row) => row.gstNumber },
            { key: 'contact', header: 'Phone', render: (row) => row.contactNumber },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <StatusBadge status={row.status} variant={row.status as VendorStatus} />
              ),
            },
            {
              key: 'action',
              header: 'Action',
              render: (row) => (
                <Button variant="outline" size="sm" onClick={() => setViewVendorId(row.id)}>
                  View
                </Button>
              ),
            },
          ]}
        />
      </PageState>

      {showAdd ? <AddVendorDialog onClose={() => setShowAdd(false)} /> : null}
      {viewVendorId ? (
        <VendorDetailDialog vendorId={viewVendorId} onClose={() => setViewVendorId(null)} />
      ) : null}
    </div>
  );
}

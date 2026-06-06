import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterPills } from '@/components/shared/FilterPills';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { MOCK_VENDORS } from '@/data/mockData';
import { usePermission } from '@/hooks/usePermission';
import type { Vendor, VendorStatus } from '@/types/vendor.types';

const FILTER_OPTIONS = [
  { label: 'All', value: 'all', count: MOCK_VENDORS.length },
  {
    label: 'Active',
    value: 'active',
    count: MOCK_VENDORS.filter((v) => v.status === 'active').length,
  },
  {
    label: 'Pending',
    value: 'pending',
    count: MOCK_VENDORS.filter((v) => v.status === 'pending').length,
  },
  {
    label: 'Blocked',
    value: 'blocked',
    count: MOCK_VENDORS.filter((v) => v.status === 'blocked').length,
  },
];

export function VendorsPage() {
  const { can } = usePermission();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredVendors = useMemo(() => {
    return MOCK_VENDORS.filter((vendor) => {
      const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        vendor.name.toLowerCase().includes(query) ||
        vendor.gstNumber.toLowerCase().includes(query) ||
        vendor.category.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter]);

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="Manage supplier profiles and registrations"
        action={
          can('vendor:create') ? (
            <Button>
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, GST number, category..."
        />
      </div>

      <div className="mb-6">
        <FilterPills options={FILTER_OPTIONS} active={statusFilter} onChange={setStatusFilter} />
      </div>

      <DataTable<Vendor>
        data={filteredVendors}
        getRowKey={(row) => row.id}
        columns={[
          { key: 'name', header: 'Vendor Name', render: (row) => row.name },
          { key: 'category', header: 'Category', render: (row) => row.category },
          { key: 'gst', header: 'GST no.', render: (row) => row.gstNumber },
          { key: 'contact', header: 'Contact no.', render: (row) => row.contactNumber },
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
            render: () => (
              <Button variant="outline" size="sm">
                View
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}

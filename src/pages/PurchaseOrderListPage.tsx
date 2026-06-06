import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { MOCK_PURCHASE_ORDERS } from '@/data/mockData';
import { formatNumber } from '@/lib/formatCurrency';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchaseOrder.types';

export function PurchaseOrderListPage() {
  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        subtitle="Track and manage generated purchase orders"
      />

      <DataTable<PurchaseOrder>
        data={MOCK_PURCHASE_ORDERS}
        getRowKey={(row) => row.id}
        columns={[
          { key: 'po', header: 'PO Number', render: (row) => row.poNumber },
          { key: 'vendor', header: 'Vendor', render: (row) => row.vendor },
          {
            key: 'amount',
            header: 'Amount (₹)',
            render: (row) => formatNumber(row.amount),
          },
          { key: 'issue', header: 'Issue Date', render: (row) => row.issueDate },
          { key: 'delivery', header: 'Delivery Date', render: (row) => row.deliveryDate },
          {
            key: 'status',
            header: 'Status',
            render: (row) => (
              <StatusBadge
                status={row.status}
                variant={row.status === 'approved' ? 'approved' : (row.status as PurchaseOrderStatus)}
              />
            ),
          },
          {
            key: 'action',
            header: 'Action',
            render: (row) => (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/invoices/${row.id}`}>View Invoice</Link>
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}

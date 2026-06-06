import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageState } from '@/components/shared/PageState';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { purchaseOrdersApi } from '@/api/purchaseOrders.api';
import { invoicesApi } from '@/api/invoices.api';
import { queryKeys } from '@/api/queryKeys';
import { formatNumber } from '@/lib/formatCurrency';
import type { PurchaseOrder } from '@/types/purchaseOrder.types';

export function PurchaseOrderListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.purchaseOrders.list(),
    queryFn: () => purchaseOrdersApi.list({ limit: 100 }),
  });

  const { data: invoicesData } = useQuery({
    queryKey: queryKeys.invoices.list(),
    queryFn: () => invoicesApi.list({ limit: 200 }),
  });

  const invoiceIdByPoId = useMemo(() => {
    const map = new Map<string, string>();
    invoicesData?.items?.forEach((invoice) => {
      if (invoice.poId) map.set(invoice.poId, invoice.id);
    });
    return map;
  }, [invoicesData?.items]);

  const orders = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        subtitle="Track and manage generated purchase orders"
      />

      <PageState isLoading={isLoading} error={error} isEmpty={!orders.length}>
        <DataTable<PurchaseOrder>
          data={orders}
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
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'action',
              header: 'Action',
              render: (row) => {
                const invoiceId = invoiceIdByPoId.get(row.id);
                return invoiceId ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/invoices/${invoiceId}`}>View Invoice</Link>
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">No invoice yet</span>
                );
              },
            },
          ]}
        />
      </PageState>
    </div>
  );
}

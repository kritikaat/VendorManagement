import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Mail, Printer } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageState } from '@/components/shared/PageState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { invoicesApi } from '@/api/invoices.api';
import { queryKeys } from '@/api/queryKeys';
import { DataTable } from '@/components/shared/DataTable';
import { downloadBlob } from '@/lib/downloadFile';
import { formatNumber } from '@/lib/formatCurrency';
import { usePermission } from '@/hooks/usePermission';
import type { Invoice, InvoiceStatus } from '@/types/invoice.types';

export function InvoiceListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.invoices.list,
    queryFn: () => invoicesApi.list({ limit: 100 }),
  });

  const invoices = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Manage vendor invoices and payment status"
      />

      <PageState isLoading={isLoading} error={error} isEmpty={!invoices.length}>
        <DataTable<Invoice>
          data={invoices}
          getRowKey={(row) => row.id}
          columns={[
            { key: 'inv', header: 'Invoice #', render: (row) => row.invoiceNumber },
            { key: 'po', header: 'PO Number', render: (row) => row.poNumber },
            { key: 'vendor', header: 'Vendor', render: (row) => row.vendor },
            {
              key: 'amount',
              header: 'Amount (₹)',
              render: (row) => formatNumber(row.amount),
            },
            { key: 'due', header: 'Due Date', render: (row) => row.dueDate },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <StatusBadge status={row.status} variant={row.status as InvoiceStatus} />
              ),
            },
            {
              key: 'action',
              header: 'Action',
              render: (row) => (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/invoices/${row.id}`}>View</Link>
                </Button>
              ),
            },
          ]}
        />
      </PageState>
    </div>
  );
}

export function InvoiceDetailPage() {
  const { id = '' } = useParams();
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => invoicesApi.getById(id),
    enabled: Boolean(id),
  });

  const markPaidMutation = useMutation({
    mutationFn: () => invoicesApi.markPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.list });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (filename: string) => invoicesApi.downloadPdf(id, filename),
    onSuccess: ({ blob, filename }) => {
      setActionError(null);
      downloadBlob(blob, filename);
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const emailMutation = useMutation({
    mutationFn: (email?: string) => invoicesApi.email(id, email),
    onSuccess: () => {
      setActionError(null);
      setActionMessage('Invoice email sent successfully.');
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const handleEmail = () => {
    const defaultEmail = invoice?.vendorDetails?.email;
    const recipient = window.prompt('Recipient email address', defaultEmail ?? '');
    if (recipient === null) return;
    setActionMessage(null);
    emailMutation.mutate(recipient || undefined);
  };

  const status = invoice?.status?.toLowerCase() ?? 'pending';
  const displayStatus =
    status.includes('paid') ? 'paid' : status.includes('overdue') ? 'overdue' : 'pending';

  return (
    <div>
      <PageHeader
        title="Purchase Order & Invoice"
        subtitle={
          invoice
            ? `${invoice.poNumber} — auto-generated after approval`
            : 'Invoice details'
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!invoice || downloadMutation.isPending}
              onClick={() =>
                downloadMutation.mutate(`${invoice?.invoiceNumber ?? 'invoice'}.pdf`)
              }
            >
              <Download className="h-4 w-4" />
              {downloadMutation.isPending ? 'Downloading...' : 'Download PDF'}
            </Button>
            <Button variant="outline" size="sm" disabled={!invoice} onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            {can('invoice:mark-paid') ? (
              <Button
                variant="outline"
                size="sm"
                disabled={!invoice || emailMutation.isPending}
                onClick={handleEmail}
              >
                <Mail className="h-4 w-4" />
                {emailMutation.isPending ? 'Sending...' : 'Email invoice'}
              </Button>
            ) : null}
            <Button variant="outline" size="sm" asChild>
              <Link to="/invoices">Back</Link>
            </Button>
          </div>
        }
      />

      <PageState isLoading={isLoading} error={error}>
        {invoice ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 md:p-8">
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Bill to</h4>
                <p className="mt-2 font-semibold text-slate-900">{invoice.billTo?.name ?? '—'}</p>
                <p className="text-sm text-slate-600">{invoice.billTo?.address ?? '—'}</p>
                {invoice.billTo?.gstin ? (
                  <p className="text-sm text-slate-600">GSTIN: {invoice.billTo.gstin}</p>
                ) : null}
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <h4 className="text-xs font-semibold uppercase text-emerald-700">Vendor</h4>
                <p className="mt-2 font-semibold text-slate-900">
                  {invoice.vendorDetails?.name ?? '—'}
                </p>
                <p className="text-sm text-slate-600">{invoice.vendorDetails?.address ?? '—'}</p>
                {invoice.vendorDetails?.gstin ? (
                  <p className="text-sm text-slate-600">GSTIN: {invoice.vendorDetails.gstin}</p>
                ) : null}
              </div>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-muted-foreground">PO Number</p>
                <p className="font-semibold">{invoice.poNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">PO date</p>
                <p className="font-semibold">
                  {invoice.poDate ? new Date(invoice.poDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Invoice date</p>
                <p className="font-semibold">
                  {invoice.invoiceDate
                    ? new Date(invoice.invoiceDate).toLocaleDateString()
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Due date</p>
                <p className="font-semibold">
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">Item</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">Qty</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">Unit price</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.lineItems ?? []).map((line) => {
                    const name = line.productName ?? line.item ?? 'Item';
                    const qty = line.quantity ?? line.qty ?? 0;
                    const total = line.totalPrice ?? line.total ?? 0;
                    return (
                    <tr key={name} className="border-b border-slate-100">
                      <td className="px-4 py-3">{name}</td>
                      <td className="px-4 py-3">{qty}</td>
                      <td className="px-4 py-3">{formatNumber(line.unitPrice)}</td>
                      <td className="px-4 py-3">{formatNumber(total)}</td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col items-end gap-2 text-sm">
              <div className="flex w-full max-w-xs justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatNumber(invoice.subtotal ?? 0)}</span>
              </div>
              <div className="flex w-full max-w-xs justify-between">
                <span className="text-muted-foreground">CGST</span>
                <span>{formatNumber(invoice.cgst ?? 0)}</span>
              </div>
              <div className="flex w-full max-w-xs justify-between">
                <span className="text-muted-foreground">SGST</span>
                <span>{formatNumber(invoice.sgst ?? 0)}</span>
              </div>
              <div className="flex w-full max-w-xs justify-between border-t border-slate-200 pt-2 text-base font-bold">
                <span>Grand total</span>
                <span className="text-emerald-700">{formatNumber(invoice.grandTotal)}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={displayStatus} variant={displayStatus as InvoiceStatus} />
              </div>
              {can('invoice:mark-paid') && displayStatus !== 'paid' ? (
                <button
                  type="button"
                  className="text-sm font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                  disabled={markPaidMutation.isPending}
                  onClick={() => markPaidMutation.mutate()}
                >
                  {markPaidMutation.isPending ? 'Updating...' : 'Mark as Paid'}
                </button>
              ) : null}
            </div>

            {actionMessage ? (
              <p className="mt-2 text-sm text-emerald-700">{actionMessage}</p>
            ) : null}
            {actionError ? <p className="mt-2 text-sm text-red-600">{actionError}</p> : null}
            {markPaidMutation.error ? (
              <p className="mt-2 text-sm text-red-600">{markPaidMutation.error.message}</p>
            ) : null}
          </div>
        ) : null}
      </PageState>
    </div>
  );
}

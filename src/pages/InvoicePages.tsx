import { Link } from 'react-router-dom';
import { Download, Mail, Printer } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { MOCK_INVOICES } from '@/data/mockData';
import { DataTable } from '@/components/shared/DataTable';
import { formatNumber } from '@/lib/formatCurrency';
import type { Invoice, InvoiceStatus } from '@/types/invoice.types';

export function InvoiceListPage() {
  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Manage vendor invoices and payment status"
      />

      <DataTable<Invoice>
        data={MOCK_INVOICES}
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
    </div>
  );
}

export function InvoiceDetailPage() {
  const invoice = {
    ...MOCK_INVOICES[0]!,
    detail: {
      poDate: '21 May, 2025',
      invoiceDate: '22 May 2025',
      billTo: {
        name: 'Your Organization Name',
        address: '123 Business Park, Ahmedabad',
        gstin: '25383438AFB',
      },
      vendor: {
        name: 'Infra supplies pvt ltd',
        address: '456, Industrial Estate, Surat',
        gstin: '343434DB4523',
      },
      lineItems: [
        { item: 'Ergonomic chair', qty: 25, unitPrice: 3500, total: 87500 },
        { item: 'Standing desk', qty: 10, unitPrice: 8200, total: 82000 },
      ],
      subtotal: 169500,
      cgst: 15255,
      sgst: 15255,
      grandTotal: 200010,
    },
  };

  return (
    <div>
      <PageHeader
        title="Purchase Order & Invoice"
        subtitle={`${invoice.poNumber} — auto-generated after approval`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4" />
              Email invoice
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/invoices">Back</Link>
            </Button>
          </div>
        }
      />

      <div className="rounded-lg border border-slate-200 bg-white p-6 md:p-8">
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Bill to</h4>
            <p className="mt-2 font-semibold text-slate-900">{invoice.detail.billTo.name}</p>
            <p className="text-sm text-slate-600">{invoice.detail.billTo.address}</p>
            <p className="text-sm text-slate-600">GSTIN: {invoice.detail.billTo.gstin}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <h4 className="text-xs font-semibold uppercase text-emerald-700">Vendor</h4>
            <p className="mt-2 font-semibold text-slate-900">{invoice.detail.vendor.name}</p>
            <p className="text-sm text-slate-600">{invoice.detail.vendor.address}</p>
            <p className="text-sm text-slate-600">GSTIN: {invoice.detail.vendor.gstin}</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-muted-foreground">PO Number</p>
            <p className="font-semibold">{invoice.poNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">PO date</p>
            <p className="font-semibold">{invoice.detail.poDate}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Invoice date</p>
            <p className="font-semibold">{invoice.detail.invoiceDate}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Due date</p>
            <p className="font-semibold">{invoice.dueDate}</p>
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
              {invoice.detail.lineItems.map((line) => (
                <tr key={line.item} className="border-b border-slate-100">
                  <td className="px-4 py-3">{line.item}</td>
                  <td className="px-4 py-3">{line.qty}</td>
                  <td className="px-4 py-3">{formatNumber(line.unitPrice)}</td>
                  <td className="px-4 py-3">{formatNumber(line.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col items-end gap-2 text-sm">
          <div className="flex w-full max-w-xs justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatNumber(invoice.detail.subtotal)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between">
            <span className="text-muted-foreground">CGST (9%)</span>
            <span>{formatNumber(invoice.detail.cgst)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between">
            <span className="text-muted-foreground">SGST (9%)</span>
            <span>{formatNumber(invoice.detail.sgst)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between border-t border-slate-200 pt-2 text-base font-bold">
            <span>Grand total</span>
            <span className="text-emerald-700">{formatNumber(invoice.detail.grandTotal)}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status="Pending Payment" variant="pending" />
          </div>
          <button type="button" className="text-sm font-semibold text-blue-600 hover:underline">
            Mark as Paid
          </button>
        </div>
      </div>
    </div>
  );
}

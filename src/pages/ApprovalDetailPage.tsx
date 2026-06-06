import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MOCK_APPROVAL_DETAIL } from '@/data/mockData';
import { formatNumber } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

export function ApprovalDetailPage() {
  const [remarks, setRemarks] = useState('');
  const detail = MOCK_APPROVAL_DETAIL;

  return (
    <div>
      <PageHeader
        title="Approval Workflow"
        subtitle={`RFQ: ${detail.rfqTitle} — Vendor: ${detail.vendor} — ₹${formatNumber(detail.amount)}`}
        action={
          <Button variant="outline" asChild>
            <Link to="/approvals">Back to list</Link>
          </Button>
        }
      />

      <div className="mb-8 flex items-center gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-6">
        {detail.steps.map((step, index) => (
          <div key={step.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2 text-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold',
                  step.status === 'completed' && 'bg-emerald-500 text-white',
                  step.status === 'current' && 'bg-amber-400 text-white ring-4 ring-amber-100',
                  step.status === 'upcoming' && 'bg-slate-100 text-slate-400',
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  step.status === 'current' ? 'text-amber-600' : 'text-slate-500',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < detail.steps.length - 1 ? (
              <div
                className={cn(
                  'mx-2 h-0.5 flex-1',
                  step.status === 'completed' ? 'bg-emerald-400' : 'bg-slate-200',
                )}
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-slate-900">Approval Chain</h3>
            <div className="space-y-4">
              {detail.chain.map((person) => (
                <div key={person.name} className="flex gap-3">
                  <div
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      person.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-blue-100 text-blue-600',
                    )}
                  >
                    {person.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{person.name}</p>
                    <p className="text-xs text-muted-foreground">{person.role}</p>
                    <p className="mt-1 text-sm text-slate-600">{person.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <Label htmlFor="remarks">Approval Remarks</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add your comments or conditions..."
              className="mt-2 border-slate-200"
              rows={4}
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-emerald-50/50 p-6">
          <h3 className="mb-4 font-semibold text-slate-900">Quotations Summary</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Vendor</dt>
              <dd className="font-medium text-slate-900">{detail.quotation.vendor}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-bold text-emerald-700">
                ₹{formatNumber(detail.quotation.total)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="font-medium">{detail.quotation.delivery}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Rating</dt>
              <dd className="font-medium">{detail.quotation.rating}</dd>
            </div>
          </dl>

          <div className="mt-8 flex gap-3">
            <Button className="flex-1">Approve</Button>
            <Button variant="destructive" className="flex-1">
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageState } from '@/components/shared/PageState';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { approvalsApi } from '@/api/approvals.api';
import { queryKeys } from '@/api/queryKeys';
import { formatNumber } from '@/lib/formatCurrency';
import { usePermission } from '@/hooks/usePermission';
import { cn } from '@/lib/utils';

interface TimelineStep {
  stage?: string;
  label?: string;
  status?: string;
  remarks?: string;
  actorName?: string;
  actedAt?: string;
}

interface ApprovalTimeline {
  _id?: string;
  id?: string;
  status: string;
  rfqTitle?: string;
  vendorName?: string;
  amount?: number;
  deliveryTimeline?: number;
  remarks?: string;
  timeline?: TimelineStep[];
  chain?: TimelineStep[];
}

export function ApprovalDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [remarks, setRemarks] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const { can } = usePermission();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.approvals.timeline(id),
    queryFn: () => approvalsApi.getTimeline(id) as Promise<ApprovalTimeline>,
    enabled: Boolean(id),
  });

  const approveMutation = useMutation({
    mutationFn: () => approvalsApi.approve(id, remarks || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.list() });
      navigate('/approvals');
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: () => approvalsApi.reject(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.list() });
      navigate('/approvals');
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const steps = data?.timeline ?? data?.chain ?? [];
  const status = data?.status?.toLowerCase() ?? 'pending';

  return (
    <div>
      <PageHeader
        title="Approval Workflow"
        subtitle={
          data
            ? `RFQ: ${data.rfqTitle ?? '—'} — Vendor: ${data.vendorName ?? '—'} — ₹${formatNumber(data.amount ?? 0)}`
            : 'Approval details'
        }
        action={
          <Button variant="outline" asChild>
            <Link to="/approvals">Back to list</Link>
          </Button>
        }
      />

      <PageState isLoading={isLoading} error={error}>
        {data ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-slate-900">Approval Timeline</h3>
              <div className="space-y-4">
                {steps.length ? (
                  steps.map((step, i) => (
                    <div key={`${step.stage ?? step.label}-${i}`} className="flex gap-3">
                      <div
                        className={cn(
                          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                          step.status?.toLowerCase() === 'approved'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-blue-100 text-blue-600',
                        )}
                      >
                        {step.status?.toLowerCase() === 'approved' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {step.label ?? step.stage ?? `Step ${i + 1}`}
                        </p>
                        {step.actorName ? (
                          <p className="text-xs text-muted-foreground">{step.actorName}</p>
                        ) : null}
                        {step.remarks ? (
                          <p className="mt-1 text-sm text-slate-600">{step.remarks}</p>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No timeline events yet.</p>
                )}
              </div>

              <div className="mt-6">
                <Label htmlFor="remarks">Approval Remarks</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add your comments or conditions..."
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-emerald-50/50 p-6">
              <h3 className="mb-4 font-semibold text-slate-900">Summary</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Vendor</dt>
                  <dd className="font-medium">{data.vendorName ?? '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd className="font-bold text-emerald-700">₹{formatNumber(data.amount ?? 0)}</dd>
                </div>
                {data.deliveryTimeline != null ? (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd>{data.deliveryTimeline} days</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="capitalize">{status}</dd>
                </div>
              </dl>

              {actionError ? <p className="mt-4 text-sm text-red-600">{actionError}</p> : null}

              {can('approval:approve') && status === 'pending' ? (
                <div className="mt-8 flex gap-3">
                  <Button
                    className="flex-1"
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    onClick={() => approveMutation.mutate()}
                  >
                    {approveMutation.isPending ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={
                      !remarks.trim() || approveMutation.isPending || rejectMutation.isPending
                    }
                    onClick={() => rejectMutation.mutate()}
                  >
                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                  </Button>
                </div>
              ) : (
                <p className="mt-6 text-sm text-slate-500">
                  {status !== 'pending'
                    ? `This approval is ${status}.`
                    : 'Only assigned approvers can approve or reject.'}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </PageState>
    </div>
  );
}

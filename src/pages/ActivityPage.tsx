import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, FileText, Receipt, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageState } from '@/components/shared/PageState';
import { FilterPills } from '@/components/shared/FilterPills';
import { logsApi } from '@/api/logs.api';
import { queryKeys } from '@/api/queryKeys';
import type { ActivityEventType } from '@/types/activity.types';
import { cn } from '@/lib/utils';

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'RFQ', value: 'RFQ_CREATED' },
  { label: 'Quotations', value: 'QUOTATION_SUBMITTED' },
  { label: 'Approvals', value: 'APPROVAL' },
  { label: 'Invoices', value: 'INVOICE' },
];

const ICON_MAP: Record<ActivityEventType, { icon: typeof CheckCircle2; color: string }> = {
  quotation: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
  approval: { icon: Clock, color: 'bg-blue-100 text-blue-600' },
  rfq: { icon: FileText, color: 'bg-violet-100 text-violet-600' },
  vendor: { icon: UserPlus, color: 'bg-rose-100 text-rose-600' },
  invoice: { icon: Receipt, color: 'bg-amber-100 text-amber-600' },
};

export function ActivityPage() {
  const [filter, setFilter] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.logs.list(filter),
    queryFn: () => logsApi.list({ action: filter, limit: 100 }),
  });

  const logs = data?.items ?? [];

  return (
    <div>
      <PageHeader title="Activity & Logs" subtitle="Procurement audit trail" />

      <div className="mb-6">
        <FilterPills options={FILTER_OPTIONS} active={filter} onChange={setFilter} />
      </div>

      <PageState isLoading={isLoading} error={error} isEmpty={!logs.length}>
        <div className="rounded-lg border border-slate-200 bg-white">
          {logs.map((log, index) => {
            const { icon: Icon, color } = ICON_MAP[log.type];
            return (
              <div
                key={log.id}
                className={cn(
                  'flex gap-4 px-6 py-5',
                  index < logs.length - 1 && 'border-b border-slate-100',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {log.title}
                    <span className="font-normal text-slate-600"> — {log.description}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{log.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </PageState>

      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        Audit logs are immutable — write-once records with no edit or delete.
      </p>
    </div>
  );
}

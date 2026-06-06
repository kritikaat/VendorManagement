import { cn } from '@/lib/utils';

type StatusVariant = 'active' | 'pending' | 'blocked' | 'paid' | 'overdue' | 'draft' | 'published' | 'approved' | 'rejected';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  blocked: 'border-red-200 bg-red-50 text-red-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  overdue: 'border-red-200 bg-red-50 text-red-700',
  draft: 'border-slate-200 bg-slate-100 text-slate-600',
  published: 'border-blue-200 bg-blue-50 text-blue-700',
};

function inferVariant(status: string): StatusVariant {
  const normalized = status.toLowerCase();
  if (normalized in VARIANT_CLASSES) {
    return normalized as StatusVariant;
  }
  return 'pending';
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const resolved = variant ?? inferVariant(status);

  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
        VARIANT_CLASSES[resolved],
      )}
    >
      {status}
    </span>
  );
}

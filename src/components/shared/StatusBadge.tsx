import { cn } from '@/lib/utils';

type StatusVariant = 'active' | 'pending' | 'blocked' | 'paid' | 'overdue' | 'draft' | 'published';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  active: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
  pending: 'border-orange-500/50 bg-orange-500/10 text-orange-400',
  blocked: 'border-red-500/50 bg-red-500/10 text-red-400',
  paid: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
  overdue: 'border-red-500/50 bg-red-500/10 text-red-400',
  draft: 'border-border bg-secondary text-muted-foreground',
  published: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
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
        'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        VARIANT_CLASSES[resolved],
      )}
    >
      {status}
    </span>
  );
}

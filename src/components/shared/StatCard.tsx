import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  colorClass?: string;
}

export function StatCard({ label, value, colorClass = 'text-foreground' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className={cn('text-2xl font-semibold', colorClass)}>{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

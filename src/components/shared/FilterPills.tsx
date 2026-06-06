import { cn } from '@/lib/utils';

interface FilterPillsProps {
  options: { label: string; value: string; count?: number }[];
  active: string;
  onChange: (value: string) => void;
}

export function FilterPills({ options, active, onChange }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm transition-colors',
            active === option.value
              ? 'border-emerald-500/50 bg-emerald-500/10 text-foreground'
              : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground',
          )}
        >
          {option.label}
          {option.count !== undefined ? ` (${option.count})` : ''}
        </button>
      ))}
    </div>
  );
}

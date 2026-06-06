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
            'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
            active === option.value
              ? 'border-emerald-700 bg-emerald-700 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
          )}
        >
          {option.label}
          {option.count !== undefined ? ` (${option.count})` : ''}
        </button>
      ))}
    </div>
  );
}

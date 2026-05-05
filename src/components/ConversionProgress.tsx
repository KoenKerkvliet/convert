import { cn } from '@/lib/utils';

interface ConversionProgressProps {
  total: number;
  done: number;
  currentName?: string;
}

export function ConversionProgress({ total, done, currentName }: ConversionProgressProps) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((done / total) * 100));
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">
          {done < total ? 'Bezig met converteren…' : 'Klaar!'}
        </p>
        <p className="text-sm font-medium text-brand">
          {done} / {total} ({pct}%)
        </p>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-300 via-brand to-brand-500 transition-all duration-300',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {currentName && (
        <p className="mt-3 truncate text-xs text-slate-500">
          {done < total ? '↳ ' : ''}
          {currentName}
        </p>
      )}
    </div>
  );
}

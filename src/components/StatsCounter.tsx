import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface StatsCounterProps {
  sessionCount: number;
}

// Stub for the global "X afbeeldingen geconverteerd" counter.
// A backend (e.g. Supabase) is needed to make this truly global; for now we
// blend a placeholder baseline with the current session count so the UI is in
// place. Wiring this to a real endpoint is a one-line swap in fetchTotal().
async function fetchTotal(): Promise<number | null> {
  // const res = await fetch('https://<project>.supabase.co/rest/v1/...');
  // return res.ok ? Number((await res.json()).count) : null;
  return null;
}

export function StatsCounter({ sessionCount }: StatsCounterProps) {
  const [serverTotal, setServerTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTotal().then((value) => {
      if (!cancelled) setServerTotal(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const baseline = serverTotal ?? 0;
  const total = baseline + sessionCount;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-white p-6 text-center shadow-card">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-brand-700 shadow-soft">
        <Sparkles className="h-3.5 w-3.5" />
        Gemaakt met liefde voor pixels
      </div>
      <p className="mt-4 text-4xl font-bold text-slate-900 tabular-nums sm:text-5xl">
        {total.toLocaleString('nl-NL')}
      </p>
      <p className="mt-1 text-sm text-slate-600">afbeeldingen geconverteerd</p>
      {serverTotal === null && sessionCount > 0 && (
        <p className="mt-2 text-xs text-slate-400">
          Sessie-teller — totaalcijfer wordt geactiveerd zodra de teller-backend live is.
        </p>
      )}
    </div>
  );
}

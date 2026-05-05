import { useState } from 'react';
import { Archive, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { ResultCard } from './ResultCard';
import { Button } from './ui/Button';
import type { ConvertedImage } from '@/lib/converter';
import { buildZip } from '@/lib/zip';
import { downloadBlob } from '@/lib/utils';

interface ResultsListProps {
  results: ConvertedImage[];
  errors: { name: string; message: string }[];
  onReset: () => void;
}

export function ResultsList({ results, errors, onReset }: ResultsListProps) {
  const [zipping, setZipping] = useState(false);
  if (!results.length && !errors.length) return null;

  const handleZip = async () => {
    setZipping(true);
    try {
      const blob = await buildZip(results);
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `imageconverter-${stamp}.zip`);
    } finally {
      setZipping(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <h3 className="text-lg font-semibold text-slate-900">
            Resultaten ({results.length})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Opnieuw beginnen
          </Button>
          <Button onClick={handleZip} disabled={!results.length || zipping}>
            {zipping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            Download alles als ZIP
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">{errors.length} bestand{errors.length === 1 ? '' : 'en'} kon niet worden geconverteerd:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((err, i) => (
              <li key={i}>
                <span className="font-medium">{err.name}</span> — {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((img) => (
          <ResultCard key={img.previewUrl} image={img} />
        ))}
      </div>
    </section>
  );
}

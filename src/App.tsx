import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UploadArea } from './components/UploadArea';
import { FileQueue, type QueueItem } from './components/FileQueue';
import { OptionsPanel } from './components/OptionsPanel';
import { ConversionProgress } from './components/ConversionProgress';
import { ResultsList } from './components/ResultsList';
import { Button } from './components/ui/Button';
import { convertImage, type ConvertOptions, type ConvertedImage } from './lib/converter';
import { fileId } from './lib/utils';

interface ConversionError {
  name: string;
  message: string;
}

const DEFAULT_OPTIONS: ConvertOptions = {
  targetFormat: 'webp',
  quality: 0.85,
  keepAspectRatio: true,
  maxWidth: undefined,
  maxHeight: undefined,
  renamePattern: '',
};

export default function App() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [options, setOptions] = useState<ConvertOptions>(DEFAULT_OPTIONS);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, currentName: '' });
  const [results, setResults] = useState<ConvertedImage[]>([]);
  const [errors, setErrors] = useState<ConversionError[]>([]);
  const [sessionCount, setSessionCount] = useState(0);

  // Revoke preview URLs on unmount or when results are cleared
  useEffect(() => {
    return () => {
      results.forEach((r) => URL.revokeObjectURL(r.previewUrl));
    };
  }, [results]);

  const addFiles = useCallback((files: File[]) => {
    setQueue((prev) => {
      const existing = new Set(prev.map((p) => `${p.file.name}__${p.file.size}__${p.file.lastModified}`));
      const additions: QueueItem[] = [];
      for (const file of files) {
        const key = `${file.name}__${file.size}__${file.lastModified}`;
        if (existing.has(key)) continue;
        existing.add(key);
        additions.push({ id: fileId(file), file });
      }
      return [...prev, ...additions];
    });
  }, []);

  const removeQueueItem = (id: string) => setQueue((prev) => prev.filter((q) => q.id !== id));
  const clearQueue = () => setQueue([]);

  const handleReset = () => {
    results.forEach((r) => URL.revokeObjectURL(r.previewUrl));
    setQueue([]);
    setResults([]);
    setErrors([]);
    setProgress({ done: 0, total: 0, currentName: '' });
  };

  const startConversion = async () => {
    if (!queue.length || isConverting) return;
    setIsConverting(true);
    results.forEach((r) => URL.revokeObjectURL(r.previewUrl));
    setResults([]);
    setErrors([]);

    const total = queue.length;
    setProgress({ done: 0, total, currentName: queue[0]?.file.name ?? '' });

    const newResults: ConvertedImage[] = [];
    const newErrors: ConversionError[] = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      setProgress({ done: i, total, currentName: item.file.name });
      try {
        const out = await convertImage(item.file, options, i);
        newResults.push(out);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Onbekende fout';
        newErrors.push({ name: item.file.name, message });
      }
    }

    setResults(newResults);
    setErrors(newErrors);
    setSessionCount((c) => c + newResults.length);
    setProgress({ done: total, total, currentName: '' });
    setIsConverting(false);
  };

  const canConvert = queue.length > 0 && !isConverting;
  const showProgress = isConverting || (progress.total > 0 && progress.done > 0 && results.length === 0 && errors.length === 0);

  const queueLabel = useMemo(() => {
    if (!queue.length) return 'Geen bestanden';
    return `${queue.length} bestand${queue.length === 1 ? '' : 'en'} klaar om te converteren`;
  }, [queue.length]);

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <section className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Converteer afbeeldingen{' '}
            <span className="bg-gradient-to-r from-brand to-brand-600 bg-clip-text text-transparent">
              direct in je browser
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
            Upload één of meerdere bestanden, kies je formaat en opties, en download het resultaat.
            Geen uploads naar een server — je bestanden verlaten je apparaat niet.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          <div className="space-y-4">
            <UploadArea onFiles={addFiles} hasFiles={queue.length > 0} />
            <FileQueue items={queue} onRemove={removeQueueItem} onClear={clearQueue} />
          </div>
          <div className="space-y-4">
            <OptionsPanel options={options} onChange={setOptions} disabled={isConverting} />
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
              <p className="mb-3 text-sm text-slate-600">{queueLabel}</p>
              <Button size="lg" className="w-full" onClick={startConversion} disabled={!canConvert}>
                {isConverting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {isConverting ? 'Bezig…' : 'Convert'}
              </Button>
            </div>
          </div>
        </div>

        {showProgress && (
          <div className="mt-6">
            <ConversionProgress total={progress.total} done={progress.done} currentName={progress.currentName} />
          </div>
        )}

        {(results.length > 0 || errors.length > 0) && !isConverting && (
          <div className="mt-10">
            <ResultsList results={results} errors={errors} onReset={handleReset} />
          </div>
        )}
      </main>
      <Footer sessionCount={sessionCount} />
    </div>
  );
}

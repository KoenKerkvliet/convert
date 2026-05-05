import { useCallback, useRef, useState, type DragEvent } from 'react';
import { ImagePlus, UploadCloud } from 'lucide-react';
import { Button } from './ui/Button';
import { ACCEPT_ATTRIBUTE, isAcceptedFile } from '@/lib/formats';
import { cn } from '@/lib/utils';

interface UploadAreaProps {
  onFiles: (files: File[]) => void;
  hasFiles: boolean;
}

export function UploadArea({ onFiles, hasFiles }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const accepted = Array.from(list).filter(isAcceptedFile);
      if (accepted.length) onFiles(accepted);
    },
    [onFiles],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        'relative rounded-2xl border-2 border-dashed bg-white px-6 py-12 text-center transition-colors',
        dragOver ? 'border-brand bg-brand-50' : 'border-slate-200 hover:border-brand/60',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand">
          <UploadCloud className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {hasFiles ? 'Voeg meer afbeeldingen toe' : 'Sleep afbeeldingen hierheen'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Of klik om te selecteren — JPG, PNG, WebP, AVIF, GIF, SVG, TIFF, BMP, ICO, HEIC/HEIF
          </p>
        </div>
        <Button onClick={() => inputRef.current?.click()} size="lg">
          <ImagePlus className="h-4 w-4" />
          {hasFiles ? 'Meer toevoegen' : 'Bestanden kiezen'}
        </Button>
        <p className="text-xs text-slate-400">Bulk uploads worden ondersteund — alles draait lokaal in je browser.</p>
      </div>
    </div>
  );
}

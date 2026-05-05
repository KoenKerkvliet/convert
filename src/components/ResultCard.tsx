import { Download } from 'lucide-react';
import { Button } from './ui/Button';
import type { ConvertedImage } from '@/lib/converter';
import { downloadBlob, formatBytes, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ResultCardProps {
  image: ConvertedImage;
}

export function ResultCard({ image }: ResultCardProps) {
  const smaller = image.delta < 0;
  const same = Math.abs(image.delta) < 0.001;
  const badgeClass = same
    ? 'bg-slate-100 text-slate-600'
    : smaller
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-amber-50 text-amber-700';

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card animate-fade-in">
      <div className="aspect-square w-full overflow-hidden bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0]">
        <img src={image.previewUrl} alt={image.fileName} className="h-full w-full object-contain" />
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="truncate text-sm font-semibold text-slate-900" title={image.fileName}>
            {image.fileName}
          </p>
          <p className="text-xs text-slate-500">
            {image.width} × {image.height} · {image.format.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {formatBytes(image.originalSize)} → {formatBytes(image.newSize)}
          </span>
          <span className={cn('rounded-full px-2 py-0.5 font-semibold', badgeClass)}>
            {same ? 'gelijk' : `${formatPercent(image.delta)} ${smaller ? 'kleiner' : 'groter'}`}
          </span>
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => downloadBlob(image.blob, image.fileName)}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}

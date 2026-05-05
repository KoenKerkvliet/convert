import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { formatBytes } from '@/lib/utils';

export interface QueueItem {
  id: string;
  file: File;
}

interface FileQueueProps {
  items: QueueItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function FileQueue({ items, onRemove, onClear }: FileQueueProps) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          {items.length} bestand{items.length === 1 ? '' : 'en'} klaar
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Wis lijst
        </Button>
      </div>
      <ul className="scrollbar-thin max-h-56 divide-y divide-slate-100 overflow-y-auto">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{item.file.name}</p>
              <p className="text-xs text-slate-500">{formatBytes(item.file.size)}</p>
            </div>
            <button
              type="button"
              aria-label={`Verwijder ${item.file.name}`}
              onClick={() => onRemove(item.id)}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

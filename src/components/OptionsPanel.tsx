import { Settings2 } from 'lucide-react';
import { Input } from './ui/Input';
import { Switch } from './ui/Switch';
import { TARGET_FORMATS, type TargetFormat } from '@/lib/formats';
import type { ConvertOptions } from '@/lib/converter';
import { cn } from '@/lib/utils';

interface OptionsPanelProps {
  options: ConvertOptions;
  onChange: (next: ConvertOptions) => void;
  disabled?: boolean;
}

export function OptionsPanel({ options, onChange, disabled }: OptionsPanelProps) {
  const targetInfo = TARGET_FORMATS.find((f) => f.id === options.targetFormat)!;
  const update = (patch: Partial<ConvertOptions>) => onChange({ ...options, ...patch });

  return (
    <div className={cn('rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card', disabled && 'opacity-60')}>
      <div className="mb-4 flex items-center gap-2">
        <Settings2 className="h-5 w-5 text-brand" />
        <h3 className="text-base font-semibold text-slate-900">Opties</h3>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Doelformaat</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
            {TARGET_FORMATS.map((f) => {
              const active = options.targetFormat === f.id;
              return (
                <button
                  type="button"
                  key={f.id}
                  disabled={disabled}
                  onClick={() => update({ targetFormat: f.id as TargetFormat })}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                    active
                      ? 'border-brand bg-brand text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand/60 hover:text-brand',
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          {targetInfo.note && <p className="mt-2 text-xs text-slate-500">ⓘ {targetInfo.note}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="quality" className="text-sm font-medium text-slate-700">
              Kwaliteit
            </label>
            <span className="text-sm font-semibold text-brand">{Math.round(options.quality * 100)}%</span>
          </div>
          <input
            id="quality"
            type="range"
            min={10}
            max={100}
            step={1}
            value={Math.round(options.quality * 100)}
            disabled={disabled || !targetInfo.supportsQuality}
            onChange={(e) => update({ quality: Number(e.target.value) / 100 })}
            className="w-full"
          />
          {!targetInfo.supportsQuality && (
            <p className="mt-1 text-xs text-slate-500">{targetInfo.label} ondersteunt geen kwaliteitsinstelling.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="maxW" className="mb-2 block text-sm font-medium text-slate-700">
              Max breedte (px)
            </label>
            <Input
              id="maxW"
              type="number"
              min={0}
              placeholder="Geen limiet"
              value={options.maxWidth ?? ''}
              disabled={disabled}
              onChange={(e) => update({ maxWidth: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) })}
            />
          </div>
          <div>
            <label htmlFor="maxH" className="mb-2 block text-sm font-medium text-slate-700">
              Max hoogte (px)
            </label>
            <Input
              id="maxH"
              type="number"
              min={0}
              placeholder="Geen limiet"
              value={options.maxHeight ?? ''}
              disabled={disabled}
              onChange={(e) => update({ maxHeight: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) })}
            />
          </div>
        </div>

        <Switch
          id="aspect"
          checked={options.keepAspectRatio}
          onChange={(checked) => update({ keepAspectRatio: checked })}
          label="Behoud aspect ratio"
          disabled={disabled}
        />

        <div>
          <label htmlFor="rename" className="mb-2 block text-sm font-medium text-slate-700">
            Hernoem (optioneel)
          </label>
          <Input
            id="rename"
            type="text"
            placeholder="Bijv. design-pixels-{n}"
            value={options.renamePattern ?? ''}
            disabled={disabled}
            onChange={(e) => update({ renamePattern: e.target.value })}
          />
          <p className="mt-1 text-xs text-slate-500">
            Gebruik <code className="rounded bg-slate-100 px-1">{'{name}'}</code>,{' '}
            <code className="rounded bg-slate-100 px-1">{'{n}'}</code> of{' '}
            <code className="rounded bg-slate-100 px-1">{'{index}'}</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import type { DayAvailability, TimeRange } from '../types';
import { WEEKDAY_LABELS, dayIsValid } from '../schedule';
import Toggle from '@/ui/Toggle';

interface Props {
  day: DayAvailability;
  onToggle: (enabled: boolean) => void;
  onChangeRange: (index: number, range: TimeRange) => void;
  onAddRange: () => void;
  onRemoveRange: (index: number) => void;
  onCopyToWorkdays: () => void;
}

const timeInputCls =
  'flex-1 min-w-0 bg-navy/60 border border-amber/20 text-cream rounded-xl px-2.5 py-2.5 text-sm [color-scheme:dark] ' +
  'focus:outline-none focus:border-amber/60 focus:ring-2 focus:ring-amber/10 transition-all';

export default function DayRow({
  day, onToggle, onChangeRange, onAddRange, onRemoveRange, onCopyToWorkdays,
}: Props) {
  const invalid = !dayIsValid(day);

  return (
    <div className={`day-row flex flex-col h-full min-h-[8.5rem] p-4 rounded-2xl bg-navy-mid border border-amber-dim border-l-[3px] ${day.enabled ? 'border-l-amber' : 'border-l-navy-light'} transition-colors hover:bg-navy-card`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Toggle checked={day.enabled} onChange={onToggle} label={`Activar ${WEEKDAY_LABELS[day.weekday]}`} />
          <span className={day.enabled ? 'text-cream font-medium' : 'text-muted font-medium'}>
            {WEEKDAY_LABELS[day.weekday]}
          </span>
        </div>
        {!day.enabled && <span className="text-subtle text-sm">No disponible</span>}
      </div>

      {day.enabled && (
        <div className="mt-4 flex-1 flex flex-col">
          <div className="space-y-2">
          {day.ranges.map((range, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="time"
                value={range.start}
                onChange={(e) => onChangeRange(i, { ...range, start: e.target.value })}
                className={timeInputCls}
                aria-label="Hora de inicio"
              />
              <span className="text-subtle text-sm">a</span>
              <input
                type="time"
                value={range.end}
                onChange={(e) => onChangeRange(i, { ...range, end: e.target.value })}
                className={timeInputCls}
                aria-label="Hora de fin"
              />
              <button
                onClick={() => onRemoveRange(i)}
                aria-label="Eliminar tramo"
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {invalid && (
            <p className="text-red-400 text-xs">Cada tramo debe terminar después de su inicio y los tramos no pueden solaparse.</p>
          )}
          </div>

          <div className="flex items-center gap-4 mt-auto pt-3">
            <button
              onClick={onAddRange}
              className="inline-flex items-center gap-1.5 min-h-11 text-amber text-sm font-medium hover:text-amber-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 rounded-lg cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Añadir tramo
            </button>
            <button
              onClick={onCopyToWorkdays}
              className="inline-flex items-center min-h-11 text-muted text-sm hover:text-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 rounded-lg cursor-pointer"
            >
              Copiar a L–V
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

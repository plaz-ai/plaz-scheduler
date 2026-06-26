'use client';

import type { CallType } from '../types';
import { DURATIONS, LOCATIONS } from '../types';
import Toggle from '@/ui/Toggle';

interface Props {
  callType: CallType;
  duplicateSlug?: boolean;
  onChange: (patch: Partial<CallType>) => void;
  onRemove: () => void;
}

const fieldCls =
  'bg-navy/60 border border-amber/20 text-cream rounded-xl px-3 py-2.5 text-sm ' +
  'placeholder:text-subtle focus:outline-none focus:border-amber/60 focus:ring-2 focus:ring-amber/10 transition-all';

export default function CallTypeRow({ callType, duplicateSlug, onChange, onRemove }: Props) {
  const nameInvalid = callType.name.trim().length === 0;

  return (
    <div className={`calltype-row @container p-4 rounded-2xl bg-navy-mid border border-amber-dim border-l-[3px] ${callType.active ? 'border-l-amber' : 'border-l-navy-light'} transition-colors hover:bg-navy-card`}>
      <div className="flex flex-col @sm:flex-row @sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Toggle
            checked={callType.active}
            onChange={(active) => onChange({ active })}
            label={`Activar tipo ${callType.name || 'sin nombre'}`}
          />

          <input
            type="text"
            value={callType.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Nombre del tipo de llamada"
            className={`${fieldCls} flex-1 min-w-0`}
            aria-label="Nombre"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={callType.duration_minutes}
            onChange={(e) => onChange({ duration_minutes: Number(e.target.value) })}
            className={`${fieldCls} flex-1 @sm:flex-none [color-scheme:dark]`}
            aria-label="Duración"
          >
            {DURATIONS.map((d) => (
              <option key={d} value={d}>{d} min</option>
            ))}
          </select>

          <button
            onClick={onRemove}
            aria-label="Eliminar tipo de llamada"
            className="flex-none inline-flex items-center justify-center w-11 h-11 rounded-xl text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-subtle text-xs">/agenda/</span>
        <span className={callType.slug ? 'text-muted text-xs' : 'text-subtle text-xs italic'}>
          {callType.slug || 'se-genera-del-nombre'}
        </span>
      </div>

      {/* Ubicación + descripción (≈ location/description del event-type de cal.com) */}
      <div className="flex flex-col @sm:flex-row gap-2 mt-3">
        <select
          value={callType.location}
          onChange={(e) => onChange({ location: e.target.value as CallType['location'] })}
          className={`${fieldCls} flex-none [color-scheme:dark]`}
          aria-label="Ubicación de la llamada"
        >
          {LOCATIONS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={callType.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Descripción (opcional, se muestra al reservar)"
          className={`${fieldCls} flex-1 min-w-0`}
          aria-label="Descripción"
        />
      </div>

      {nameInvalid && (
        <p className="text-red-400 text-xs mt-2">El nombre no puede estar vacío.</p>
      )}
      {!nameInvalid && duplicateSlug && (
        <p className="text-red-400 text-xs mt-2">
          Este enlace (/agenda/{callType.slug}) ya lo usa otro tipo. Cambia el nombre.
        </p>
      )}
    </div>
  );
}

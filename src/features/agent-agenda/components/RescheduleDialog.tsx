'use client';

import { useEffect } from 'react';
import type { AvailabilityResponse } from '../../agenda/types';

interface Props {
  currentLabel: string;            // descripción de la cita actual (fecha/hora)
  slots: AvailabilityResponse | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  onPick: (newSlotUtc: string) => void;
  onClose: () => void;
}

export default function RescheduleDialog({
  currentLabel, slots, loading, error, submitting, onPick, onClose,
}: Props) {
  // Cerrar con Escape (HIG: salida fácil de un diálogo modal).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const days = slots?.available_days ?? [];
  const hasSlots = days.some((d) => d.slots.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-navy/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Reprogramar cita"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto bg-navy-mid border border-amber-dim rounded-t-3xl sm:rounded-3xl p-6"
      >
        <div className="flex items-start justify-between gap-4 mb-1">
          <h2 className="font-display text-2xl text-cream">Reprogramar cita</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex-none inline-flex items-center justify-center w-11 h-11 -mr-2 -mt-2 rounded-xl text-muted hover:text-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-muted text-sm mb-6">Actual: {currentLabel}. Elige un nuevo horario.</p>

        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-navy-light/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
        )}

        {!loading && !error && !hasSlots && (
          <p className="text-muted text-sm py-8 text-center">No hay horarios disponibles para reprogramar.</p>
        )}

        {!loading && !error && hasSlots && (
          <div className="space-y-5">
            {days.filter((d) => d.slots.length > 0).map((day) => (
              <section key={day.date}>
                <h3 className="text-amber text-xs font-semibold uppercase tracking-widest mb-2">{day.label}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {day.slots.map((s) => (
                    <button
                      key={s.start_utc}
                      type="button"
                      onClick={() => onPick(s.start_utc)}
                      disabled={submitting}
                      className="min-h-11 rounded-xl bg-navy-light/50 hover:bg-amber hover:text-navy text-cream border border-amber-dim text-sm font-medium transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
                    >
                      {s.start_madrid}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

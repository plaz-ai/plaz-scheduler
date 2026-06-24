'use client';

import { useState } from 'react';
import { CaretLeft, CircleNotch, ArrowRight } from '@phosphor-icons/react';
import type { SelectedSlot, RescheduleOriginal } from '../types';

interface Props {
  original: RescheduleOriginal;
  selected: SelectedSlot;
  durationMinutes: number;
  onBack: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function RescheduleConfirm({ original, selected, durationMinutes, onBack, onConfirm }: Props) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
    } catch {
      setError('No pudimos reagendar la cita. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="step-panel">
      <button
        onClick={onBack}
        className="form-field inline-flex items-center gap-1.5 text-muted text-sm hover:text-cream transition-colors mb-8 cursor-pointer active:scale-[0.98] rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
      >
        <CaretLeft className="w-4 h-4" weight="regular" />
        Elegir otro horario
      </button>

      <div className="md:grid md:grid-cols-[2fr_3fr] md:gap-x-10 lg:gap-x-14 md:items-start">
        {/* Left — heading */}
        <div className="form-field mb-8 md:mb-0 md:pt-1">
          <h2 className="font-display font-black text-4xl md:text-5xl text-cream tracking-tighter leading-[0.92] mb-4">
            Nuevo<br />horario.
          </h2>
          {original.title && (
            <p className="text-cream text-sm font-semibold mt-4">{original.title}</p>
          )}
        </div>

        {/* Right — antes/después + motivo */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="form-field space-y-3">
            <div>
              <p className="text-subtle text-[9px] uppercase tracking-widest mb-1">Horario actual</p>
              <p className="text-muted text-sm line-through decoration-cream/30 capitalize">{original.start_madrid}</p>
            </div>
            <div className="flex items-center gap-2 text-amber">
              <ArrowRight className="w-4 h-4" weight="bold" />
              <span className="text-[10px] uppercase tracking-widest">Nuevo</span>
            </div>
            <div>
              <p className="text-cream text-sm font-medium capitalize">{selected.day.label}</p>
              <p className="font-mono text-amber text-sm">
                {selected.slot.start_madrid}
                <span className="text-subtle mx-2">·</span>
                <span className="text-muted">{durationMinutes} min</span>
              </p>
            </div>
          </div>

          <div className="form-field relative pt-5 pb-1.5 border-b border-cream/15 focus-within:border-amber transition-colors duration-200">
            <label className="absolute left-0 top-0 text-[10px] text-amber tracking-widest uppercase font-medium pointer-events-none">
              Motivo del cambio (opcional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full bg-transparent text-cream text-base py-1 focus:outline-none resize-none placeholder:text-cream/20"
            />
          </div>

          {error && (
            <p className="form-field text-red-400 text-sm border-l-2 border-red-400/40 pl-3 py-0.5">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="form-field w-full bg-amber hover:bg-amber-hover disabled:opacity-50 disabled:cursor-not-allowed text-on-amber font-semibold py-4 transition-colors duration-200 text-sm cursor-pointer active:scale-[0.98] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                Reagendando...
              </span>
            ) : (
              'Confirmar nuevo horario'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

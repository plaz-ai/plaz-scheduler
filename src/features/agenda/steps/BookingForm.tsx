'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { SelectedSlot, BookingPayload } from '../types';

gsap.registerPlugin(useGSAP);

interface Props {
  selected: SelectedSlot;
  linkToken: string;
  durationMinutes: number;
  onBack: () => void;
  onConfirm: (payload: BookingPayload) => Promise<void>;
}

export default function BookingForm({ selected, linkToken, durationMinutes, onBack, onConfirm }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useGSAP(
    () => {
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;
      gsap.from('.form-field', {
        y: 16,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      });
    },
    { scope: ref }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (!cleanName || !cleanEmail) {
      setError('Escribe tu nombre y tu email para confirmar.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm({
        link_token: linkToken,
        slot_utc: selected.slot.start_utc,
        duration_minutes: durationMinutes,
        booker_name: cleanName,
        booker_email: cleanEmail,
      });
    } catch {
      setError('No pudimos confirmar la reserva. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div ref={ref} className="step-panel max-w-md mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-cream transition-colors mb-8 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Cambiar horario
      </button>

      {/* Selected slot summary */}
      <div className="form-field p-4 rounded-2xl bg-amber-soft border border-amber/25 mb-8">
        <p className="text-amber text-xs font-semibold uppercase tracking-wider mb-1">
          Tu cita
        </p>
        <p className="text-cream font-semibold">{selected.day.label}</p>
        <p className="text-cream/75 text-sm mt-0.5">
          {selected.slot.start_madrid} · {durationMinutes} minutos
        </p>
      </div>

      <h1 className="form-field font-display text-3xl text-cream mb-1">Casi listo</h1>
      <p className="form-field text-muted text-sm mb-8">
        Solo necesitamos tus datos para confirmar la reserva
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="form-field">
          <label htmlFor="booker-name" className="block text-cream/70 text-xs font-medium mb-2 uppercase tracking-wider">
            Nombre completo
          </label>
          <input
            id="booker-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: María García"
            className="w-full bg-navy/60 border border-amber/20 text-cream rounded-xl px-4 py-3.5 text-sm placeholder:text-subtle focus:outline-none focus:border-amber/60 focus:ring-2 focus:ring-amber/10 transition-all"
          />
        </div>

        <div className="form-field">
          <label htmlFor="booker-email" className="block text-cream/70 text-xs font-medium mb-2 uppercase tracking-wider">
            Email
          </label>
          <input
            id="booker-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="maria@ejemplo.com"
            className="w-full bg-navy/60 border border-amber/20 text-cream rounded-xl px-4 py-3.5 text-sm placeholder:text-subtle focus:outline-none focus:border-amber/60 focus:ring-2 focus:ring-amber/10 transition-all"
          />
        </div>

        {error && (
          <p role="alert" className="form-field text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="form-field w-full bg-amber hover:bg-amber-hover disabled:opacity-60 disabled:cursor-not-allowed text-navy font-semibold py-4 rounded-xl transition-colors duration-200 text-sm cursor-pointer mt-2"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Confirmando...
            </span>
          ) : (
            'Confirmar reserva'
          )}
        </button>
      </form>
    </div>
  );
}

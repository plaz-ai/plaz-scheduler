'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CaretLeft, CircleNotch } from '@phosphor-icons/react';
import type { SelectedSlot, BookingPayload } from '../types';

gsap.registerPlugin(useGSAP);

interface FloatingInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  autoComplete?: string;
}

function FloatingInput({ label, type, value, onChange, hint, autoComplete }: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className={[
      'relative pt-5 pb-1.5 border-b transition-colors duration-200',
      focused ? 'border-amber' : 'border-cream/15',
    ].join(' ')}>
      <label className={[
        'absolute left-0 pointer-events-none transition-all duration-200',
        floated
          ? 'top-0 text-[10px] text-amber tracking-widest uppercase font-medium'
          : 'top-5 text-sm text-cream/35',
      ].join(' ')}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? (hint ?? '') : ''}
        autoComplete={autoComplete}
        className="w-full bg-transparent text-cream text-base py-1 focus:outline-none placeholder:text-cream/20"
      />
    </div>
  );
}

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
      gsap.from('.form-field', {
        y: 14,
        opacity: 0,
        duration: 0.38,
        stagger: 0.09,
        ease: 'power2.out',
      });
    },
    { scope: ref }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm({
        link_token: linkToken,
        slot_utc: selected.slot.start_utc,
        duration_minutes: durationMinutes,
        booker_name: name.trim(),
        booker_email: email.trim(),
      });
    } catch {
      setError('No pudimos confirmar la reserva. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div ref={ref} className="step-panel">
      {/* Back button — full width, above the grid */}
      <button
        onClick={onBack}
        className="form-field inline-flex items-center gap-1.5 text-muted text-sm hover:text-cream transition-colors mb-8 cursor-pointer active:scale-[0.98]"
      >
        <CaretLeft className="w-4 h-4" weight="regular" />
        Cambiar horario
      </button>

      <div className="md:grid md:grid-cols-[2fr_3fr] md:gap-x-10 lg:gap-x-14 md:items-start">

        {/* Left — heading + slot summary */}
        <div className="form-field mb-8 md:mb-0 md:pt-1">
          <h2 className="font-display font-black text-4xl md:text-5xl text-cream tracking-tighter leading-[0.92] mb-4">
            Casi<br />listo.
          </h2>
          <p className="text-muted text-sm leading-relaxed mt-4">
            <span className="text-cream font-medium">{selected.day.label}</span>
            <br />
            <span className="font-mono text-amber">{selected.slot.start_madrid}</span>
            <span className="text-subtle mx-2">·</span>
            {durationMinutes}&thinsp;min
          </p>
        </div>

        {/* Right — form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="form-field">
            <FloatingInput
              label="Nombre completo"
              type="text"
              value={name}
              onChange={setName}
              hint="María García"
              autoComplete="name"
            />
          </div>

          <div className="form-field">
            <FloatingInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              hint="maria@ejemplo.com"
              autoComplete="email"
            />
          </div>

          {error && (
            <p className="form-field text-red-400 text-sm border-l-2 border-red-400/40 pl-3 py-0.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="form-field w-full bg-amber hover:bg-amber-hover disabled:opacity-50 disabled:cursor-not-allowed text-navy font-semibold py-4 transition-colors duration-200 text-sm cursor-pointer active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                Confirmando...
              </span>
            ) : (
              'Confirmar reserva'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { CaretLeft, CircleNotch, VideoCamera } from '@phosphor-icons/react';
import type { SelectedSlot, BookingPayload, EventType } from '../types';

interface FloatingInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  autoComplete?: string;
  required?: boolean;
  multiline?: boolean;
  error?: string;
  onBlurValidate?: (value: string) => void;
}

function FloatingInput({ label, type, value, onChange, hint, autoComplete, required, multiline, error, onBlurValidate }: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  const shared = 'w-full bg-transparent text-cream text-base py-1 focus:outline-none placeholder:text-cream/20';
  const inputId = `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const errorId = `${inputId}-err`;

  return (
    <div className={[
      'relative pt-5 pb-1.5 border-b transition-colors duration-200',
      error ? 'border-red-400/60' : focused ? 'border-amber' : 'border-cream/15',
    ].join(' ')}>
      <label
        htmlFor={inputId}
        className={[
          'absolute left-0 pointer-events-none transition-all duration-200',
          floated
            ? `top-0 text-[10px] ${error ? 'text-red-400' : 'text-amber'} tracking-widest uppercase font-medium`
            : 'top-5 text-sm text-cream/35',
        ].join(' ')}>
        {label}{required ? ' *' : ''}
      </label>
      {multiline ? (
        <textarea
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlurValidate?.(value); }}
          placeholder={focused ? (hint ?? '') : ''}
          required={required}
          rows={2}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${shared} resize-none`}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlurValidate?.(value); }}
          placeholder={focused ? (hint ?? '') : ''}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={shared}
        />
      )}
      {error && (
        <p id={errorId} role="alert" className="text-red-400 text-[11px] mt-1 leading-tight">
          {error}
        </p>
      )}
    </div>
  );
}

interface Props {
  selected: SelectedSlot;
  linkToken: string;
  durationMinutes: number;
  eventType?: EventType | null;
  onBack: () => void;
  onConfirm: (payload: BookingPayload) => Promise<void>;
}

export default function BookingForm({ selected, linkToken, durationMinutes, eventType, onBack, onConfirm }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const questions = eventType?.questions ?? [];

  function validateEmail(val: string) {
    if (!val.trim()) { setEmailError(null); return; }
    setEmailError(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? null : 'Introduce un email válido');
  }

  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    !emailError &&
    questions.filter(q => q.required).every(q => (answers[q.id] ?? '').trim().length > 0);

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
        ...(questions.length ? { answers } : {}),
      });
    } catch {
      setError('No pudimos confirmar la reserva. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="step-panel">
      {/* Back button — full width, above the grid */}
      <button
        onClick={onBack}
        className="form-field inline-flex items-center gap-1.5 text-muted text-sm hover:text-cream transition-colors mb-8 cursor-pointer active:scale-[0.98] rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
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
          {eventType && (
            <p className="text-cream text-sm font-semibold mt-4">{eventType.title}</p>
          )}
          <p className="text-muted text-sm leading-relaxed mt-1">
            <span className="text-cream font-medium">{selected.day.label}</span>
            <br />
            <span className="font-mono text-amber">{selected.slot.start_madrid}</span>
            <span className="text-subtle mx-2">·</span>
            {durationMinutes}&thinsp;min
          </p>
          {eventType && (
            <p className="flex items-center gap-2 text-muted text-xs mt-3">
              <VideoCamera className="w-3.5 h-3.5 text-amber/70 flex-none" weight="regular" />
              {eventType.location_label}
            </p>
          )}
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
              required
            />
          </div>

          <div className="form-field">
            <FloatingInput
              label="Email"
              type="email"
              value={email}
              onChange={(v) => { setEmail(v); if (emailError) validateEmail(v); }}
              onBlurValidate={validateEmail}
              hint="maria@ejemplo.com"
              autoComplete="email"
              required
              error={emailError ?? undefined}
            />
          </div>

          {/* Preguntas personalizadas del tipo de evento (clon cal.com) */}
          {questions.map((q) => (
            <div className="form-field" key={q.id}>
              <FloatingInput
                label={q.label}
                type={q.type === 'tel' ? 'tel' : 'text'}
                multiline={q.type === 'textarea'}
                required={q.required}
                value={answers[q.id] ?? ''}
                onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                hint={q.placeholder}
              />
            </div>
          ))}

          {error && (
            <p className="form-field text-red-400 text-sm border-l-2 border-red-400/40 pl-3 py-0.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="form-field w-full bg-amber hover:bg-amber-hover disabled:opacity-40 disabled:cursor-not-allowed text-on-amber font-semibold py-4 transition-colors duration-200 text-sm cursor-pointer active:scale-[0.98] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
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

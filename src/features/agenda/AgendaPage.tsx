'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { fetchAvailability, createBooking } from './api';
import type {
  AvailabilityResponse,
  AvailableDay,
  TimeSlot,
  SelectedSlot,
  BookingPayload,
  BookingResult,
  EventType,
} from './types';
import SlotPicker from './steps/SlotPicker';
import BookingForm from './steps/BookingForm';
import SuccessScreen from './steps/SuccessScreen';
import EventTypePicker from './steps/EventTypePicker';
import { Clock, Globe, CalendarBlank } from '@phosphor-icons/react';

gsap.registerPlugin(useGSAP);

// Iniciales para el avatar del organizador ("Equipo Comercial" → "EC").
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '·';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: 'Seleccionar horario',
  2: 'Tus datos',
  3: 'Confirmado',
};

interface Props {
  token: string;
}

export default function AgendaPage({ token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedSlot | null>(null);
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [eventType, setEventType] = useState<EventType | null>(null);

  // Tipos de evento (clon cal.com). Si el backend no los envía (producción),
  // la lista queda vacía y el selector se omite: el flujo es el de siempre.
  const eventTypes = data?.event_types ?? [];
  const needsEventTypeChoice = eventTypes.length > 1 && !eventType;
  const effectiveDuration = eventType?.length_minutes ?? data?.duration_minutes ?? 0;

  // Clip-path wipe reveal on every step/state change
  useGSAP(
    () => {
      const panel = containerRef.current?.querySelector('.step-panel');
      if (!panel) return;
      gsap.fromTo(
        panel,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.45, ease: 'power2.out' }
      );
    },
    { scope: containerRef, dependencies: [step, loadError, data, eventType] }
  );

  useEffect(() => {
    fetchAvailability(token)
      .then(setData)
      .catch(() => setLoadError('No pudimos cargar la disponibilidad. Verifica el link.'));
  }, [token]);

  function animateOut(next: Step) {
    const panel = containerRef.current?.querySelector('.step-panel');
    if (!panel) { setStep(next); return; }
    gsap.to(panel, {
      clipPath: 'inset(0 0 0 100%)',
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => setStep(next),
    });
  }

  function handleSlotSelect(day: AvailableDay, slot: TimeSlot) {
    setSelected({ day, slot });
    animateOut(2);
  }

  function handleEventTypeSelect(et: EventType) {
    const panel = containerRef.current?.querySelector('.step-panel');
    if (!panel) { setEventType(et); return; }
    gsap.to(panel, {
      clipPath: 'inset(0 0 0 100%)',
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => setEventType(et),
    });
  }

  async function handleConfirm(payload: BookingPayload) {
    const result = await createBooking(payload);
    setBooking(result);
    animateOut(3);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-navy">

      {/* ── Left panel ── */}
      <aside className="
        flex-none md:w-64 lg:w-72
        md:sticky md:top-0 md:h-[100dvh]
        flex md:flex-col
        items-center md:items-start
        justify-between md:justify-start
        px-6 py-5 md:px-8 md:py-10
        border-b md:border-b-0 md:border-r border-cream/[0.06]
      ">
        {/* Wordmark */}
        <span className="font-display text-xl font-black tracking-tight text-cream select-none">
          Plaz<span className="text-amber">.</span>
        </span>

        {/* Organizer context — desktop only (estilo cal.com) */}
        {data && (
          <div className="hidden md:block mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex-none w-9 h-9 rounded-full border border-amber/35 flex items-center justify-center text-amber text-xs font-bold">
                {initials(data.team_name)}
              </span>
              <span className="text-cream text-sm font-medium leading-tight">{data.team_name}</span>
            </div>

            <div className="space-y-2.5 pt-1">
              <p className="flex items-center gap-2.5 text-muted text-xs">
                <CalendarBlank className="w-3.5 h-3.5 text-amber/70 flex-none" weight="regular" />
                <span className="truncate">
                  {booking ? 'Cita confirmada' : eventType ? eventType.title : 'Elige tu reunión'}
                </span>
              </p>
              <p className="flex items-center gap-2.5 text-muted text-xs">
                <Clock className="w-3.5 h-3.5 text-amber/70 flex-none" weight="regular" />
                {effectiveDuration} min
              </p>
              <p className="flex items-center gap-2.5 text-muted text-xs">
                <Globe className="w-3.5 h-3.5 text-amber/70 flex-none" weight="regular" />
                <span className="truncate">Horario de Madrid</span>
              </p>
            </div>

            {/* Cambiar tipo de reunión — solo antes de elegir horario */}
            {eventType && eventTypes.length > 1 && step === 1 && !booking && (
              <button
                onClick={() => { setEventType(null); setSelected(null); }}
                className="text-subtle text-[11px] hover:text-cream transition-colors underline underline-offset-4"
              >
                Cambiar tipo de reunión
              </button>
            )}
          </div>
        )}

        <div className="hidden md:flex flex-1" />

        {/* Step counter */}
        <div className="flex md:flex-col items-baseline gap-2 md:gap-0">
          <span className="font-display font-black text-3xl md:text-5xl text-cream leading-none">
            {needsEventTypeChoice ? '·' : String(step).padStart(2, '0')}
          </span>
          {!needsEventTypeChoice && <span className="text-subtle text-sm md:mt-1">/&thinsp;03</span>}
        </div>

        {/* Step label — desktop only */}
        <p className="hidden md:block text-subtle text-[10px] mt-2 uppercase tracking-widest">
          {needsEventTypeChoice ? 'Tipo de reunión' : STEP_LABELS[step]}
        </p>
      </aside>

      {/* ── Right panel ── */}
      <div className="flex-1 relative flex flex-col min-h-0">
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid pointer-events-none" />

        {/* Step watermark */}
        <div
          className="absolute top-0 right-0 font-display font-black leading-[0.85] select-none pointer-events-none text-cream/[0.028] hidden md:block overflow-hidden"
          style={{ fontSize: 'clamp(120px, 17vw, 210px)' }}
          aria-hidden="true"
        >
          {String(step).padStart(2, '0')}
        </div>

        {/* Content */}
        <main ref={containerRef} className="flex-1 relative z-10 px-6 md:px-8 lg:px-10 py-8 md:py-10">

          {/* Loading skeleton — matches calendar layout */}
          {!data && !loadError && (
            <div className="step-panel">
              <div className="mb-8 space-y-3">
                <div className="h-12 w-48 bg-navy-mid rounded animate-pulse" />
                <div className="h-3 w-24 bg-navy-mid rounded animate-pulse" />
              </div>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:max-w-[300px] flex-none md:pr-8">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-8 h-8 bg-navy-mid rounded-lg animate-pulse" />
                    <div className="h-3 w-24 bg-navy-mid rounded animate-pulse" />
                    <div className="w-8 h-8 bg-navy-mid rounded-lg animate-pulse" />
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {[...Array(35)].map((_, i) => (
                      <div key={i} className="aspect-square rounded-lg bg-navy-mid animate-pulse" style={{ opacity: i < 4 ? 0 : 0.5 }} />
                    ))}
                  </div>
                </div>
                <div className="hidden md:block md:pl-8 md:max-w-[220px] w-full space-y-1.5 pt-10">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-9 bg-navy-mid rounded-lg animate-pulse" style={{ opacity: 0.4 }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {loadError && (
            <div className="step-panel py-20">
              <p className="text-red-400 text-base mb-2">{loadError}</p>
              <p className="text-subtle text-sm">Si el problema persiste, contactanos directamente.</p>
            </div>
          )}

          {/* Link expired / exhausted */}
          {data && (data.link_expired || data.link_exhausted) && (
            <div className="step-panel py-20">
              <p className="text-cream text-base mb-3">
                {data.link_expired
                  ? 'Este link de agenda ha expirado.'
                  : 'Este link ya no tiene citas disponibles.'}
              </p>
              <p className="text-subtle text-sm">Contactanos directamente para coordinar una cita.</p>
            </div>
          )}

          {/* Step 0 — event type picker (clon cal.com) */}
          {data && !data.link_expired && !data.link_exhausted && needsEventTypeChoice && (
            <EventTypePicker eventTypes={eventTypes} onSelect={handleEventTypeSelect} />
          )}

          {/* Step 1 — slot picker */}
          {data && !data.link_expired && !data.link_exhausted && !needsEventTypeChoice && step === 1 && (
            <SlotPicker
              data={data}
              selectedSlotUtc={selected?.slot.start_utc}
              onSelect={handleSlotSelect}
            />
          )}

          {/* Step 2 — booking form */}
          {data && !data.link_expired && !data.link_exhausted && !needsEventTypeChoice && step === 2 && selected && (
            <BookingForm
              selected={selected}
              linkToken={token}
              durationMinutes={effectiveDuration}
              eventType={eventType}
              onBack={() => animateOut(1)}
              onConfirm={handleConfirm}
            />
          )}

          {/* Step 3 — success */}
          {step === 3 && booking && <SuccessScreen booking={booking} eventType={eventType} />}
        </main>

        {/* Footer */}
        <footer className="relative z-10 px-6 md:px-8 lg:px-10 pb-6 md:pb-8">
          <p className="text-subtle text-[10px]">
            Horas en horario de Madrid · Plaz {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}

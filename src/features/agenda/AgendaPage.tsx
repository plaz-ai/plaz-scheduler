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
} from './types';
import SlotPicker from './steps/SlotPicker';
import BookingForm from './steps/BookingForm';
import SuccessScreen from './steps/SuccessScreen';

gsap.registerPlugin(useGSAP);

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
    { scope: containerRef, dependencies: [step, loadError, data] }
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

        {/* Team name — desktop only */}
        {data && (
          <p className="hidden md:block text-muted text-[10px] mt-5 uppercase tracking-widest font-medium">
            {data.team_name}
          </p>
        )}

        <div className="hidden md:flex flex-1" />

        {/* Step counter */}
        <div className="flex md:flex-col items-baseline gap-2 md:gap-0">
          <span className="font-display font-black text-3xl md:text-5xl text-cream leading-none">
            {String(step).padStart(2, '0')}
          </span>
          <span className="text-subtle text-sm md:mt-1">/&thinsp;03</span>
        </div>

        {/* Step label — desktop only */}
        <p className="hidden md:block text-subtle text-[10px] mt-2 uppercase tracking-widest">
          {STEP_LABELS[step]}
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

          {/* Loading skeleton */}
          {!data && !loadError && (
            <div className="step-panel space-y-6 pt-2">
              <div className="h-14 w-52 bg-navy-mid rounded animate-pulse" />
              <div className="h-3 w-32 bg-navy-mid rounded animate-pulse" />
              <div className="flex gap-3 mt-10 border-b border-cream/[0.08] pb-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 px-3">
                    <div className="h-2 w-5 bg-navy-mid rounded animate-pulse" />
                    <div className="h-7 w-7 bg-navy-mid rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-xs">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-navy-mid rounded animate-pulse" />
                ))}
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

          {/* Step 1 — slot picker */}
          {data && !data.link_expired && !data.link_exhausted && step === 1 && (
            <SlotPicker
              data={data}
              selectedSlotUtc={selected?.slot.start_utc}
              onSelect={handleSlotSelect}
            />
          )}

          {/* Step 2 — booking form */}
          {data && !data.link_expired && !data.link_exhausted && step === 2 && selected && (
            <BookingForm
              selected={selected}
              linkToken={token}
              durationMinutes={data.duration_minutes}
              onBack={() => animateOut(1)}
              onConfirm={handleConfirm}
            />
          )}

          {/* Step 3 — success */}
          {step === 3 && booking && <SuccessScreen booking={booking} />}
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

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

  // Animate in whenever the current step renders
  useGSAP(
    () => {
      const panel = containerRef.current?.querySelector('.step-panel');
      if (!panel) return;
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        gsap.set(panel, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        panel,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
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
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!panel || reduce) { setStep(next); return; }
    gsap.to(panel, {
      opacity: 0,
      y: -12,
      duration: 0.2,
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
    <div className="min-h-screen flex flex-col bg-navy">
      {/* Header */}
      <header className="flex-none px-6 pt-6 pb-4 flex items-center justify-between max-w-4xl mx-auto w-full">
        <span className="font-display text-cream text-xl tracking-tight">Plaz</span>

        {/* Step dots — ocultos en estados terminales (sin flujo que indicar) */}
        {!loadError && !(data && (data.link_expired || data.link_exhausted)) && (
          <div className="flex items-center gap-2">
            {([1, 2, 3] as Step[]).map((s) => (
              <div
                key={s}
                className={[
                  'rounded-full transition-all duration-300',
                  s === step
                    ? 'w-6 h-2 bg-amber'
                    : s < step
                    ? 'w-2 h-2 bg-amber/60'
                    : 'w-2 h-2 bg-navy-card',
                ].join(' ')}
              />
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main ref={containerRef} className="flex-1 flex flex-col px-6 py-8 w-full">
        <div className="m-auto w-full max-w-4xl">
        {/* Loading */}
        {!data && !loadError && (
          <div className="step-panel space-y-4 pt-4">
            <div className="h-8 w-64 bg-navy-mid rounded-xl animate-pulse mx-auto sm:mx-0" />
            <div className="h-4 w-48 bg-navy-mid rounded-lg animate-pulse mx-auto sm:mx-0" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-8">
              <div className="h-28 bg-navy-mid rounded-2xl animate-pulse" />
              <div className="h-72 bg-navy-mid rounded-2xl animate-pulse" />
              <div className="h-72 bg-navy-mid rounded-2xl animate-pulse" />
            </div>
          </div>
        )}

        {/* Error */}
        {loadError && (
          <div role="alert" className="step-panel py-20 text-center">
            <p className="text-red-400 text-base mb-2">{loadError}</p>
            <p className="text-subtle text-sm">Si el problema persiste, contactanos directamente.</p>
          </div>
        )}

        {/* Step 1 — enlace caducado o agotado */}
        {data && step === 1 && (data.link_expired || data.link_exhausted) && (
          <div className="step-panel py-20 text-center">
            <p className="text-cream text-lg mb-2">
              {data.link_expired ? 'Este enlace ha caducado' : 'Este enlace ya se ha utilizado'}
            </p>
            <p className="text-subtle text-sm">
              Solicítanos un nuevo enlace para agendar tu cita.
            </p>
          </div>
        )}

        {/* Step 1 — slot picker */}
        {data && step === 1 && !data.link_expired && !data.link_exhausted && (
          <SlotPicker
            data={data}
            selectedSlotUtc={selected?.slot.start_utc}
            onSelect={handleSlotSelect}
          />
        )}

        {/* Step 2 — booking form */}
        {data && step === 2 && selected && (
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
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-none text-center pb-6 px-6">
        <p className="text-subtle text-xs">
          Todas las horas son en horario de Madrid &middot; Plaz {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

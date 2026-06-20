'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { fetchCancelDetails, cancelBooking } from './api';
import type { CancelDetails } from './types';

gsap.registerPlugin(useGSAP);

interface Props {
  token: string;
}

export default function CancelPage({ token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [details, setDetails] = useState<CancelDetails | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [kept, setKept] = useState(false);

  useEffect(() => {
    fetchCancelDetails(token)
      .then(setDetails)
      .catch(() => setLoadError('No encontramos esta reserva. El enlace puede haber caducado.'));
  }, [token]);

  useGSAP(
    () => {
      const panel = containerRef.current?.querySelector('.cancel-panel');
      if (!panel) return;
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        gsap.set(panel, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(panel, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    },
    { scope: containerRef, dependencies: [details, loadError, done, kept] }
  );

  async function handleCancel() {
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelBooking(token);
      setDone(true);
    } catch {
      setCancelError('No pudimos cancelar la reserva. Intenta de nuevo.');
    } finally {
      setCancelling(false);
    }
  }

  const alreadyCancelled = details?.status === 'cancelled';
  const showCancelled = done || alreadyCancelled;

  return (
    <div className="min-h-screen flex flex-col bg-navy relative overflow-hidden">
      <div className="absolute inset-0 dot-grid pointer-events-none" aria-hidden="true" />

      <header className="relative z-10 flex-none px-6 pt-6 pb-4 max-w-4xl mx-auto w-full">
        <span className="font-display text-xl font-black tracking-tight text-cream select-none">
          Plaz<span className="text-amber">.</span>
        </span>
      </header>

      <main ref={containerRef} className="relative z-10 flex-1 flex flex-col px-6 py-8 w-full">
        <div className="m-auto w-full max-w-md">
        {/* Loading */}
        {!details && !loadError && (
          <div className="cancel-panel w-full max-w-md space-y-4 pt-8">
            <div className="h-8 w-56 bg-navy-mid rounded-xl animate-pulse mx-auto" />
            <div className="h-32 bg-navy-mid rounded-2xl animate-pulse" />
          </div>
        )}

        {/* Error de carga */}
        {loadError && (
          <div role="alert" className="cancel-panel py-20 text-center max-w-md">
            <p className="text-red-400 text-base mb-2">{loadError}</p>
            <p className="text-subtle text-sm">Si crees que es un error, contáctanos directamente.</p>
          </div>
        )}

        {/* Cancelada (ya estaba o acaba de cancelarse) */}
        {details && showCancelled && (
          <div className="cancel-panel text-center max-w-md mx-auto pt-6">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-navy-mid border border-amber-dim flex items-center justify-center">
                <svg className="w-7 h-7 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="font-display text-3xl text-cream mb-2">Reserva cancelada</h1>
            <p className="text-muted text-sm">
              {done
                ? 'Tu cita ha sido cancelada. Puedes reservar una nueva cuando quieras.'
                : 'Esta cita ya estaba cancelada.'}
            </p>
          </div>
        )}

        {/* Cita mantenida (el usuario decidió no cancelar) */}
        {details && kept && !showCancelled && (
          <div className="cancel-panel text-center max-w-md mx-auto pt-6">
            <h1 className="font-display text-3xl text-cream mb-2">Tu cita sigue en pie</h1>
            <p className="text-muted text-sm">No hemos cancelado nada. Te esperamos a la hora reservada.</p>
          </div>
        )}

        {/* Confirmada — ofrecer cancelar */}
        {details && !showCancelled && !kept && (
          <div className="cancel-panel w-full max-w-md mx-auto pt-4">
            <h1 className="font-display text-3xl text-cream mb-1 text-center">¿Cancelar tu cita?</h1>
            <p className="text-muted text-sm mb-8 text-center">
              Esta acción no se puede deshacer.
            </p>

            <div className="p-5 rounded-2xl bg-navy-mid border border-amber-dim space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-soft flex items-center justify-center flex-none mt-0.5">
                  <svg className="w-4 h-4 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="text-subtle text-xs uppercase tracking-wider mb-0.5">Fecha y hora</p>
                  <p className="text-cream font-medium">{details.start_madrid}</p>
                  <p className="text-muted text-xs mt-0.5">{details.duration_minutes} minutos · Horario de Madrid</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-soft flex items-center justify-center flex-none mt-0.5">
                  <svg className="w-4 h-4 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <p className="text-subtle text-xs uppercase tracking-wider mb-0.5">Tu consultor</p>
                  <p className="text-cream font-medium break-words">{details.host_name}</p>
                </div>
              </div>
            </div>

            {cancelError && (
              <p role="alert" className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-4">
                {cancelError}
              </p>
            )}

            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full bg-red-400/15 hover:bg-red-400/25 disabled:opacity-60 disabled:cursor-not-allowed text-red-400 border border-red-400/30 font-semibold py-4 rounded-xl transition-colors duration-200 text-sm cursor-pointer"
            >
              {cancelling ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Cancelando...
                </span>
              ) : (
                'Sí, cancelar mi cita'
              )}
            </button>

            <button
              type="button"
              onClick={() => setKept(true)}
              className="block w-full text-center text-subtle text-xs hover:text-muted transition-colors underline underline-offset-2 mt-5 cursor-pointer"
            >
              No, mantener la cita
            </button>
          </div>
        )}
        </div>
      </main>

      <footer className="relative z-10 flex-none text-center pb-6 px-6">
        <p className="text-subtle text-xs">
          Todas las horas son en horario de Madrid · Plaz {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

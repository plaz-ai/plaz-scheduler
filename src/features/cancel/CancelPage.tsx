'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CircleNotch, CheckCircle, Warning, ArrowLeft } from '@phosphor-icons/react';
import { cancelBooking, type CancelStatus } from '../agenda/api';

gsap.registerPlugin(useGSAP);

interface Props {
  bookingId: string;
  token: string;
}

const MESSAGES: Record<CancelStatus, { icon: React.ReactNode; title: string; body: string }> = {
  cancelled: {
    icon: <CheckCircle className="w-8 h-8 text-amber" weight="regular" />,
    title: 'Cita cancelada.',
    body: 'Tu reserva ha sido cancelada y el evento eliminado del calendario.',
  },
  already_cancelled: {
    icon: <Warning className="w-8 h-8 text-amber/70" weight="regular" />,
    title: 'Ya estaba cancelada.',
    body: 'Esta reserva ya había sido cancelada anteriormente.',
  },
  not_found: {
    icon: <Warning className="w-8 h-8 text-red-400" weight="regular" />,
    title: 'No encontrada.',
    body: 'No encontramos una reserva con ese identificador.',
  },
  invalid_token: {
    icon: <Warning className="w-8 h-8 text-red-400" weight="regular" />,
    title: 'Link inválido.',
    body: 'El link de cancelación no es válido o ha expirado.',
  },
};

export default function CancelPage({ bookingId, token }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<CancelStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useGSAP(
    () => { gsap.from('.cancel-el', { y: 16, opacity: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }); },
    { scope: ref, dependencies: [status] }
  );

  async function handleConfirm() {
    setLoading(true);
    const result = await cancelBooking(bookingId, token);
    setLoading(false);
    setStatus(result);
  }

  const msg = status ? MESSAGES[status] : null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-navy">
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <header className="relative z-10 px-6 md:px-10 py-6 flex items-center justify-between border-b border-cream/[0.06]">
        <span className="font-display text-xl font-black tracking-tight text-cream select-none">
          Plaz<span className="text-amber">.</span>
        </span>
      </header>

      <main ref={ref} className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {!status ? (
            <>
              <h1 className="cancel-el font-display font-black text-4xl md:text-5xl text-cream tracking-tighter leading-[0.92] mb-4">
                Cancelar<br />reserva.
              </h1>
              <p className="cancel-el text-muted text-sm mb-8 leading-relaxed">
                Esta acción no se puede deshacer. El evento se eliminará del calendario y no recibirás recordatorio.
              </p>

              <div className="cancel-el space-y-3">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full bg-red-500/90 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 text-sm transition-colors duration-200 cursor-pointer active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                      Cancelando…
                    </span>
                  ) : 'Confirmar cancelación'}
                </button>

                <button
                  onClick={() => window.history.back()}
                  className="w-full border border-cream/[0.1] text-muted hover:text-cream py-3 text-sm transition-colors duration-200 cursor-pointer"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" weight="regular" />
                    Volver
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="cancel-el mb-6">{msg!.icon}</div>
              <h2 className="cancel-el font-display font-black text-4xl md:text-5xl text-cream tracking-tighter leading-[0.92] mb-4">
                {msg!.title}
              </h2>
              <p className="cancel-el text-muted text-sm leading-relaxed mb-8">{msg!.body}</p>
              {(status === 'not_found' || status === 'invalid_token') && (
                <p className="cancel-el text-subtle text-xs">
                  Si crees que es un error, contacta con nosotros directamente.
                </p>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="relative z-10 px-6 md:px-10 pb-6">
        <p className="text-subtle text-[10px]">Plaz {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

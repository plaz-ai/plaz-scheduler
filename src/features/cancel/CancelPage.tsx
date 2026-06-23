'use client';

import { useRef, useEffect } from 'react';
import { useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CircleNotch, CheckCircle, Warning } from '@phosphor-icons/react';
import { cancelBooking, type CancelStatus } from '../agenda/api';

gsap.registerPlugin(useGSAP);

interface Props {
  bookingId: string;
  token: string;
}

const MESSAGES: Record<CancelStatus, { icon: React.ReactNode; title: string; body: string }> = {
  cancelled: {
    icon: <CheckCircle className="w-9 h-9 text-amber" weight="regular" />,
    title: 'Reserva cancelada.',
    body: 'Tu cita ha sido cancelada correctamente. Si tienes dudas, escríbenos directamente.',
  },
  already_cancelled: {
    icon: <Warning className="w-9 h-9 text-amber/70" weight="regular" />,
    title: 'Ya estaba cancelada.',
    body: 'Esta reserva ya había sido cancelada anteriormente.',
  },
  not_found: {
    icon: <Warning className="w-9 h-9 text-red-400" weight="regular" />,
    title: 'No encontrada.',
    body: 'No encontramos una reserva con ese identificador. Es posible que el link haya expirado.',
  },
  invalid_token: {
    icon: <Warning className="w-9 h-9 text-red-400" weight="regular" />,
    title: 'Link inválido.',
    body: 'El link de cancelación no es válido o ha expirado. Si necesitas ayuda, contáctanos.',
  },
};

export default function CancelPage({ bookingId, token }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<CancelStatus | null>(null);

  // Ejecuta la cancelación automáticamente al montar — sin paso de confirmación.
  useEffect(() => {
    cancelBooking(bookingId, token).then(setStatus);
  }, [bookingId, token]);

  useGSAP(
    () => {
      if (!status) return;
      gsap.from('.cancel-el', { y: 18, opacity: 0, duration: 0.45, stagger: 0.09, ease: 'power2.out' });
    },
    { scope: ref, dependencies: [status] }
  );

  const msg = status ? MESSAGES[status] : null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-navy">
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <header className="relative z-10 px-6 md:px-10 py-6 border-b border-cream/[0.06]">
        <span className="font-display text-xl font-black tracking-tight text-cream select-none">
          Plaz<span className="text-amber">.</span>
        </span>
      </header>

      <main ref={ref} className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {!status ? (
            /* Spinner mientras la API responde */
            <div className="flex flex-col items-start gap-4">
              <CircleNotch className="w-8 h-8 text-amber animate-spin" weight="regular" />
              <p className="text-muted text-sm">Procesando cancelación…</p>
            </div>
          ) : (
            <>
              <div className="cancel-el mb-5">{msg!.icon}</div>
              <h2 className="cancel-el font-display font-black text-4xl md:text-5xl text-cream tracking-tighter leading-[0.92] mb-4">
                {msg!.title}
              </h2>
              <p className="cancel-el text-muted text-sm leading-relaxed">
                {msg!.body}
              </p>
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

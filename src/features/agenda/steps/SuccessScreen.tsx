'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Check, CalendarBlank, User } from '@phosphor-icons/react';
import type { BookingResult } from '../types';

gsap.registerPlugin(useGSAP);

interface Props {
  booking: BookingResult;
}

export default function SuccessScreen({ booking }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const checkRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.from(checkRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
      })
        .from('.success-title', { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.1')
        .from('.success-sub', { y: 10, opacity: 0, duration: 0.3, ease: 'power2.out' }, '-=0.15')
        .from('.detail-item', {
          y: 12,
          opacity: 0,
          duration: 0.35,
          stagger: 0.1,
          ease: 'power2.out',
        }, '-=0.1')
        .from('.cancel-link', { opacity: 0, duration: 0.3, ease: 'none' }, '-=0.05');
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="step-panel text-center max-w-md mx-auto">
      {/* Animated check */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-amber-soft border-2 border-amber flex items-center justify-center">
          <Check
            ref={checkRef}
            className="w-9 h-9 text-amber"
            weight="bold"
          />
        </div>
      </div>

      <h2 className="success-title font-display text-4xl text-cream mb-2">
        ¡Reserva confirmada!
      </h2>
      <p className="success-sub text-muted text-sm mb-10">
        Recibirás los detalles en tu email en breve
      </p>

      {/* Details card */}
      <div className="text-left p-5 rounded-2xl bg-navy-mid border border-amber-dim space-y-4 mb-8">
        <div className="detail-item flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-soft flex items-center justify-center flex-none mt-0.5">
            <CalendarBlank className="w-4 h-4 text-amber" weight="regular" />
          </div>
          <div>
            <p className="text-subtle text-xs uppercase tracking-wider mb-0.5">Fecha y hora</p>
            <p className="text-cream font-medium">{booking.start_madrid}</p>
            <p className="text-muted text-xs mt-0.5">Horario de Madrid</p>
          </div>
        </div>

        <div className="detail-item flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-soft flex items-center justify-center flex-none mt-0.5">
            <User className="w-4 h-4 text-amber" weight="regular" />
          </div>
          <div>
            <p className="text-subtle text-xs uppercase tracking-wider mb-0.5">Tu consultor</p>
            <p className="text-cream font-medium">{booking.host_name}</p>
          </div>
        </div>
      </div>

      <a
        href={booking.cancel_url}
        className="cancel-link text-subtle text-xs hover:text-muted transition-colors underline underline-offset-2"
      >
        Cancelar esta reserva
      </a>
    </div>
  );
}

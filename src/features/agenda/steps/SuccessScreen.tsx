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
      tl.from('.success-icon', { scale: 0, opacity: 0, duration: 0.45, ease: 'back.out(1.7)' })
        .from('.success-title', { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.1')
        .from('.success-detail', {
          y: 10,
          opacity: 0,
          duration: 0.3,
          stagger: 0.08,
          ease: 'power2.out',
        }, '-=0.1')
        .from('.cancel-link', { opacity: 0, duration: 0.3 });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="step-panel max-w-sm">
      {/* Check icon */}
      <div className="success-icon inline-flex items-center justify-center w-11 h-11 rounded-full border border-amber/35 mb-8">
        <Check ref={checkRef} className="w-5 h-5 text-amber" weight="bold" />
      </div>

      {/* Heading */}
      <h2 className="success-title font-display font-black text-5xl md:text-[clamp(3rem,6vw,4rem)] text-cream tracking-tighter leading-[0.92] mb-10">
        Reserva<br />confirmada.
      </h2>

      {/* Details — underline rows, no card */}
      <div className="space-y-0 mb-10">
        <div className="success-detail flex items-center gap-4 py-4 border-b border-cream/[0.07]">
          <CalendarBlank className="w-3.5 h-3.5 text-amber flex-none" weight="regular" />
          <div>
            <p className="text-subtle text-[9px] uppercase tracking-widest mb-0.5">Fecha y hora</p>
            <p className="text-cream text-sm font-medium">{booking.start_madrid}</p>
          </div>
        </div>

        <div className="success-detail flex items-center gap-4 py-4 border-b border-cream/[0.07]">
          <User className="w-3.5 h-3.5 text-amber flex-none" weight="regular" />
          <div>
            <p className="text-subtle text-[9px] uppercase tracking-widest mb-0.5">Tu consultor</p>
            <p className="text-cream text-sm font-medium">{booking.host_name}</p>
          </div>
        </div>
      </div>

      <a
        href={booking.cancel_url}
        className="cancel-link text-subtle text-xs hover:text-muted transition-colors underline underline-offset-4"
      >
        Cancelar esta reserva
      </a>
    </div>
  );
}

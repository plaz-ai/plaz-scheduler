'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Check, CalendarBlank, User, VideoCamera } from '@phosphor-icons/react';
import type { BookingResult, EventType } from '../types';

gsap.registerPlugin(useGSAP);

interface Props {
  booking: BookingResult;
  eventType?: EventType | null;
}

export default function SuccessScreen({ booking, eventType }: Props) {
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
        }, '-=0.05')
        .from('.cancel-link', { opacity: 0, duration: 0.3 });
    },
    { scope: ref }
  );

  const when = booking.start_madrid || (booking.start_utc
    ? new Intl.DateTimeFormat('es-ES', {
        timeZone: 'Europe/Madrid',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(booking.start_utc))
    : '');

  return (
    <div ref={ref} className="step-panel">
      <div className="md:grid md:grid-cols-[2fr_3fr] md:gap-x-10 lg:gap-x-14 md:items-start">

        {/* Left — icon + heading */}
        <div className="mb-8 md:mb-0 md:pt-1">
          <div className="success-icon inline-flex items-center justify-center w-11 h-11 rounded-full border border-amber/35 mb-6">
            <Check ref={checkRef} className="w-5 h-5 text-amber" weight="bold" />
          </div>
          <h2 className="success-title font-display font-black text-4xl md:text-5xl text-cream tracking-tighter leading-[0.92]">
            Reserva<br />confirmada.
          </h2>
        </div>

        {/* Right — summary card + cancel */}
        <div className="md:pt-1">
          <div className="rounded-xl border border-cream/[0.08] bg-cream/[0.02] overflow-hidden mb-6">
            <div className="success-detail flex items-center gap-4 px-5 py-4 border-b border-cream/[0.07]">
              <CalendarBlank className="w-4 h-4 text-amber flex-none" weight="regular" />
              <div>
                <p className="text-subtle text-[9px] uppercase tracking-widest mb-0.5">Fecha y hora</p>
                <p className="text-cream text-sm font-medium capitalize">{when}</p>
              </div>
            </div>

            <div className="success-detail flex items-center gap-4 px-5 py-4 border-b border-cream/[0.07]">
              <User className="w-4 h-4 text-amber flex-none" weight="regular" />
              <div>
                <p className="text-subtle text-[9px] uppercase tracking-widest mb-0.5">Tu consultor</p>
                <p className="text-cream text-sm font-medium">{booking.host_name}</p>
              </div>
            </div>

            {eventType && (
              <div className="success-detail flex items-center gap-4 px-5 py-4">
                <VideoCamera className="w-4 h-4 text-amber flex-none" weight="regular" />
                <div>
                  <p className="text-subtle text-[9px] uppercase tracking-widest mb-0.5">Ubicación</p>
                  <p className="text-cream text-sm font-medium">{eventType.location_label}</p>
                </div>
              </div>
            )}
          </div>

          <a
            href={booking.cancel_url}
            className="cancel-link text-muted text-xs hover:text-cream transition-colors underline underline-offset-4"
          >
            Cancelar esta reserva
          </a>
        </div>

      </div>
    </div>
  );
}

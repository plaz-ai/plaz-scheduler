'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Check, CalendarBlank, User, VideoCamera, GoogleLogo, MicrosoftOutlookLogo, DownloadSimple, ArrowLeft } from '@phosphor-icons/react';
import type { BookingResult, EventType } from '../types';
import { googleCalendarUrl, outlookCalendarUrl, icsObjectUrl, type CalEvent } from '../lib/calendar-export';

gsap.registerPlugin(useGSAP);

interface Props {
  booking: BookingResult;
  eventType?: EventType | null;
  durationMinutes?: number;
  userTz?: string;             // TZ del invitado para formatear la hora confirmada
  heading?: string;            // "Reserva\nconfirmada." por defecto
  rescheduleHref?: string;     // si se pasa, muestra el enlace "Reagendar"
  onStartOver?: () => void;    // "Volver al inicio" para hacer otra reserva
}

export default function SuccessScreen({ booking, eventType, durationMinutes, userTz, heading, rescheduleHref, onStartOver }: Props) {
  const tz = userTz || 'Europe/Madrid';
  const ref = useRef<HTMLDivElement>(null);
  const checkRef = useRef<SVGSVGElement>(null);

  // Construye la URL de cancelación apuntando a nuestra propia página,
  // extrayendo booking_id y token del cancel_url que devuelve el backend.
  function buildCancelHref(rawUrl: string): string {
    try {
      const u = new URL(rawUrl);
      const id = u.searchParams.get('booking_id');
      const tok = u.searchParams.get('token');
      if (id && tok) {
        return `/plaz-scheduler/cancelar/?booking_id=${encodeURIComponent(id)}&token=${encodeURIComponent(tok)}`;
      }
    } catch { /* URL inválida — usa la original */ }
    return rawUrl;
  }

  // Evento de calendario derivado de la reserva (cliente, sin backend).
  const start = new Date(booking.start_utc);
  // Usa duration_minutes del backend si viene; si no, el prop del tipo de evento.
  const dur = booking.duration_minutes ?? (durationMinutes && durationMinutes > 0 ? durationMinutes : 30);
  const calEvent: CalEvent = {
    title: eventType?.title ?? `Reunión con ${booking.host_name}`,
    start,
    end: new Date(start.getTime() + dur * 60000),
    location: eventType?.location_label,
    description: `Tu reunión con ${booking.host_name}.`,
    uid: booking.booking_id,
  };

  function downloadIcs() {
    const url = icsObjectUrl(calEvent);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cita-plaz.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

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

  const when = booking.start_utc
    ? (() => {
        const raw = new Intl.DateTimeFormat('es-ES', {
          timeZone: tz,
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(booking.start_utc));
        return raw.charAt(0).toUpperCase() + raw.slice(1);
      })()
    : booking.start_madrid;

  return (
    <div ref={ref} className="step-panel">
      <div className="md:grid md:grid-cols-[2fr_3fr] md:gap-x-10 lg:gap-x-14 md:items-start">

        {/* Left — icon + heading */}
        <div className="mb-8 md:mb-0 md:pt-1">
          <div className="success-icon inline-flex items-center justify-center w-11 h-11 rounded-full border border-amber/35 mb-6">
            <Check ref={checkRef} className="w-5 h-5 text-amber" weight="bold" />
          </div>
          <h2 className="success-title font-display font-black text-4xl md:text-5xl text-cream tracking-tighter leading-[0.92] whitespace-pre-line">
            {heading ?? 'Reserva\nconfirmada.'}
          </h2>

          {onStartOver && (
            <button
              onClick={onStartOver}
              className="success-title mt-6 inline-flex items-center gap-1.5 text-muted text-sm hover:text-cream transition-colors cursor-pointer active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" weight="regular" />
              Hacer otra reserva
            </button>
          )}
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

          {/* Añadir al calendario (cal.com) — generado en cliente */}
          <div className="success-detail mb-6">
            <p className="text-subtle text-[9px] uppercase tracking-widest mb-2.5">Añadir al calendario</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={googleCalendarUrl(calEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-cream/[0.1] bg-cream/[0.02] px-3.5 py-2 text-cream/80 text-xs hover:border-amber/40 hover:text-cream transition-colors"
              >
                <GoogleLogo className="w-3.5 h-3.5 text-amber/80" weight="bold" />
                Google
              </a>
              <a
                href={outlookCalendarUrl(calEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-cream/[0.1] bg-cream/[0.02] px-3.5 py-2 text-cream/80 text-xs hover:border-amber/40 hover:text-cream transition-colors"
              >
                <MicrosoftOutlookLogo className="w-3.5 h-3.5 text-amber/80" weight="bold" />
                Outlook
              </a>
              <button
                onClick={downloadIcs}
                className="inline-flex items-center gap-2 rounded-lg border border-cream/[0.1] bg-cream/[0.02] px-3.5 py-2 text-cream/80 text-xs hover:border-amber/40 hover:text-cream transition-colors cursor-pointer"
              >
                <DownloadSimple className="w-3.5 h-3.5 text-amber/80" weight="bold" />
                .ics
              </button>
            </div>
          </div>

          <div className="cancel-link flex flex-wrap items-center gap-x-5 gap-y-2">
            {rescheduleHref && (
              <a
                href={rescheduleHref}
                className="text-cream/60 text-xs hover:text-cream transition-colors underline underline-offset-4"
              >
                Reagendar
              </a>
            )}
            <a
              href={buildCancelHref(booking.cancel_url)}
              className="text-cream/50 text-xs hover:text-cream/80 transition-colors underline underline-offset-4"
            >
              Cancelar esta reserva
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

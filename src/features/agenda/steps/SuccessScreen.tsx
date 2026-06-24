'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CalendarBlank, User, VideoCamera, GoogleLogo, MicrosoftOutlookLogo, DownloadSimple, ArrowLeft } from '@phosphor-icons/react';
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
    // Si ya apunta a nuestra página de cancelación, úsala directamente (mock + futuro).
    if (rawUrl.includes('/cancelar/')) return rawUrl;
    // Backend real: URL absoluta del VPS con booking_id y token como params.
    try {
      const u = new URL(rawUrl);
      const id = u.searchParams.get('booking_id');
      const tok = u.searchParams.get('token');
      if (id && tok) {
        return `/plaz-scheduler/cancelar/?booking_id=${encodeURIComponent(id)}&token=${encodeURIComponent(tok)}`;
      }
    } catch { /* URL inválida */ }
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
      // Solo el dibujo del check; la entrada del bloque la da el keyframe CSS .step-panel
      // (evita el doble fade/flash que provocaba animar también título y detalle aquí).
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const circleEl = checkRef.current?.querySelector('.check-circle') as SVGCircleElement | null;
      const pathEl = checkRef.current?.querySelector('.check-path') as SVGPathElement | null;
      if (!circleEl || !pathEl) return;
      const circleLen = circleEl.getTotalLength();
      const pathLen = pathEl.getTotalLength();
      gsap.timeline()
        .set(circleEl, { strokeDasharray: circleLen, strokeDashoffset: circleLen })
        .set(pathEl, { strokeDasharray: pathLen, strokeDashoffset: pathLen })
        .to(circleEl, { strokeDashoffset: 0, duration: 0.52, ease: 'power3.out' }, 0.1)
        .to(pathEl, { strokeDashoffset: 0, duration: 0.36, ease: 'power2.out' }, '-=0.18');
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
          <div className="success-icon mb-6">
            <svg
              ref={checkRef}
              viewBox="0 0 52 52"
              className="w-16 h-16 text-amber"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="check-circle"
                cx="26" cy="26" r="24"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <path
                className="check-path"
                d="M15 27 L22 34 L37 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 role="status" aria-live="polite" className="success-title font-display font-black text-4xl md:text-5xl text-cream tracking-tighter leading-[0.92] whitespace-pre-line">
            {heading ?? 'Reserva\nconfirmada.'}
          </h2>

          {onStartOver && (
            <button
              onClick={onStartOver}
              className="success-title mt-6 inline-flex items-center gap-1.5 text-muted text-sm hover:text-cream transition-colors cursor-pointer active:scale-[0.98] rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
            >
              <ArrowLeft className="w-4 h-4" weight="regular" />
              Hacer otra reserva
            </button>
          )}
        </div>

        {/* Right — summary card + cancel */}
        <div className="md:pt-1">
          <div className="rounded-xl border border-cream/[0.08] bg-navy-card overflow-hidden mb-6">
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
                className="inline-flex items-center gap-2 rounded-lg border border-cream/[0.1] bg-navy-card px-3.5 py-2.5 min-h-[44px] text-cream/80 text-xs hover:border-amber/40 hover:bg-navy-card-hover hover:text-cream transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
              >
                <GoogleLogo className="w-3.5 h-3.5 text-amber/80" weight="bold" />
                Google
              </a>
              <a
                href={outlookCalendarUrl(calEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-cream/[0.1] bg-navy-card px-3.5 py-2.5 min-h-[44px] text-cream/80 text-xs hover:border-amber/40 hover:bg-navy-card-hover hover:text-cream transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
              >
                <MicrosoftOutlookLogo className="w-3.5 h-3.5 text-amber/80" weight="bold" />
                Outlook
              </a>
              <button
                onClick={downloadIcs}
                className="inline-flex items-center gap-2 rounded-lg border border-cream/[0.1] bg-navy-card px-3.5 py-2.5 min-h-[44px] text-cream/80 text-xs hover:border-amber/40 hover:bg-navy-card-hover hover:text-cream transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
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
                className="text-cream/60 text-xs hover:text-cream transition-colors underline underline-offset-4 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
              >
                Reagendar
              </a>
            )}
            <a
              href={buildCancelHref(booking.cancel_url)}
              className="text-cream/50 text-xs hover:text-cream/80 transition-colors underline underline-offset-4 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
            >
              Cancelar esta reserva
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

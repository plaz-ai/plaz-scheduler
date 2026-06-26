import Link from 'next/link';

// Link de reserva general del Equipo Comercial Plaz (booking_link activo).
const BOOKING_LINK = '11040825-11ed-46f8-b1dc-29a6b7ccf248';
const bookingHref = `/agenda/?id=${BOOKING_LINK}`;

interface EventCard {
  title: string;
  minutes: number;
  description: string;
}

const EVENT_CARDS: EventCard[] = [
  { title: 'Llamada de descubrimiento', minutes: 15, description: 'Una primera conversación para entender tu caso y ver si encajamos.' },
  { title: 'Consulta con un comercial', minutes: 30, description: 'Resuelve dudas y plantea los próximos pasos con el equipo.' },
  { title: 'Sesión de estrategia', minutes: 60, description: 'Sesión en profundidad para diseñar un plan a medida contigo.' },
];

const ArrowRight = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ClockIcon = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export default function HomePage() {
  return (
    <div className="min-h-dvh app-shell flex flex-col">
      {/* Glow ambiental ámbar */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{ background: 'radial-gradient(ellipse at 80% 0%, rgb(232 162 74 / 0.07) 0%, transparent 55%)' }}
      />

      {/* Header */}
      <header className="flex-none px-6 md:px-10 pt-7">
        <span className="font-display text-xl font-black tracking-tight text-cream select-none">
          Plaz<span className="text-amber">.</span>
        </span>
      </header>

      {/* Hero */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 md:px-10 flex flex-col justify-center py-16">
        <p className="text-amber text-xs font-semibold uppercase tracking-[0.2em] mb-5">
          Equipo comercial · Plaz
        </p>
        <h1
          className="font-display font-black text-cream tracking-tighter leading-[0.92] mb-6"
          style={{ fontSize: 'clamp(2.75rem, 8vw, 5.5rem)' }}
        >
          Agenda tu cita<br />en minutos.
        </h1>
        <p className="text-muted text-base md:text-lg max-w-xl leading-relaxed mb-9">
          Elige el tipo de reunión, escoge el horario que mejor te venga en tu
          zona horaria y recibe la confirmación al instante.
        </p>

        <div>
          <Link
            href={bookingHref}
            className="inline-flex items-center gap-2.5 rounded-xl bg-amber text-on-amber font-semibold px-6 py-3.5 text-sm hover:brightness-105 active:scale-[0.98] transition-all shadow-lg shadow-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60"
          >
            Reservar ahora
            {ArrowRight}
          </Link>
        </div>

        {/* Tarjetas de tipos de reunión — grid fluido (auto-fit, sin breakpoints) */}
        <div className="mt-16">
          <h2 className="text-subtle text-[11px] uppercase tracking-widest mb-4">Tipos de reunión</h2>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr))]">
            {EVENT_CARDS.map(card => (
              <Link
                key={card.title}
                href={bookingHref}
                className="group flex flex-col rounded-2xl border border-amber-dim bg-navy-card hover:bg-navy-card-hover hover:border-amber/35 p-5 transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/50"
              >
                <span className="inline-flex items-center gap-1.5 text-amber text-xs font-medium mb-3">
                  {ClockIcon}
                  {card.minutes} min
                </span>
                <span className="text-cream font-medium text-[15px] leading-snug mb-1.5">
                  {card.title}
                </span>
                <span className="text-muted text-sm leading-relaxed flex-1">
                  {card.description}
                </span>
                <span className="inline-flex items-center gap-1.5 text-cream/55 group-hover:text-amber text-xs font-medium mt-4 transition-colors">
                  Reservar {ArrowRight}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-none px-6 md:px-10 pb-7">
        <p className="text-subtle text-[10px]">Plaz · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

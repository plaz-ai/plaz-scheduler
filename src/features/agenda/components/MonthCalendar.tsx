'use client';

import { useState } from 'react';

interface Props {
  /** Fechas con disponibilidad, en formato "YYYY-MM-DD". */
  availableDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  /** Fecha que fija el mes mostrado al cargar. */
  initialDate: string;
}

const WEEKDAYS_MIN = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function parseISO(d: string) {
  const [y, m, day] = d.split('-').map(Number);
  return { y, m: m - 1, day };
}

function toISO(y: number, m: number, day: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function MonthCalendar({ availableDates, selectedDate, onSelectDate, initialDate }: Props) {
  const init = parseISO(initialDate);
  const [view, setView] = useState({ y: init.y, m: init.m });

  // Lunes primero: getDay() devuelve 0=domingo..6=sábado.
  const firstWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shift(delta: number) {
    setView((v) => {
      const total = v.y * 12 + v.m + delta;
      return { y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 };
    });
  }

  return (
    <div>
      {/* Cabecera: mes + navegación */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-cream font-medium capitalize">
          {MONTHS[view.m]} {view.y}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Mes anterior"
            className="h-11 w-11 flex items-center justify-center rounded-lg text-muted hover:text-cream hover:bg-navy-light transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Mes siguiente"
            className="h-11 w-11 flex items-center justify-center rounded-lg text-muted hover:text-cream hover:bg-navy-light transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS_MIN.map((w, i) => (
          <span key={i} className="text-center text-subtle text-[11px] font-semibold uppercase py-1">
            {w}
          </span>
        ))}
      </div>

      {/* Celdas de días */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={i} aria-hidden />;
          const iso = toISO(view.y, view.m, day);
          const available = availableDates.has(iso);
          const selected = iso === selectedDate;

          return (
            <button
              key={i}
              type="button"
              disabled={!available}
              onClick={() => onSelectDate(iso)}
              aria-pressed={available ? selected : undefined}
              aria-current={selected ? 'date' : undefined}
              aria-label={available ? `Día ${day}, disponible` : `Día ${day}, sin disponibilidad`}
              className={[
                'relative h-11 w-full rounded-lg text-sm flex items-center justify-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60',
                selected
                  ? 'bg-amber text-navy font-semibold'
                  : available
                  ? 'text-cream font-semibold hover:bg-amber-soft hover:text-amber cursor-pointer'
                  : 'text-subtle/30 cursor-default',
              ].join(' ')}
            >
              {day}
              {available && !selected && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-amber" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

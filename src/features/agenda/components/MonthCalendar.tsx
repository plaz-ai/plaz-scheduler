'use client';

import { useState } from 'react';

interface Props {
  /** Fechas con disponibilidad, en formato "YYYY-MM-DD". */
  availableDates: Set<string>;
  selectedDate: string | null;
  /** Mes inicial a mostrar, "YYYY-MM-DD". */
  initialMonth: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const pad = (n: number) => String(n).padStart(2, '0');

export default function MonthCalendar({ availableDates, selectedDate, initialMonth, onSelectDate }: Props) {
  const today = new Date();
  const minY = today.getFullYear();
  const minM = today.getMonth(); // 0-index
  const todayKey = `${minY}-${pad(minM + 1)}-${pad(today.getDate())}`;

  const [iy, im] = initialMonth.split('-').map(Number); // im es 1-12
  const [view, setView] = useState({ y: iy, m: im - 1 }); // m 0-index

  const rawMonth = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
    new Date(view.y, view.m, 1)
  );
  const monthLabel = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1); // "Junio de 2026"
  const firstWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // 0 = lunes
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const canPrev = view.y > minY || (view.y === minY && view.m > minM);

  function go(delta: number) {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-cream font-semibold">{monthLabel}</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => go(-1)}
            disabled={!canPrev}
            aria-label="Mes anterior"
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-muted hover:text-cream hover:bg-navy-light/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Mes siguiente"
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-muted hover:text-cream hover:bg-navy-light/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-subtle text-xs font-medium py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} aria-hidden />;
          const key = `${view.y}-${pad(view.m + 1)}-${pad(d)}`;
          const available = availableDates.has(key);
          const selected = key === selectedDate;
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              disabled={!available}
              onClick={() => onSelectDate(key)}
              aria-label={`${d}${available ? ', disponible' : ', sin disponibilidad'}`}
              aria-pressed={selected}
              className={[
                'aspect-square flex items-center justify-center rounded-xl text-sm tabular-nums transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60',
                selected
                  ? 'bg-amber text-navy font-bold'
                  : available
                  ? 'bg-amber-soft text-cream font-semibold hover:bg-amber/25 cursor-pointer'
                  : 'text-subtle/40 cursor-default',
                isToday && !selected ? 'ring-1 ring-amber/40' : '',
              ].join(' ')}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

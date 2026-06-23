'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import type { AvailableDay } from '../types';

gsap.registerPlugin(useGSAP);

interface Props {
  availableDays: AvailableDay[];
  selectedDate: string | null;
  onSelectDate: (day: AvailableDay) => void;
}

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  // Convert getDay() (0=Sun) to Monday-first (0=Mon, 6=Sun)
  const startOffset = (firstDay.getDay() + 6) % 7;
  const grid: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= totalDays; d++) grid.push(d);
  return grid;
}

export default function CalendarGrid({ availableDays, selectedDate, onSelectDate }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const firstAvailable = availableDays.find(d => d.slots.length > 0);
  const seed = firstAvailable ? new Date(firstAvailable.date + 'T12:00:00') : new Date();
  const [viewYear, setViewYear] = useState(seed.getFullYear());
  const [viewMonth, setViewMonth] = useState(seed.getMonth());

  const availableMap = new Map<string, AvailableDay>();
  availableDays.forEach(d => { if (d.slots.length > 0) availableMap.set(d.date, d); });

  const todayMadrid = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
  const grid = buildMonthGrid(viewYear, viewMonth);

  // capitalize solo el mes, no el "de" (CSS capitalize eleva cada palabra)
  const rawLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('es-ES', {
    month: 'long', year: 'numeric',
  });
  const monthLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

  // Stagger cells in — fast (120ms total), cleared after so no inline styles persist
  useGSAP(
    () => {
      gsap.from('.cal-day-cell', {
        opacity: 0,
        scale: 0.82,
        duration: 0.16,
        stagger: { amount: 0.12, from: 'start' },
        ease: 'power2.out',
        clearProps: 'all',
      });
    },
    { scope: ref, dependencies: [viewMonth, viewYear], revertOnUpdate: true }
  );

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const canGoPrev = firstAvailable
    ? viewYear > seed.getFullYear() || (viewYear === seed.getFullYear() && viewMonth > seed.getMonth())
    : false;

  return (
    <div ref={ref} className="w-full select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-cream hover:bg-cream/[0.06] disabled:opacity-20 disabled:cursor-default transition-all duration-150 cursor-pointer"
        >
          <CaretLeft className="w-3.5 h-3.5" weight="bold" />
        </button>

        <span className="text-cream text-xs font-semibold tracking-wide">
          {monthLabel}
        </span>

        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-cream hover:bg-cream/[0.06] transition-all duration-150 cursor-pointer"
        >
          <CaretRight className="w-3.5 h-3.5" weight="bold" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[9px] font-semibold text-subtle uppercase tracking-widest py-1.5">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {grid.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isAvailable = availableMap.has(dateStr);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayMadrid;

          return (
            <button
              key={dateStr}
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectDate(availableMap.get(dateStr)!)}
              className={[
                'cal-day-cell relative w-full aspect-square flex items-center justify-center',
                'rounded-lg text-xs font-medium transition-all duration-100',
                isSelected
                  ? 'bg-amber text-navy font-bold shadow-lg shadow-amber/20'
                  : isAvailable
                  ? 'text-cream hover:bg-amber/15 hover:text-amber cursor-pointer active:scale-90'
                  : 'text-subtle/30 cursor-default',
              ].join(' ')}
            >
              {day}
              {/* Today dot */}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber/60" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

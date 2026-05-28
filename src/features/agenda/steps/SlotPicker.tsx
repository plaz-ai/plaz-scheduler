'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Clock } from '@phosphor-icons/react';
import type { AvailabilityResponse, AvailableDay, TimeSlot } from '../types';
import TimeSlotButton from '../components/TimeSlotButton';

gsap.registerPlugin(useGSAP);

interface Props {
  data: AvailabilityResponse;
  selectedSlotUtc?: string;
  onSelect: (day: AvailableDay, slot: TimeSlot) => void;
}

export default function SlotPicker({ data, selectedSlotUtc, onSelect }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);

  const firstWithSlots = data.available_days.find((d) => d.slots.length > 0) ?? data.available_days[0];
  const [activeDay, setActiveDay] = useState<AvailableDay>(firstWithSlots);

  const todayMadrid = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());

  // Stagger grid slots when active day changes
  useGSAP(
    () => {
      if (!gridRef.current) return;
      gsap.fromTo(
        gridRef.current.querySelectorAll('.slot-btn'),
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.22, stagger: 0.025, ease: 'power2.out' }
      );
    },
    { scope: gridRef, dependencies: [activeDay.date] }
  );

  const hasAnySlot = data.available_days.some((d) => d.slots.length > 0);

  return (
    <div className="step-panel">
      {/* Heading */}
      <div className="mb-8 md:mb-10">
        <h1 className="font-display font-black text-5xl md:text-[clamp(3rem,6vw,4.5rem)] text-cream tracking-tighter leading-[0.92] mb-4">
          Elige tu<br />fecha.
        </h1>
        <div className="flex items-center gap-2 mt-5">
          <Clock className="w-3 h-3 text-amber flex-none" weight="regular" />
          <span className="text-muted text-xs">{data.duration_minutes} min · Madrid</span>
        </div>
      </div>

      {hasAnySlot ? (
        <>
          {/* Day tabs */}
          <div className="flex overflow-x-auto -mx-1 px-1 mb-8 border-b border-cream/[0.08]">
            {data.available_days.map((day) => {
              const [weekday, dayNum] = day.short_label.split(' ');
              const isActive = day.date === activeDay.date;
              const isToday = day.date === todayMadrid;
              const isEmpty = day.slots.length === 0;

              return (
                <button
                  key={day.date}
                  onClick={() => !isEmpty && setActiveDay(day)}
                  disabled={isEmpty}
                  className={[
                    'flex flex-col items-center px-4 py-2.5 flex-none border-b-2 -mb-px',
                    'transition-all duration-150 cursor-pointer',
                    'disabled:opacity-25 disabled:cursor-default',
                    isActive ? 'border-amber' : 'border-transparent hover:border-cream/20',
                  ].join(' ')}
                >
                  <span className={[
                    'text-[9px] font-semibold uppercase tracking-widest mb-1.5',
                    isToday ? 'text-amber' : 'text-subtle',
                  ].join(' ')}>
                    {isToday ? 'Hoy' : weekday}
                  </span>
                  <span className={[
                    'text-2xl font-bold leading-none',
                    isActive ? 'text-cream' : isToday ? 'text-amber/60' : 'text-muted',
                  ].join(' ')}>
                    {dayNum}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Slot grid */}
          <div ref={gridRef}>
            {activeDay.slots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-3 gap-y-1 max-w-xs">
                {activeDay.slots.map((slot) => (
                  <TimeSlotButton
                    key={slot.start_utc}
                    slot={slot}
                    selected={slot.start_utc === selectedSlotUtc}
                    onSelect={(s) => onSelect(activeDay, s)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm py-8">Sin disponibilidad este día.</p>
            )}
          </div>
        </>
      ) : (
        <div className="py-16">
          <p className="text-muted text-base mb-2">No hay disponibilidad en los próximos días.</p>
          <p className="text-subtle text-sm">Contactanos directamente para buscar un horario.</p>
        </div>
      )}
    </div>
  );
}

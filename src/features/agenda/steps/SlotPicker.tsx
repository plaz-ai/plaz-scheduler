'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { AvailabilityResponse, AvailableDay, TimeSlot } from '../types';
import MonthCalendar from '../components/MonthCalendar';
import TimeSlotButton from '../components/TimeSlotButton';

gsap.registerPlugin(useGSAP);

interface Props {
  data: AvailabilityResponse;
  selectedSlotUtc?: string;
  onSelect: (day: AvailableDay, slot: TimeSlot) => void;
}

export default function SlotPicker({ data, selectedSlotUtc, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const days = data.available_days;
  const availableDates = new Set(days.map((d) => d.date));
  const firstDate = days[0]?.date ?? null;

  const [selectedDate, setSelectedDate] = useState<string | null>(firstDate);
  const selectedDay = days.find((d) => d.date === selectedDate) ?? null;

  // Anima la lista de horarios cada vez que cambia el día elegido (respeta reduce-motion).
  useGSAP(
    () => {
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;
      gsap.from('.time-option', {
        y: 10,
        opacity: 0,
        duration: 0.3,
        stagger: 0.04,
        ease: 'power2.out',
      });
    },
    { scope: ref, dependencies: [selectedDate] }
  );

  const hasAny = days.length > 0;

  return (
    <div ref={ref} className="step-panel @container">
      <div className="mb-6 text-center @3xl:text-left">
        <h1 className="font-display text-3xl @md:text-4xl text-cream mb-1 leading-tight">
          Elige tu fecha y hora
        </h1>
        <p className="text-muted text-sm">Horario de Madrid (Europa/Madrid)</p>
      </div>

      {!hasAny ? (
        <div className="py-16 text-center">
          <p className="text-muted text-base">No hay disponibilidad en los próximos días.</p>
          <p className="text-subtle text-sm mt-2">Contáctanos directamente para buscar un horario.</p>
        </div>
      ) : (
        <div className="grid gap-5 @md:grid-cols-2 @3xl:grid-cols-[200px_minmax(0,1fr)_220px] @3xl:gap-6">
          {/* Panel info */}
          <aside className="@md:col-span-2 @3xl:col-span-1 flex flex-col @md:flex-row @md:items-center @3xl:items-start @3xl:flex-col gap-4 @3xl:gap-5 p-4 rounded-2xl bg-navy-mid border border-amber-dim">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-soft border border-amber/30 flex items-center justify-center flex-none">
                <span className="text-amber font-semibold text-sm">
                  {data.team_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-subtle text-[11px] uppercase tracking-wider">Tu consultor</p>
                <p className="text-cream font-medium text-sm">{data.team_name}</p>
              </div>
            </div>

            <div className="flex @md:flex-col @3xl:flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 text-muted text-xs">
                <svg className="w-3.5 h-3.5 text-amber flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                {data.duration_minutes} minutos
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted text-xs">
                <svg className="w-3.5 h-3.5 text-amber flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
                </svg>
                Europa/Madrid
              </span>
            </div>
          </aside>

          {/* Calendario mensual */}
          <div className="@3xl:px-1">
            {firstDate && (
              <MonthCalendar
                availableDates={availableDates}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                initialDate={firstDate}
              />
            )}
          </div>

          {/* Horarios del día elegido */}
          <div className="min-w-0">
            {selectedDay ? (
              <>
                <p className="text-cream text-sm font-medium mb-3 first-letter:uppercase">{selectedDay.label}</p>
                <div className="grid grid-cols-3 @md:grid-cols-1 gap-2 @md:max-h-[22rem] @md:overflow-y-auto @md:pr-1">
                  {selectedDay.slots.map((slot) => (
                    <div key={slot.start_utc} className="time-option">
                      <TimeSlotButton
                        slot={slot}
                        selected={slot.start_utc === selectedSlotUtc}
                        onSelect={(s) => onSelect(selectedDay, s)}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-subtle text-sm pt-2">Elige un día en el calendario.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

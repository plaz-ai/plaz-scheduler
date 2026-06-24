'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Clock, CaretLeft, ArrowRight } from '@phosphor-icons/react';
import type { AvailabilityResponse, AvailableDay, TimeSlot } from '../types';
import CalendarGrid from '../components/CalendarGrid';
import TimeSlotButton from '../components/TimeSlotButton';

gsap.registerPlugin(useGSAP);

interface Props {
  data: AvailabilityResponse;
  selectedSlotUtc?: string;
  durationMinutes: number;
  tzLabel?: string;
  durations?: number[];
  onDurationChange?: (minutes: number) => void;
  onSelect: (day: AvailableDay, slot: TimeSlot) => void;
  onChangeEventType?: () => void; // botón "← Cambiar tipo" en móvil
}

export default function SlotPicker({ data, selectedSlotUtc, durationMinutes, tzLabel, durations, onDurationChange, onSelect, onChangeEventType }: Props) {
  const slotsRef = useRef<HTMLDivElement>(null);
  const [activeDay, setActiveDay] = useState<AvailableDay | null>(null);

  // Slots animate in whenever the active day changes — fast x-slide, cleared after
  useGSAP(
    () => {
      if (!activeDay) return;
      gsap.fromTo(
        '.slot-btn',
        { opacity: 0, x: 10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.18,
          stagger: 0.028,
          ease: 'power2.out',
          clearProps: 'all',
        }
      );
    },
    { scope: slotsRef, dependencies: [activeDay?.date], revertOnUpdate: true }
  );

  const hasAnySlot = data.available_days.some(d => d.slots.length > 0);

  return (
    <div className="step-panel">
      {/* Botón "Cambiar tipo" — solo móvil, cuando hay selector de tipo */}
      {onChangeEventType && (
        <button
          onClick={onChangeEventType}
          className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-cream transition-colors mb-6 md:hidden cursor-pointer active:scale-[0.98] rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
        >
          <CaretLeft className="w-4 h-4" weight="regular" />
          Cambiar tipo de reunión
        </button>
      )}

      {/* Heading */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-display font-black text-4xl md:text-5xl text-cream tracking-tighter leading-[0.92] mb-3">
          Elige tu<br />fecha.
        </h1>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-amber flex-none" weight="regular" />
          <span className="text-muted text-xs">{durationMinutes} min · {tzLabel ?? 'Madrid'}</span>
        </div>

        {/* Selector de duración (cal.com) — solo si el tipo ofrece varias */}
        {durations && durations.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {durations.map(min => {
              const active = min === durationMinutes;
              return (
                <button
                  key={min}
                  onClick={() => onDurationChange?.(min)}
                  className={[
                    'rounded-lg border px-3 py-1.5 text-xs transition-all duration-150 cursor-pointer backdrop-blur-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50',
                    active
                      ? 'border-amber bg-amber text-on-amber font-semibold'
                      : 'border-cream/[0.10] bg-navy-card text-cream/60 hover:border-amber/35 hover:text-cream hover:bg-navy-card-hover',
                  ].join(' ')}
                >
                  {min} min
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Atajo "Lo antes posible" — solo cuando hay slots disponibles */}
      {hasAnySlot && (() => {
        const firstDay = data.available_days.find(d => d.slots.length > 0);
        const firstSlot = firstDay?.slots[0];
        if (!firstDay || !firstSlot) return null;
        return (
          <div className="mb-6">
            <button
              onClick={() => onSelect(firstDay, firstSlot)}
              className="inline-flex items-center gap-2 rounded-lg border border-amber/30 bg-amber/[0.06] backdrop-blur-sm hover:bg-amber/[0.12] hover:border-amber/55 px-4 py-2.5 text-cream/85 text-sm transition-all duration-150 cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
            >
              <ArrowRight className="w-4 h-4 text-amber flex-none" weight="regular" />
              Lo antes posible — {firstDay.short_label} · {firstSlot.start_madrid}
            </button>
          </div>
        );
      })()}

      {hasAnySlot ? (
        <div className="flex flex-col md:flex-row md:gap-0">
          {/* Calendar */}
          <div className="w-full md:max-w-[300px] lg:max-w-[320px] flex-none mb-8 md:mb-0 md:pr-8 lg:pr-10">
            <CalendarGrid
              availableDays={data.available_days}
              selectedDate={activeDay?.date ?? null}
              onSelectDate={setActiveDay}
            />
          </div>

          {/* Vertical divider — desktop only */}
          <div className="hidden md:block w-px bg-cream/[0.06] flex-none self-stretch" />

          {/* Time slots */}
          <div
            ref={slotsRef}
            className="md:flex-1 md:pl-8 lg:pl-10 md:max-w-[240px]"
          >
            {activeDay ? (
              <>
                <p className="text-subtle text-[9px] uppercase tracking-widest mb-3 font-medium">
                  {activeDay.label}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5 md:gap-1.5 md:max-h-[55vh] md:overflow-y-auto md:pr-1 slot-scroll">
                  {activeDay.slots.map(slot => (
                    <TimeSlotButton
                      key={slot.start_utc}
                      slot={slot}
                      selected={slot.start_utc === selectedSlotUtc}
                      onSelect={s => onSelect(activeDay, s)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-start justify-center min-h-[120px] md:min-h-[200px] gap-3">
                <div className="w-8 h-8 rounded-lg border border-cream/[0.08] bg-navy-card backdrop-blur-sm flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber/50" weight="regular" />
                </div>
                <p className="text-subtle text-xs leading-relaxed">
                  Selecciona un día<br />para ver los horarios disponibles
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12">
          <p className="text-muted text-base mb-2">No hay disponibilidad en los próximos días.</p>
          <p className="text-subtle text-sm mb-6">Contáctanos directamente para buscar un horario.</p>
          {onChangeEventType && (
            <button
              onClick={onChangeEventType}
              className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-cream transition-colors cursor-pointer active:scale-[0.98] rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
            >
              <CaretLeft className="w-4 h-4" weight="regular" />
              Elegir otro tipo de reunión
            </button>
          )}
        </div>
      )}
    </div>
  );
}

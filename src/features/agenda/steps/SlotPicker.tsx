'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { AvailabilityResponse, AvailableDay, TimeSlot } from '../types';
import DayColumn from '../components/DayColumn';

gsap.registerPlugin(useGSAP);

interface Props {
  data: AvailabilityResponse;
  selectedSlotUtc?: string;
  onSelect: (day: AvailableDay, slot: TimeSlot) => void;
}

export default function SlotPicker({ data, selectedSlotUtc, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('.day-column', {
        y: 24,
        opacity: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out',
      });
    },
    { scope: ref }
  );

  const hasAnySlot = data.available_days.some((d) => d.slots.length > 0);

  return (
    <div ref={ref} className="step-panel">
      <div className="mb-6 text-center">
        <h1 className="font-display text-4xl text-cream mb-2 leading-tight">
          Elige tu fecha y hora
        </h1>
        <p className="text-muted text-sm">
          Todas las horas son en horario de Madrid (Europa/Madrid)
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-soft border border-amber-dim">
          <svg className="w-3.5 h-3.5 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <span className="text-amber text-xs font-medium">{data.duration_minutes} minutos por cita</span>
        </div>
      </div>

      {hasAnySlot ? (
        <div className="flex flex-wrap justify-center gap-4">
          {data.available_days.map((day) => (
            <DayColumn
              key={day.date}
              day={day}
              selectedSlotUtc={selectedSlotUtc}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-muted text-base">No hay disponibilidad en los próximos días.</p>
          <p className="text-subtle text-sm mt-2">Contactanos directamente para buscar un horario.</p>
        </div>
      )}
    </div>
  );
}

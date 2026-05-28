'use client';

import type { AvailableDay, TimeSlot } from '../types';
import TimeSlotButton from './TimeSlotButton';

interface Props {
  day: AvailableDay;
  selectedSlotUtc?: string;
  onSelect: (day: AvailableDay, slot: TimeSlot) => void;
}

export default function DayColumn({ day, selectedSlotUtc, onSelect }: Props) {
  const [weekday, dayNum, ...monthParts] = day.short_label.split(' ');
  const month = monthParts.join(' ');

  const todayMadrid = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
  const isToday = day.date === todayMadrid;

  return (
    <div className="day-column flex-none w-40 snap-start">
      <div className="text-center mb-3 pb-3 border-b border-amber-dim">
        <p className="text-amber text-[10px] font-semibold uppercase tracking-widest mb-0.5">
          {isToday ? 'Hoy' : weekday}
        </p>
        <p className={['text-3xl font-bold leading-none', isToday ? 'text-amber' : 'text-cream'].join(' ')}>
          {dayNum}
        </p>
        <p className="text-muted text-xs mt-0.5">{month}</p>
      </div>

      {day.slots.length > 0 ? (
        <div className="flex flex-col gap-2">
          {day.slots.map((slot) => (
            <TimeSlotButton
              key={slot.start_utc}
              slot={slot}
              selected={slot.start_utc === selectedSlotUtc}
              onSelect={(s) => onSelect(day, s)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-subtle text-xs py-6">Sin disponibilidad</p>
      )}
    </div>
  );
}

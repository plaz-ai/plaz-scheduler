'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Clock, VideoCamera, CaretRight } from '@phosphor-icons/react';
import type { EventType } from '../types';

gsap.registerPlugin(useGSAP);

interface Props {
  eventTypes: EventType[];
  onSelect: (eventType: EventType) => void;
}

// Pantalla previa estilo cal.com: el invitado elige QUÉ tipo de reunión antes
// de ver el calendario.
export default function EventTypePicker({ eventTypes, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('.event-card', {
        y: 14,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="step-panel">
      <div className="mb-6 md:mb-8">
        <h1 className="font-display font-black text-4xl md:text-5xl text-cream tracking-tighter leading-[0.92] mb-3">
          ¿Qué quieres<br />agendar?
        </h1>
        <p className="text-muted text-xs">Elige el tipo de reunión para ver los horarios.</p>
      </div>

      <div className="flex flex-col gap-2.5 max-w-2xl">
        {eventTypes.map((et) => (
          <button
            key={et.id}
            onClick={() => onSelect(et)}
            className="
              event-card group flex items-center gap-4 text-left
              rounded-xl border border-cream/[0.08] bg-cream/[0.02]
              px-5 py-4 transition-all duration-150 cursor-pointer
              hover:border-amber/40 hover:bg-cream/[0.04] active:scale-[0.99]
              focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50
            "
          >
            <div className="flex-1 min-w-0">
              <p className="text-cream text-sm font-semibold mb-1">{et.title}</p>
              <p className="text-muted text-xs leading-relaxed mb-2.5 line-clamp-2 min-h-[3.25em]">{et.description}</p>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-subtle text-[11px]">
                  <Clock className="w-3 h-3 text-amber/70" weight="regular" />
                  {et.length_minutes} min
                </span>
                <span className="inline-flex items-center gap-1.5 text-subtle text-[11px]">
                  <VideoCamera className="w-3 h-3 text-amber/70" weight="regular" />
                  {et.location_label}
                </span>
              </div>
            </div>
            <CaretRight className="w-4 h-4 text-subtle group-hover:text-amber flex-none transition-colors" weight="bold" />
          </button>
        ))}
      </div>
    </div>
  );
}

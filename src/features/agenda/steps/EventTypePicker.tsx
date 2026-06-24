'use client';

import { Clock, VideoCamera, CaretRight } from '@phosphor-icons/react';
import type { EventType } from '../types';

interface Props {
  eventTypes: EventType[];
  onSelect: (eventType: EventType) => void;
}

export default function EventTypePicker({ eventTypes, onSelect }: Props) {
  return (
    <div className="step-panel">
      <div className="mb-6 md:mb-8">
        <h1 className="font-display font-black text-4xl md:text-5xl text-cream tracking-tighter leading-[0.92] mb-3">
          ¿Qué quieres<br />agendar?
        </h1>
        <p className="text-muted text-xs">Elige el tipo de reunión para ver los horarios.</p>
      </div>

      {/*
        Mobile: carrusel horizontal con scroll-snap — el contenedor sangra hasta
        el borde del viewport (-mx + px) para que sea el único que recorte.
        Desktop (md): lista vertical normal, max-w-2xl.
      */}
      <div className="
        flex gap-3
        overflow-x-auto -mx-6 px-6 pb-3
        snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        md:flex-col md:overflow-x-visible md:mx-0 md:px-0 md:pb-0 md:snap-none md:max-w-2xl
      ">
        {eventTypes.map((et) => (
          <button
            key={et.id}
            onClick={() => onSelect(et)}
            className="
              event-card group
              flex-none snap-start w-[280px] max-w-[calc(100vw-3rem)]
              md:flex-auto md:w-full md:max-w-none
              flex items-center gap-4 text-left
              rounded-xl border border-cream/[0.08] bg-navy-card backdrop-blur-sm
              px-5 py-4 transition-all duration-200 cursor-pointer
              hover:border-amber/35 hover:bg-navy-card-hover active:scale-[0.99]
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

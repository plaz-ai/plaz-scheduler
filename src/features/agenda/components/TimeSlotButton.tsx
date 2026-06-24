'use client';

import type { TimeSlot } from '../types';

interface Props {
  slot: TimeSlot;
  selected: boolean;
  onSelect: (slot: TimeSlot) => void;
}

// Patrón cal.com: en reposo muestra la hora; al hover (o si está seleccionado)
// se divide en "hora | Confirmar". En móvil el tap directo confirma igual.
export default function TimeSlotButton({ slot, selected, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(slot)}
      className={[
        'slot-btn group relative w-full h-10 rounded-lg border overflow-hidden',
        'flex items-stretch transition-all duration-150 cursor-pointer active:scale-[0.98]',
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50',
        selected
          ? 'border-amber'
          : 'border-cream/[0.08] hover:border-amber/40',
      ].join(' ')}
    >
      {/* Hora — cede espacio al revelarse "Confirmar" */}
      <span
        className={[
          'flex-1 flex items-center justify-center text-sm font-mono transition-all duration-150',
          selected
            ? 'text-amber font-semibold bg-amber/[0.06]'
            : 'text-cream/60 group-hover:text-cream group-hover:flex-none group-hover:px-4',
        ].join(' ')}
      >
        {slot.start_madrid}
      </span>

      {/* Confirmar — aparece en hover (desktop) */}
      <span
        className={[
          'flex items-center justify-center bg-amber text-on-amber text-xs font-semibold',
          'transition-all duration-150 overflow-hidden',
          'w-0 opacity-0 group-hover:flex-1 group-hover:opacity-100',
        ].join(' ')}
      >
        Confirmar
      </span>
    </button>
  );
}

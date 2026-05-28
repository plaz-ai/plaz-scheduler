'use client';

import type { TimeSlot } from '../types';

interface Props {
  slot: TimeSlot;
  selected: boolean;
  onSelect: (slot: TimeSlot) => void;
}

export default function TimeSlotButton({ slot, selected, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(slot)}
      className={[
        'slot-btn w-full py-2.5 px-3 text-sm font-mono text-center rounded-lg border',
        'transition-all duration-100 cursor-pointer active:scale-95',
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50',
        selected
          ? 'bg-amber/15 border-amber text-amber font-semibold shadow-sm shadow-amber/10'
          : 'bg-transparent border-cream/[0.08] text-cream/55 hover:text-cream hover:border-cream/20 hover:bg-cream/[0.04]',
      ].join(' ')}
    >
      {slot.start_madrid}
    </button>
  );
}

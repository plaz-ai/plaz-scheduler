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
        'slot-btn w-full py-2.5 px-1 text-sm font-mono text-center',
        'border-b transition-all duration-150 cursor-pointer active:scale-[0.97]',
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/50',
        selected
          ? 'text-amber border-amber font-semibold'
          : 'text-cream/55 border-cream/[0.08] hover:text-cream hover:border-cream/25',
      ].join(' ')}
    >
      {slot.start_madrid}
    </button>
  );
}

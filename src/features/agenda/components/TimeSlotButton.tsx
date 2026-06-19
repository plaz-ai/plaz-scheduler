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
      type="button"
      onClick={() => onSelect(slot)}
      className={[
        'w-full py-3 px-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer',
        'border focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60',
        selected
          ? 'bg-amber border-amber text-navy font-semibold shadow-lg shadow-amber/20'
          : 'bg-navy-light/50 border-amber-dim text-cream/75 hover:bg-navy-light hover:border-amber/35 hover:text-cream hover:scale-[1.02]',
      ].join(' ')}
    >
      {slot.start_madrid}
    </button>
  );
}

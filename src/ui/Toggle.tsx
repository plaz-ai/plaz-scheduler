'use client';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string; // para accesibilidad
}

export default function Toggle({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="p-2.5 -m-2.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 rounded-xl"
    >
      <span
        className={[
          'relative block w-11 h-6 rounded-full transition-colors duration-200',
          checked ? 'bg-amber' : 'bg-navy-light',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-cream transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </span>
    </button>
  );
}

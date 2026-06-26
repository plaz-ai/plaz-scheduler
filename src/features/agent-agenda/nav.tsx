import type { NavItem } from '@/ui/AppShell';

const CalIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);

export function agentNav(token: string, active: 'agenda' | 'disponibilidad'): NavItem[] {
  return [
    { href: `/agente/?token=${token}`, label: 'Agenda', icon: CalIcon, active: active === 'agenda' },
    { href: `/agente/disponibilidad/?token=${token}`, label: 'Disponibilidad', icon: ClockIcon, active: active === 'disponibilidad' },
  ];
}

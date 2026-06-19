import type { Metadata } from 'next';
import AgendaLoader from '@/features/agenda/AgendaLoader';

export const metadata: Metadata = {
  title: 'Agenda tu cita | Plaz',
};

export default function Page() {
  return <AgendaLoader />;
}

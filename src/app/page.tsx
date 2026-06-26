import type { Metadata } from 'next';
import HomePage from '@/features/home/HomePage';

export const metadata: Metadata = {
  title: 'Plaz · Agenda tu cita',
  description: 'Agenda una cita con el equipo comercial de Plaz en minutos.',
};

export default function Page() {
  return <HomePage />;
}

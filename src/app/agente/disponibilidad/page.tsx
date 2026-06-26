import type { Metadata } from 'next';
import AvailabilityLoader from '@/features/availability/AvailabilityLoader';

export const metadata: Metadata = {
  title: 'Tu disponibilidad | Plaz',
};

export default function Page() {
  return <AvailabilityLoader />;
}

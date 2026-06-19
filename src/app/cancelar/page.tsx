import type { Metadata } from 'next';
import CancelLoader from '@/features/cancel/CancelLoader';

export const metadata: Metadata = {
  title: 'Cancelar tu cita | Plaz',
};

export default function Page() {
  return <CancelLoader />;
}

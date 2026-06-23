import type { Metadata } from 'next';
import CancelLoader from '@/features/cancel/CancelLoader';

export const metadata: Metadata = {
  title: 'Cancelar reserva | Plaz',
};

export default function Page() {
  return <CancelLoader />;
}

import type { Metadata } from 'next';
import CancelPage from '@/features/cancel/CancelPage';

interface Props {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: 'Cancelar tu cita | Plaz',
};

export default async function Page({ params }: Props) {
  const { token } = await params;
  return <CancelPage token={token} />;
}

import type { Metadata } from 'next';
import AgendaPage from '@/features/agenda/AgendaPage';

interface Props {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: 'Agenda tu cita | Plaz',
};

export default async function Page({ params }: Props) {
  const { token } = await params;
  return <AgendaPage token={token} />;
}

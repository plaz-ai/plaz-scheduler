import type { Metadata } from 'next';
import AgentAgendaLoader from '@/features/agent-agenda/AgentAgendaLoader';

export const metadata: Metadata = {
  title: 'Tu agenda | Plaz',
};

export default function Page() {
  return <AgentAgendaLoader />;
}

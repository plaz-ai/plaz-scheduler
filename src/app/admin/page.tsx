import type { Metadata } from 'next';
import AdminTeamLoader from '@/features/admin-team/AdminTeamLoader';

export const metadata: Metadata = {
  title: 'Equipo | Plaz',
};

export default function Page() {
  return <AdminTeamLoader />;
}

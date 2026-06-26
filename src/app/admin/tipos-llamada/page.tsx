import type { Metadata } from 'next';
import AdminCallTypesLoader from '@/features/admin-call-types/AdminCallTypesLoader';

export const metadata: Metadata = {
  title: 'Tipos de llamada | Plaz',
};

export default function Page() {
  return <AdminCallTypesLoader />;
}

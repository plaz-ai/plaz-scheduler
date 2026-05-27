import { Suspense } from 'react';
import AgendaLoader from '@/features/agenda/AgendaLoader';

export default function Page() {
  return (
    <Suspense>
      <AgendaLoader />
    </Suspense>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AgentAgendaPage from './AgentAgendaPage';

function Inner() {
  const token = useSearchParams().get('token') ?? '';

  if (!token) {
    return (
      <div className="min-h-dvh app-shell flex items-center justify-center">
        <p className="text-subtle text-sm">Link de agenda inválido.</p>
      </div>
    );
  }

  return <AgentAgendaPage token={token} />;
}

export default function AgentAgendaLoader() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}

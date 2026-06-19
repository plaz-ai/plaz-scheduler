'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AgendaPage from './AgendaPage';

function AgendaInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('id') ?? '';

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <p className="text-muted text-sm">Link de agenda inválido.</p>
      </div>
    );
  }

  return <AgendaPage token={token} />;
}

export default function AgendaLoader() {
  return (
    <Suspense>
      <AgendaInner />
    </Suspense>
  );
}

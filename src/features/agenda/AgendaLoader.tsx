'use client';

import { useSearchParams } from 'next/navigation';
import AgendaPage from './AgendaPage';

export default function AgendaLoader() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted text-sm">Link de agenda inválido.</p>
      </div>
    );
  }

  return <AgendaPage token={token} />;
}

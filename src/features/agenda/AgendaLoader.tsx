'use client';

import { useParams } from 'next/navigation';
import AgendaPage from './AgendaPage';

export default function AgendaLoader() {
  const params = useParams<{ id: string }>();
  const token = params?.id ?? '';

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted text-sm">Link de agenda inválido.</p>
      </div>
    );
  }

  return <AgendaPage token={token} />;
}

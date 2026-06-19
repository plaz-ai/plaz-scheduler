'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import CancelPage from './CancelPage';

function CancelInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <p className="text-muted text-sm">Enlace de cancelación inválido.</p>
      </div>
    );
  }

  return <CancelPage token={token} />;
}

export default function CancelLoader() {
  return (
    <Suspense>
      <CancelInner />
    </Suspense>
  );
}

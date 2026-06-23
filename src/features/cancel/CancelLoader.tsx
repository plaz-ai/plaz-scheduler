'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import CancelPage from './CancelPage';

function CancelInner() {
  const params = useSearchParams();
  const bookingId = params.get('booking_id') ?? '';
  const token = params.get('token') ?? '';

  if (!bookingId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <p className="text-muted text-sm">Link de cancelación inválido.</p>
      </div>
    );
  }

  return <CancelPage bookingId={bookingId} token={token} />;
}

export default function CancelLoader() {
  return (
    <Suspense>
      <CancelInner />
    </Suspense>
  );
}

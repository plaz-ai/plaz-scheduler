'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AvailabilityEditor from './AvailabilityEditor';

function Inner() {
  const token = useSearchParams().get('token') ?? '';

  if (!token) {
    return (
      <div className="min-h-dvh app-shell flex items-center justify-center">
        <p className="text-subtle text-sm">Link de disponibilidad inválido.</p>
      </div>
    );
  }

  return <AvailabilityEditor token={token} />;
}

export default function AvailabilityLoader() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}

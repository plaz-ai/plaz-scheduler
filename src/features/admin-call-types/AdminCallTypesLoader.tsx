'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AdminCallTypesPage from './AdminCallTypesPage';

function Inner() {
  const token = useSearchParams().get('token') ?? '';

  if (!token) {
    return (
      <div className="min-h-dvh app-shell flex items-center justify-center">
        <p className="text-subtle text-sm">Link de administración inválido.</p>
      </div>
    );
  }

  return <AdminCallTypesPage token={token} />;
}

export default function AdminCallTypesLoader() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}

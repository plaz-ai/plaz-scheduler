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
      <div className="min-h-[100dvh] flex flex-col bg-navy">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <header className="relative z-10 px-6 md:px-10 py-6 border-b border-cream/[0.06]">
          <a href="/plaz-scheduler/agenda/" className="font-display text-xl font-black tracking-tight text-cream hover:opacity-75 transition-opacity">
            Plaz<span className="text-amber">.</span>
          </a>
        </header>
        <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md space-y-4">
            <p className="text-cream text-base">Link de cancelación inválido.</p>
            <p className="text-muted text-sm">El link no contiene los parámetros necesarios.</p>
            <a
              href="/plaz-scheduler/agenda/"
              className="inline-flex items-center gap-2 text-amber text-sm hover:opacity-75 transition-opacity mt-2"
            >
              Nueva reserva →
            </a>
          </div>
        </main>
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

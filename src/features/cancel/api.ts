import type { CancelDetails, CancelResult } from './types';

const BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL ?? '';
const USE_MOCK = BASE === '';

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function mockDetails(cancelToken: string): CancelDetails {
  // El token mock codifica la fecha: "mock-<timestamp>".
  const ts = Number(cancelToken.replace('mock-', ''));
  const start = Number.isFinite(ts) ? new Date(ts) : new Date();
  return {
    booking_id: cancelToken,
    host_name: 'Juana Gil',
    start_utc: start.toISOString(),
    start_madrid: start.toLocaleString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    }),
    duration_minutes: 30,
    booker_name: 'María García',
    status: cancelToken.includes('cancelled') ? 'cancelled' : 'confirmed',
  };
}

export async function fetchCancelDetails(cancelToken: string): Promise<CancelDetails> {
  if (USE_MOCK) {
    if (cancelToken.includes('invalid')) { await delay(null, 400); throw new Error('mock: enlace inválido'); }
    return delay(mockDetails(cancelToken));
  }

  const res = await fetch(
    `${BASE}/webhook/plaz-scheduler-cancel-details?cancel_token=${encodeURIComponent(cancelToken)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export async function cancelBooking(cancelToken: string): Promise<CancelResult> {
  if (USE_MOCK) {
    if (cancelToken.includes('cancelfail')) { await delay(null, 400); throw new Error('mock: fallo al cancelar'); }
    return delay({ status: 'cancelled' });
  }

  const res = await fetch(`${BASE}/webhook/plaz-scheduler-cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cancel_token: cancelToken }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

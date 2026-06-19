import type { AvailabilityResponse, BookingPayload, BookingResult } from './types';
import { mockAvailability, mockBooking } from './mock';

const BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL ?? '';

// Sin backend configurado, el front trabaja con datos simulados.
const USE_MOCK = BASE === '';

// Pequeña latencia para que la UI (loaders, transiciones) se comporte como en real.
function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function fetchAvailability(linkToken: string): Promise<AvailabilityResponse> {
  if (USE_MOCK) return delay(mockAvailability());

  const res = await fetch(
    `${BASE}/webhook/plaz-scheduler-get-availability?link_token=${encodeURIComponent(linkToken)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export async function createBooking(payload: BookingPayload): Promise<BookingResult> {
  if (USE_MOCK) return delay(mockBooking(payload));

  const res = await fetch(`${BASE}/webhook/plaz-scheduler-booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

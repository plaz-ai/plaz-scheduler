import type { AvailabilityResponse, BookingPayload, BookingResult } from './types';

const BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL ?? '';

export async function fetchAvailability(linkToken: string): Promise<AvailabilityResponse> {
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

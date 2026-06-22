import type { AvailabilityResponse, BookingPayload, BookingResult, RescheduleInfo, ReschedulePayload } from './types';
import { mockAvailability, mockBooking, mockRescheduleInfo, mockReschedule } from './mock';

const BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL ?? '';

// Sin backend configurado, el front trabaja con datos simulados.
const USE_MOCK = BASE === '';

// Pequeña latencia para que la UI (loaders, transiciones) se comporte como en real.
function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function formatMadridDateTime(startUtc: string): string {
  const date = new Date(startUtc);
  if (Number.isNaN(date.getTime())) return '';

  const day = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  const time = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  return `${day} · ${time}`;
}

export async function fetchAvailability(linkToken: string): Promise<AvailabilityResponse> {
  if (USE_MOCK) {
    if (linkToken.includes('error')) { await delay(null, 400); throw new Error('mock: fallo de red'); }
    return delay(mockAvailability(linkToken));
  }

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
  if (USE_MOCK) {
    if (payload.link_token.includes('bookfail')) { await delay(null, 400); throw new Error('mock: fallo al reservar'); }
    return delay(mockBooking(payload));
  }

  const res = await fetch(`${BASE}/webhook/plaz-scheduler-booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }

  const booking = await res.json() as Partial<BookingResult> & { status?: string; message?: string };
  if (booking.status !== 'confirmed' || !booking.start_utc) {
    throw new Error(booking.message ?? 'La reserva no pudo confirmarse.');
  }

  return {
    ...booking,
    status: 'confirmed',
    start_madrid: booking.start_madrid ?? formatMadridDateTime(booking.start_utc),
  } as BookingResult;
}

// --- Reagendar ---
// Contrato pendiente en backend (ticket para nico): el webhook debe devolver la
// disponibilidad del mismo host/evento + los datos de la reserva original.
export async function fetchRescheduleInfo(bookingUid: string): Promise<RescheduleInfo> {
  if (USE_MOCK) {
    if (bookingUid.includes('error')) { await delay(null, 400); throw new Error('mock: fallo de red'); }
    return delay(mockRescheduleInfo(bookingUid));
  }

  const res = await fetch(
    `${BASE}/webhook/plaz-scheduler-reschedule-info?booking_uid=${encodeURIComponent(bookingUid)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export async function rescheduleBooking(payload: ReschedulePayload): Promise<BookingResult> {
  if (USE_MOCK) {
    if (payload.booking_uid.includes('bookfail')) { await delay(null, 400); throw new Error('mock: fallo al reagendar'); }
    return delay(mockReschedule(payload));
  }

  const res = await fetch(`${BASE}/webhook/plaz-scheduler-reschedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }

  const booking = await res.json() as Partial<BookingResult> & { status?: string; message?: string };
  if (booking.status !== 'confirmed' || !booking.start_utc) {
    throw new Error(booking.message ?? 'No se pudo reagendar la cita.');
  }

  return {
    ...booking,
    status: 'confirmed',
    start_madrid: booking.start_madrid ?? formatMadridDateTime(booking.start_utc),
  } as BookingResult;
}
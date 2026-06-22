// Datos simulados para desarrollar el front sin backend.
// Se usan cuando NEXT_PUBLIC_N8N_BASE_URL no está definido.
import type { AvailabilityResponse, AvailableDay, BookingPayload, BookingResult, TimeSlot } from './types';

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const DURATION_MINUTES = 30;
const SLOT_HOURS = [9, 10, 11, 12, 16, 17]; // horario laboral con pausa de mediodía

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function buildDay(date: Date): AvailableDay {
  const day = date.getDate();
  const slots: TimeSlot[] = SLOT_HOURS.map((hour) => {
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + DURATION_MINUTES);
    return {
      start_utc: start.toISOString(),
      start_madrid: `${pad(hour)}:00`,
      end_utc: end.toISOString(),
    };
  });

  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(day)}`,
    label: `${WEEKDAYS[date.getDay()]}, ${day} de ${MONTHS[date.getMonth()]}`,
    short_label: `${WEEKDAYS_SHORT[date.getDay()]} ${day}`,
    slots,
  };
}

export function mockAvailability(linkToken = ''): AvailabilityResponse {
  const base = { team_name: 'Juana Gil', duration_minutes: DURATION_MINUTES };

  // Estados de prueba según el token (solo en modo mock).
  if (linkToken.includes('expired')) return { ...base, available_days: [], link_expired: true };
  if (linkToken.includes('exhausted')) return { ...base, available_days: [], link_exhausted: true };
  if (linkToken.includes('empty')) return { ...base, available_days: [] };

  const days: AvailableDay[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // Próximos días laborables, hasta reunir 4
  while (days.length < 4) {
    cursor.setDate(cursor.getDate() + 1);
    const weekday = cursor.getDay();
    if (weekday === 0 || weekday === 6) continue; // saltar fin de semana
    days.push(buildDay(new Date(cursor)));
  }

  return { ...base, available_days: days };
}

export function mockBooking(payload: BookingPayload): BookingResult {
  const start = new Date(payload.slot_utc);
  const cancelToken = `mock-${start.getTime()}`;
  return {
    status: 'confirmed',
    booking_id: cancelToken,
    host_name: 'Juana Gil',
    start_utc: payload.slot_utc,
    start_madrid: start.toLocaleString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    }),
    cancel_url: `#cancelacion-${cancelToken}`,
  };
}

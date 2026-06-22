// Datos simulados para desarrollar el front sin backend.
// Se usan cuando NEXT_PUBLIC_N8N_BASE_URL no está definido.
import type { AvailabilityResponse, AvailableDay, BookingPayload, BookingResult, EventType, TimeSlot } from './types';

// Tipos de evento simulados (clon cal.com). En producción los slots reales vienen
// del backend; aquí solo demostramos la pantalla de selección estilo cal.com.
const MOCK_EVENT_TYPES: EventType[] = [
  {
    id: 'descubrimiento',
    slug: 'descubrimiento',
    title: 'Llamada de descubrimiento',
    description: 'Una primera conversación para entender tu caso y ver si encajamos.',
    length_minutes: 15,
    location_label: 'Google Meet',
  },
  {
    id: 'consulta',
    slug: 'consulta',
    title: 'Consulta con un comercial',
    description: 'Sesión para resolver dudas y plantear los próximos pasos.',
    length_minutes: 30,
    available_durations: [15, 30, 45],
    location_label: 'Google Meet',
    questions: [
      { id: 'empresa', label: 'Empresa', type: 'text', required: false, placeholder: 'Plaz S.L.' },
      { id: 'tema', label: '¿Qué quieres tratar?', type: 'textarea', required: true, placeholder: 'Cuéntanos brevemente tu caso…' },
    ],
  },
  {
    id: 'estrategia',
    slug: 'estrategia',
    title: 'Sesión de estrategia',
    description: 'Sesión en profundidad para diseñar un plan a medida contigo.',
    length_minutes: 60,
    available_durations: [30, 60, 90],
    location_label: 'Google Meet',
    questions: [
      { id: 'empresa', label: 'Empresa', type: 'text', required: true, placeholder: 'Plaz S.L.' },
      { id: 'telefono', label: 'Teléfono de contacto', type: 'tel', required: false, placeholder: '+34 600 000 000' },
      { id: 'objetivos', label: 'Objetivos de la sesión', type: 'textarea', required: true, placeholder: '¿Qué te gustaría conseguir?' },
    ],
  },
];

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
  const base = { team_name: 'Juana Gil', duration_minutes: DURATION_MINUTES, event_types: MOCK_EVENT_TYPES };

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

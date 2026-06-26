import type { DayAvailability, WeeklySchedule } from './types';

export const TZ = 'Europe/Madrid';

// Zonas horarias ofrecidas en el editor (España + Europa + LatAm habituales).
export const TIMEZONES: string[] = [
  'Europe/Madrid',
  'Atlantic/Canary',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Paris',
  'America/Mexico_City',
  'America/Bogota',
  'America/Argentina/Buenos_Aires',
  'America/New_York',
];

export const WEEKDAY_LABELS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];
export const WORKDAYS = [1, 2, 3, 4, 5];

// Horario por defecto: L-V 09:00-18:00, fin de semana libre.
export function defaultSchedule(): WeeklySchedule {
  const days: DayAvailability[] = WEEKDAYS.map((weekday) => ({
    weekday,
    enabled: WORKDAYS.includes(weekday),
    ranges: WORKDAYS.includes(weekday) ? [{ start: '09:00', end: '18:00' }] : [],
  }));
  return { timezone: TZ, days };
}

const TIME_RE = /^\d{2}:\d{2}$/;

// Normaliza una respuesta del backend a 7 días ordenados, descartando
// tramos con formato de hora inválido (el backend podría enviar "9:00" o basura).
export function normalize(schedule: WeeklySchedule | null): WeeklySchedule {
  if (!schedule || !schedule.days?.length) return defaultSchedule();
  const byDay = new Map(schedule.days.map((d) => [d.weekday, d]));
  const days = WEEKDAYS.map((weekday) => {
    const d = byDay.get(weekday) ?? { weekday, enabled: false, ranges: [] };
    const ranges = (d.ranges ?? []).filter(
      (r) => TIME_RE.test(r.start) && TIME_RE.test(r.end)
    );
    return { weekday, enabled: !!d.enabled, ranges };
  });
  return { timezone: schedule.timezone || TZ, days };
}

// Un día activo es válido si todos sus tramos tienen fin > inicio y NO se solapan
// entre sí (el cálculo de slots en n8n asume tramos disjuntos y ordenados).
export function dayIsValid(day: DayAvailability): boolean {
  if (!day.enabled) return true;
  if (day.ranges.length === 0) return false;
  if (!day.ranges.every((r) => r.start < r.end)) return false;
  const sorted = [...day.ranges].sort((a, b) => a.start.localeCompare(b.start));
  return sorted.every((r, i) => i === 0 || sorted[i - 1].end <= r.start);
}

export function scheduleIsValid(schedule: WeeklySchedule): boolean {
  return schedule.days.every(dayIsValid);
}

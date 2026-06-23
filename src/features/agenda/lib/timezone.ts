import type { AvailabilityResponse, AvailableDay, TimeSlot } from '../types';

/** Timezone del navegador, con fallback a Madrid. */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid';
  } catch {
    return 'Europe/Madrid';
  }
}

/** Ciudad legible para mostrar en UI ("Madrid", "Ciudad de México", "Buenos Aires"). */
const TZ_CITIES: Record<string, string> = {
  'Europe/Madrid': 'Madrid',
  'Europe/London': 'Londres',
  'Europe/Paris': 'París',
  'Europe/Berlin': 'Berlín',
  'Europe/Rome': 'Roma',
  'Europe/Lisbon': 'Lisboa',
  'America/Mexico_City': 'Ciudad de México',
  'America/Bogota': 'Bogotá',
  'America/Lima': 'Lima',
  'America/Santiago': 'Santiago',
  'America/Buenos_Aires': 'Buenos Aires',
  'America/Argentina/Buenos_Aires': 'Buenos Aires',
  'America/Caracas': 'Caracas',
  'America/Guayaquil': 'Guayaquil',
  'America/La_Paz': 'La Paz',
  'America/Asuncion': 'Asunción',
  'America/Montevideo': 'Montevideo',
  'America/Havana': 'La Habana',
  'America/Santo_Domingo': 'Santo Domingo',
  'America/Panama': 'Panamá',
  'America/Costa_Rica': 'San José',
  'America/Managua': 'Managua',
  'America/Tegucigalpa': 'Tegucigalpa',
  'America/Guatemala': 'Ciudad de Guatemala',
  'America/El_Salvador': 'San Salvador',
  'America/New_York': 'Nueva York',
  'America/Los_Angeles': 'Los Ángeles',
  'America/Chicago': 'Chicago',
  'America/Denver': 'Denver',
  'America/Miami': 'Miami',
  'America/Sao_Paulo': 'São Paulo',
  'America/Toronto': 'Toronto',
  'America/Vancouver': 'Vancouver',
};

export function tzCityName(tz: string): string {
  if (TZ_CITIES[tz]) return TZ_CITIES[tz];
  // Fallback: extrae la ciudad del identificador IANA ("America/New_York" → "New York")
  const city = tz.split('/').pop() ?? tz;
  return city.replace(/_/g, ' ');
}

/**
 * Reagrupa los slots de `data` por fecha local del invitado.
 * Rellena `start_madrid` (campo de display) con la hora en la TZ dada.
 * Si la TZ ya es Europe/Madrid la transformación es identity (mismos días, mismas horas).
 */
export function regroupByTimezone(
  data: AvailabilityResponse,
  tz: string,
): AvailabilityResponse {
  if (!data.available_days.length) return data;

  const timeFmt = new Intl.DateTimeFormat('es-ES', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const labelFmt = new Intl.DateTimeFormat('es-ES', {
    timeZone: tz,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const shortFmt = new Intl.DateTimeFormat('es-ES', {
    timeZone: tz,
    weekday: 'short',
    day: 'numeric',
  });
  const dateParts = new Intl.DateTimeFormat('es-ES', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // Aplanar todos los slots y re-etiquetar la hora de display.
  const allSlots: TimeSlot[] = data.available_days.flatMap(d => d.slots);
  const grouped = new Map<string, TimeSlot[]>();

  for (const slot of allSlots) {
    const d = new Date(slot.start_utc);
    const parts = dateParts.formatToParts(d);
    const y = parts.find(p => p.type === 'year')?.value ?? '';
    const mo = parts.find(p => p.type === 'month')?.value ?? '';
    const da = parts.find(p => p.type === 'day')?.value ?? '';
    const key = `${y}-${mo}-${da}`;

    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push({
      ...slot,
      start_madrid: timeFmt.format(d), // hora local del invitado
    });
  }

  const days: AvailableDay[] = [];
  for (const [dateKey, slots] of [...grouped.entries()].sort()) {
    const ref = new Date(slots[0].start_utc);
    const rawLabel = labelFmt.format(ref);
    const rawShort = shortFmt.format(ref);
    days.push({
      date: dateKey,
      label: rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1),
      short_label: rawShort.charAt(0).toUpperCase() + rawShort.slice(1),
      slots,
    });
  }

  return { ...data, available_days: days };
}

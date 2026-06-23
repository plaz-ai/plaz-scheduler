import type { AvailabilityResponse, AvailableDay, TimeSlot } from '../types';

/** Timezone del navegador, con fallback a Madrid. */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid';
  } catch {
    return 'Europe/Madrid';
  }
}

/** Nombre corto de la zona horaria para mostrar en UI ("CEST", "GMT-5", …). */
export function tzShortName(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat('es-ES', {
      timeZone: tz,
      timeZoneName: 'short',
    }).formatToParts(new Date());
    return parts.find(p => p.type === 'timeZoneName')?.value ?? tz;
  } catch {
    return tz;
  }
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

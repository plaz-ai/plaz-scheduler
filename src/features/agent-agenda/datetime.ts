// Formateo en horario de Madrid a partir del start_utc (ISO).
const TZ = 'Europe/Madrid';

const dayKeyFmt = new Intl.DateTimeFormat('es-ES', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
});
const dayLabelFmt = new Intl.DateTimeFormat('es-ES', {
  timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long',
});
const timeFmt = new Intl.DateTimeFormat('es-ES', {
  timeZone: TZ, hour: '2-digit', minute: '2-digit',
});

export function dayKey(iso: string): string {
  return dayKeyFmt.format(new Date(iso));
}

export function dayLabel(iso: string): string {
  const s = dayLabelFmt.format(new Date(iso));
  return s.charAt(0).toUpperCase() + s.slice(1); // "Miércoles 18 de junio"
}

export function timeLabel(iso: string): string {
  return timeFmt.format(new Date(iso));
}

// Una cita es "pasada" solo cuando ya terminó (inicio + duración < ahora);
// así una cita en curso sigue en "Próximas" y conserva el botón de unirse.
export function isPast(iso: string, durationMinutes = 0): boolean {
  return new Date(iso).getTime() + durationMinutes * 60_000 < Date.now();
}

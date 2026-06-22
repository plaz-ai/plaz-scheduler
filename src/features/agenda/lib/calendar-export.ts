// Genera enlaces "añadir al calendario" y un archivo .ics descargable a partir
// de una reserva confirmada. Todo se construye en el cliente desde start_utc +
// duración, sin necesidad de backend (paridad cal.com, carril front).

export interface CalEvent {
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  uid?: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// Formato compacto UTC para Google/ICS: YYYYMMDDTHHMMSSZ
function toCompactUtc(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

// Escapado de texto para campos ICS (RFC 5545): backslash, coma, punto y coma, saltos.
function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function googleCalendarUrl(e: CalEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${toCompactUtc(e.start)}/${toCompactUtc(e.end)}`,
  });
  if (e.description) params.set('details', e.description);
  if (e.location) params.set('location', e.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(e: CalEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: e.title,
    startdt: e.start.toISOString(),
    enddt: e.end.toISOString(),
  });
  if (e.description) params.set('body', e.description);
  if (e.location) params.set('location', e.location);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function buildIcs(e: CalEvent): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Plaz//Scheduler//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.uid ?? toCompactUtc(e.start)}@plaz.ai`,
    `DTSTAMP:${toCompactUtc(e.start)}`,
    `DTSTART:${toCompactUtc(e.start)}`,
    `DTEND:${toCompactUtc(e.end)}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    ...(e.location ? [`LOCATION:${escapeIcs(e.location)}`] : []),
    ...(e.description ? [`DESCRIPTION:${escapeIcs(e.description)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// Crea un object URL para el .ics (el llamador debe revocarlo tras usarlo).
export function icsObjectUrl(e: CalEvent): string {
  const blob = new Blob([buildIcs(e)], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

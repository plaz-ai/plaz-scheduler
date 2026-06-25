'use client';

// Alta automática del evento en el Google Calendar DEL INVITADO, solo en cliente:
// Google Identity Services (token OAuth de corta vida) + Calendar API events.insert.
// Sin backend, sin secretos (el Client ID es público) y sin dependencias npm.
import type { CalEvent } from './calendar-export';

interface TokenResponse {
  access_token?: string;
  error?: string;
}
interface TokenClient {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: TokenResponse) => void;
            error_callback?: (err: { type?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const SCOPE = 'https://www.googleapis.com/auth/calendar.events';

/** Client ID OAuth (Web) público, inyectado en build. Sin él, la función queda inactiva. */
export function getGoogleClientId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  return id && id.trim() !== '' ? id : undefined;
}

let gisPromise: Promise<void> | null = null;

/** Carga el SDK de Google Identity Services una sola vez (solo cliente). */
export function loadGis(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('GIS solo en cliente'));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisPromise) return gisPromise;

  gisPromise = new Promise<void>((resolve, reject) => {
    const done = () => {
      if (window.google?.accounts?.oauth2) resolve();
      else reject(new Error('GIS cargó sin oauth2'));
    };
    const fail = () => {
      gisPromise = null;
      reject(new Error('No se pudo cargar Google Identity Services'));
    };
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      if (window.google?.accounts?.oauth2) return resolve();
      existing.addEventListener('load', done);
      existing.addEventListener('error', fail);
      return;
    }
    const s = document.createElement('script');
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = done;
    s.onerror = fail;
    document.head.appendChild(s);
  });
  return gisPromise;
}

/** Pide un access_token al invitado (popup de consentimiento la primera vez). */
function getAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const oauth2 = window.google?.accounts?.oauth2;
    if (!oauth2) {
      reject(new Error('GIS no disponible'));
      return;
    }
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp) => {
        if (resp.access_token) resolve(resp.access_token);
        else reject(new Error(resp.error || 'No se obtuvo token'));
      },
      error_callback: (err) => reject(new Error(err?.type || 'Consentimiento cancelado')),
    });
    client.requestAccessToken();
  });
}

/**
 * Inserta el evento en el calendario principal del invitado.
 * Lanza si no hay Client ID, si el invitado declina, o si la API falla.
 */
export async function addToGoogleCalendar(event: CalEvent, tz: string): Promise<void> {
  const clientId = getGoogleClientId();
  if (!clientId) throw new Error('Google Client ID no configurado');

  await loadGis();
  const token = await getAccessToken(clientId);

  const body = {
    summary: event.title,
    location: event.location,
    description: event.description,
    // dateTime en UTC (instante absoluto, inequívoco) + timeZone para visualización.
    start: { dateTime: event.start.toISOString(), timeZone: tz },
    end: { dateTime: event.end.toISOString(), timeZone: tz },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Calendar API ${res.status}: ${txt.slice(0, 200)}`);
  }
}

'use client';

import { useSyncExternalStore } from 'react';

// Formato de hora elegido por el invitado (estilo cal.com): 24h o 12h (AM/PM).
// Solo afecta al DISPLAY. La hora real ya viene resuelta a la TZ del invitado en
// `slot.start_madrid` ("HH:MM", 24h) por regroupByTimezone — aquí solo la reescribimos.
export type TimeFormat = '12' | '24';

const KEY = 'plaz-scheduler:timeformat';

/**
 * Reescribe una hora "HH:MM" (24h, ya en la TZ del invitado) al formato pedido.
 * Conversión aritmética pura: no toca zona horaria, así que no puede desincronizar
 * lo que ya calculó regroupByTimezone.
 */
export function formatTime(hhmm: string, fmt: TimeFormat): string {
  if (fmt === '24') return hhmm;
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm; // input inesperado: no romper
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr.padStart(2, '0')} ${period}`;
}

// --- Preferencia persistida, compartida entre componentes ---
let current: TimeFormat = '24';
let hydrated = false;
const listeners = new Set<() => void>();

function read(): TimeFormat {
  try {
    return localStorage.getItem(KEY) === '12' ? '12' : '24';
  } catch {
    return '24';
  }
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): TimeFormat {
  if (!hydrated && typeof window !== 'undefined') {
    current = read();
    hydrated = true;
  }
  return current;
}

function getServerSnapshot(): TimeFormat {
  return '24';
}

export function setTimeFormat(fmt: TimeFormat): void {
  current = fmt;
  hydrated = true;
  try {
    localStorage.setItem(KEY, fmt);
  } catch {
    /* almacenamiento no disponible: queda en memoria */
  }
  listeners.forEach(l => l());
}

/** Hook: devuelve el formato actual y un setter persistente, sincronizado entre componentes. */
export function useTimeFormat(): [TimeFormat, (fmt: TimeFormat) => void] {
  const fmt = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [fmt, setTimeFormat];
}

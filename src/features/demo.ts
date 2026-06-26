// Datos de ejemplo para previsualizar el backoffice sin backend.
// Se activan SOLO cuando el token es "demo"; no afectan a los webhooks reales.

import type { AgentAgendaResponse } from './agent-agenda/types';
import type { AdminTeamResponse } from './admin-team/types';
import type { AgentAvailabilityResponse } from './availability/types';
import type { AdminCallTypesResponse } from './admin-call-types/types';
import type { AvailabilityResponse } from './agenda/types';

export const DEMO_TOKEN = 'demo';
export const isDemo = (token: string) => token === DEMO_TOKEN;

// ISO en UTC a N días de hoy (hora/minuto en UTC; Madrid en verano = +2).
function iso(daysFromNow: number, hourUtc: number, min = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  d.setUTCHours(hourUtc, min, 0, 0);
  return d.toISOString();
}

export function demoAgenda(): AgentAgendaResponse {
  return {
    agent_name: 'Xavi Abat',
    bookings: [
      { booking_id: 'd1', booker_name: 'María González', booker_email: 'maria@empresa.com', start_utc: iso(1, 8, 0), duration_minutes: 30, status: 'confirmed', vertical: 'Inmobiliaria', meet_url: 'https://meet.google.com/demo-xyz' },
      { booking_id: 'd2', booker_name: 'Carlos Ruiz', booker_email: 'carlos@corp.com', start_utc: iso(1, 10, 30), duration_minutes: 45, status: 'confirmed', vertical: 'Distrito Legal — Incapacidades', notes: 'Pidió revisar la documentación antes de la llamada.' },
      { booking_id: 'd3', booker_name: 'Ana López', booker_email: 'ana@startup.io', start_utc: iso(1, 13, 0), duration_minutes: 30, status: 'confirmed' },
      { booking_id: 'd4', booker_name: 'Diego Marín', booker_email: 'diego@pyme.es', start_utc: iso(2, 7, 0), duration_minutes: 30, status: 'confirmed', vertical: 'Seguros', meet_url: 'https://meet.google.com/demo-abc' },
      { booking_id: 'd7', booker_name: 'Elena Ortiz', booker_email: 'elena@cliente.com', start_utc: iso(3, 9, 30), duration_minutes: 45, status: 'pending', vertical: 'Inmobiliaria', notes: 'Prefiere que la llamen por la mañana.' },
      { booking_id: 'd5', booker_name: 'Lucía Vidal', booker_email: 'lucia@cliente.com', start_utc: iso(-3, 9, 0), duration_minutes: 30, status: 'completed', vertical: 'Banca' },
      { booking_id: 'd6', booker_name: 'Pedro Sánchez', booker_email: 'pedro@cliente.com', start_utc: iso(-1, 11, 0), duration_minutes: 45, status: 'cancelled' },
    ],
  };
}

export function demoTeam(): AdminTeamResponse {
  return {
    admin_name: 'Operaciones',
    agents: [
      { id: '1', name: 'Xavi Abat', email: 'xavi@plaz.ai', vertical: 'Inmobiliaria', active: true, upcoming_count: 5, agent_token: 'demo' },
      { id: '2', name: 'Lucía Fernández', email: 'lucia@plaz.ai', vertical: 'Legal', active: true, upcoming_count: 3, agent_token: 'demo' },
      { id: '3', name: 'Marcos Pena', email: 'marcos@plaz.ai', vertical: 'Seguros', active: false, upcoming_count: 0, agent_token: 'demo' },
      { id: '4', name: 'Sara Gil', email: 'sara@plaz.ai', vertical: 'Banca', active: true, upcoming_count: 2, agent_token: 'demo' },
      { id: '5', name: 'Pol Vidal', email: 'pol@plaz.ai', vertical: 'Retail', active: true, upcoming_count: 1, agent_token: 'demo' },
    ],
  };
}

export function demoAvailability(): AgentAvailabilityResponse {
  return {
    agent_name: 'Xavi Abat',
    schedule: {
      timezone: 'Europe/Madrid',
      days: [
        { weekday: 1, enabled: true, ranges: [{ start: '09:00', end: '14:00' }, { start: '16:00', end: '19:00' }] },
        { weekday: 2, enabled: true, ranges: [{ start: '09:00', end: '18:00' }] },
        { weekday: 3, enabled: true, ranges: [{ start: '09:00', end: '18:00' }] },
        { weekday: 4, enabled: true, ranges: [{ start: '09:00', end: '18:00' }] },
        { weekday: 5, enabled: true, ranges: [{ start: '09:00', end: '15:00' }] },
        { weekday: 6, enabled: false, ranges: [] },
        { weekday: 7, enabled: false, ranges: [] },
      ],
    },
  };
}

// Slots de ejemplo para el flujo de reprogramación (mismo contrato que el booking público).
export function demoAgentSlots(): AvailabilityResponse {
  const labelFmt = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long' });
  const shortFmt = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'short', day: 'numeric' });

  const mkDay = (daysAhead: number, hoursUtc: number[]) => {
    const base = new Date();
    base.setUTCDate(base.getUTCDate() + daysAhead);
    const date = base.toISOString().slice(0, 10);
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    return {
      date,
      label: cap(labelFmt.format(base)),
      short_label: cap(shortFmt.format(base)),
      slots: hoursUtc.map((h) => ({
        start_utc: iso(daysAhead, h, 0),
        start_madrid: `${String(h + 2).padStart(2, '0')}:00`, // Madrid = UTC+2 en verano
        end_utc: iso(daysAhead, h, 30),
      })),
    };
  };

  // Disponibilidad repartida en ~4 semanas de días laborables (L–V), con horas
  // variadas y algún hueco, para que el calendario mensual se vea realista.
  const HOURS = [
    [7, 8, 9, 11, 12],
    [7, 9, 11, 13],
    [8, 10, 12, 14],
    [7, 8, 12, 13],
  ];
  const days = [];
  for (let offset = 1; offset <= 32; offset++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + offset);
    const wd = d.getUTCDay(); // 0=domingo, 6=sábado
    if (wd === 0 || wd === 6) continue;   // sin fines de semana
    if (offset % 9 === 0) continue;       // algún día laborable sin hueco
    days.push(mkDay(offset, HOURS[offset % HOURS.length]));
  }

  return {
    team_name: 'Plaz',
    duration_minutes: 30,
    available_days: days,
  };
}

export function demoCallTypes(): AdminCallTypesResponse {
  return {
    admin_name: 'Operaciones',
    call_types: [
      { id: '1', name: 'Consulta inicial', slug: 'consulta-inicial', duration_minutes: 30, active: true, location: 'google_meet', description: 'Primera llamada para entender tu caso.' },
      { id: '2', name: 'Seguimiento', slug: 'seguimiento', duration_minutes: 15, active: true, location: 'phone', description: '' },
      { id: '3', name: 'Demo de producto', slug: 'demo-de-producto', duration_minutes: 45, active: false, location: 'in_person', description: 'Demostración presencial en oficina.' },
    ],
  };
}

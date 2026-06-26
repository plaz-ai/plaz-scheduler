import type {
  AgentAgendaResponse, CancelPayload, CancelResult, RespondPayload, RespondResult,
  ReschedulePayload, RescheduleResult,
} from './types';
import type { AvailabilityResponse } from '../agenda/types';
import { isDemo, demoAgenda, demoAgentSlots } from '../demo';

const BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL ?? '';

// GET — lista las llamadas del agente identificado por su token.
// Contrato n8n: /webhook/plaz-scheduler-agent-agenda?agent_token=...
export async function fetchAgentAgenda(agentToken: string): Promise<AgentAgendaResponse> {
  if (isDemo(agentToken)) return demoAgenda();
  const res = await fetch(
    `${BASE}/webhook/plaz-scheduler-agent-agenda?agent_token=${encodeURIComponent(agentToken)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

// POST — cancela una reserva del agente.
// Contrato n8n: /webhook/plaz-scheduler-cancel  body: { agent_token, booking_id }
export async function cancelBooking(payload: CancelPayload): Promise<CancelResult> {
  if (isDemo(payload.agent_token)) return { status: 'cancelled', booking_id: payload.booking_id };
  const res = await fetch(`${BASE}/webhook/plaz-scheduler-cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

// POST — confirma o rechaza una cita pendiente (aprobación manual, ≈ cal.com).
// Contrato n8n: /webhook/plaz-scheduler-respond  body: { agent_token, booking_id, action }
export async function respondBooking(payload: RespondPayload): Promise<RespondResult> {
  if (isDemo(payload.agent_token)) {
    return { status: payload.action === 'confirm' ? 'confirmed' : 'cancelled', booking_id: payload.booking_id };
  }
  const res = await fetch(`${BASE}/webhook/plaz-scheduler-respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

// GET — slots disponibles del propio agente para reprogramar (reutiliza el cálculo
// de disponibilidad del booking público). Contrato n8n: /webhook/plaz-scheduler-get-availability?link_token=...
export async function fetchAgentSlots(agentToken: string): Promise<AvailabilityResponse> {
  if (isDemo(agentToken)) return demoAgentSlots();
  const res = await fetch(
    `${BASE}/webhook/plaz-scheduler-get-availability?link_token=${encodeURIComponent(agentToken)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

// POST — reprograma una cita a un nuevo slot.
// Contrato n8n: /webhook/plaz-scheduler-reschedule  body: { agent_token, booking_id, new_slot_utc }
export async function rescheduleBooking(payload: ReschedulePayload): Promise<RescheduleResult> {
  if (isDemo(payload.agent_token)) {
    return { status: 'confirmed', booking_id: payload.booking_id, start_utc: payload.new_slot_utc };
  }
  const res = await fetch(`${BASE}/webhook/plaz-scheduler-reschedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

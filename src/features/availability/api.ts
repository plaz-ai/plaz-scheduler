import type { AgentAvailabilityResponse, SaveSchedulePayload, SaveScheduleResult } from './types';
import { isDemo, demoAvailability } from '../demo';

const BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL ?? '';

// GET — disponibilidad semanal actual del agente.
// Contrato n8n: /webhook/plaz-scheduler-agent-availability?agent_token=...
export async function fetchSchedule(agentToken: string): Promise<AgentAvailabilityResponse> {
  if (isDemo(agentToken)) return demoAvailability();
  const res = await fetch(
    `${BASE}/webhook/plaz-scheduler-agent-availability?agent_token=${encodeURIComponent(agentToken)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

// POST — guarda la disponibilidad semanal.
// Contrato n8n: /webhook/plaz-scheduler-agent-availability  body: { agent_token, schedule }
export async function saveSchedule(payload: SaveSchedulePayload): Promise<SaveScheduleResult> {
  if (isDemo(payload.agent_token)) return { status: 'saved' };
  const res = await fetch(`${BASE}/webhook/plaz-scheduler-agent-availability`, {
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

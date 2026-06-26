import type { AdminTeamResponse, SetActivePayload, SetActiveResult } from './types';
import { isDemo, demoTeam } from '../demo';

const BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL ?? '';

// GET — equipo del manager identificado por admin_token.
// Contrato n8n: /webhook/plaz-scheduler-admin-team?admin_token=...
export async function fetchTeam(adminToken: string): Promise<AdminTeamResponse> {
  if (isDemo(adminToken)) return demoTeam();
  const res = await fetch(
    `${BASE}/webhook/plaz-scheduler-admin-team?admin_token=${encodeURIComponent(adminToken)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

// POST — activa/desactiva un agente (entra o sale del reparto Grial).
// Contrato n8n: /webhook/plaz-scheduler-admin-agent-active  body: { admin_token, agent_id, active }
export async function setAgentActive(payload: SetActivePayload): Promise<SetActiveResult> {
  if (isDemo(payload.admin_token)) return { status: 'ok', agent_id: payload.agent_id, active: payload.active };
  const res = await fetch(`${BASE}/webhook/plaz-scheduler-admin-agent-active`, {
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

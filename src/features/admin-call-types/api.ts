import type { AdminCallTypesResponse, SaveCallTypesPayload, SaveCallTypesResult } from './types';
import { isDemo, demoCallTypes } from '../demo';

const BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL ?? '';

// GET — tipos de llamada del equipo.
// Contrato n8n: /webhook/plaz-scheduler-admin-call-types?admin_token=...
export async function fetchCallTypes(adminToken: string): Promise<AdminCallTypesResponse> {
  if (isDemo(adminToken)) return demoCallTypes();
  const res = await fetch(
    `${BASE}/webhook/plaz-scheduler-admin-call-types?admin_token=${encodeURIComponent(adminToken)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

// POST — guarda la lista completa de tipos de llamada (upsert + borrado de ausentes).
// Contrato n8n: /webhook/plaz-scheduler-admin-call-types  body: { admin_token, call_types }
export async function saveCallTypes(payload: SaveCallTypesPayload): Promise<SaveCallTypesResult> {
  if (isDemo(payload.admin_token)) return { status: 'saved' };
  const res = await fetch(`${BASE}/webhook/plaz-scheduler-admin-call-types`, {
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

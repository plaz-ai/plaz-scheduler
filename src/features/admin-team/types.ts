// Gestión de equipo para el manager (≈ /teams de cal.com).

export interface TeamAgent {
  id: string;
  name: string;
  email: string;
  active: boolean;
  agent_token: string;     // para enlazar a su agenda / disponibilidad
  upcoming_count: number;  // citas próximas confirmadas
  vertical?: string;
}

export interface AdminTeamResponse {
  admin_name: string;
  agents: TeamAgent[];
  token_invalid?: boolean;
}

export interface SetActivePayload {
  admin_token: string;
  agent_id: string;
  active: boolean;
}

export interface SetActiveResult {
  status: 'ok';
  agent_id: string;
  active: boolean;
}

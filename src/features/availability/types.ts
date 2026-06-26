// Disponibilidad semanal propia del agente (alimenta el cálculo de slots en n8n).
// weekday: 1=Lunes … 7=Domingo (semana española).

export interface TimeRange {
  start: string; // "09:00"
  end: string;   // "18:00"
}

export interface DayAvailability {
  weekday: number;
  enabled: boolean;
  ranges: TimeRange[];
}

export interface WeeklySchedule {
  timezone: string;          // "Europe/Madrid"
  days: DayAvailability[];   // 7 entradas, weekday 1..7
}

export interface AgentAvailabilityResponse {
  agent_name: string;
  schedule: WeeklySchedule | null; // null = sin configurar aún
  token_invalid?: boolean;
}

export interface SaveSchedulePayload {
  agent_token: string;
  schedule: WeeklySchedule;
}

export interface SaveScheduleResult {
  status: 'saved';
}

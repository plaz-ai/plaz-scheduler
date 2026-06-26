export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface AgentBooking {
  booking_id: string;
  start_utc: string;          // ISO — fuente única de verdad para fecha/hora/agrupación
  duration_minutes: number;
  booker_name: string;
  booker_email: string;
  status: BookingStatus;
  meet_url?: string;          // enlace Google Meet (si aplica)
  vertical?: string;          // p.ej. "Distrito Legal — Incapacidades"
  notes?: string;
}

export interface AgentAgendaResponse {
  agent_name: string;
  bookings: AgentBooking[];
  token_invalid?: boolean;
}

export interface CancelPayload {
  agent_token: string;
  booking_id: string;
}

export interface CancelResult {
  status: 'cancelled';
  booking_id: string;
}

export interface ReschedulePayload {
  agent_token: string;
  booking_id: string;
  new_slot_utc: string;
}

export interface RescheduleResult {
  status: 'confirmed';
  booking_id: string;
  start_utc: string;
}

export type RespondAction = 'confirm' | 'reject';

export interface RespondPayload {
  agent_token: string;
  booking_id: string;
  action: RespondAction;
}

export interface RespondResult {
  status: 'confirmed' | 'cancelled';
  booking_id: string;
}

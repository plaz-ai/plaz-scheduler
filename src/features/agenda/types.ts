export interface TimeSlot {
  start_utc: string;
  start_madrid: string;
  end_utc: string;
}

export interface AvailableDay {
  date: string;
  label: string;        // "miércoles, 28 de mayo"
  short_label: string;  // "Mié 28"
  slots: TimeSlot[];
}

// Tipo de evento estilo cal.com (p. ej. "Llamada de descubrimiento · 30 min").
// Opcional en la respuesta: hoy solo lo provee la capa mock; el backend de nico
// expone un único flujo, así que en producción el selector no se muestra.
// Pregunta personalizada del formulario (estilo cal.com), por tipo de evento.
export interface BookingQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'tel';
  required: boolean;
  placeholder?: string;
}

export interface EventType {
  id: string;
  slug: string;
  title: string;
  description: string;
  length_minutes: number;              // duración por defecto
  available_durations?: number[];      // si trae >1, el invitado elige (estilo cal.com)
  location_label: string; // "Google Meet", "Teléfono"...
  questions?: BookingQuestion[];
}

export interface AvailabilityResponse {
  team_name: string;
  duration_minutes: number;
  available_days: AvailableDay[];
  event_types?: EventType[];
  link_expired?: boolean;
  link_exhausted?: boolean;
}

export interface BookingPayload {
  link_token: string;
  slot_utc: string;
  duration_minutes: number;
  booker_name: string;
  booker_email: string;
  answers?: Record<string, string>; // respuestas a las preguntas custom (opcional; el backend de nico lo ignora)
}

export interface BookingResult {
  status: 'confirmed';
  booking_id: string;
  host_name: string;
  start_utc: string;
  start_madrid: string;
  cancel_url: string;
}

// Reagendar (estilo cal.com): el invitado abre un link con el uid de su reserva,
// ve su cita actual y elige un nuevo horario. Contrato pendiente en backend (ticket nico).
export interface RescheduleOriginal {
  start_utc: string;
  start_madrid: string;       // etiqueta completa: "lunes, 23 de junio · 10:00"
  host_name: string;
  title?: string;
  duration_minutes: number;
  location_label?: string;
}

export interface RescheduleInfo extends AvailabilityResponse {
  original: RescheduleOriginal;
}

export interface ReschedulePayload {
  booking_uid: string;
  slot_utc: string;
  duration_minutes: number;
  reason?: string;
}

export interface SelectedSlot {
  day: AvailableDay;
  slot: TimeSlot;
}

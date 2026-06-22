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
export interface EventType {
  id: string;
  slug: string;
  title: string;
  description: string;
  length_minutes: number;
  location_label: string; // "Google Meet", "Teléfono"...
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
}

export interface BookingResult {
  status: 'confirmed';
  booking_id: string;
  host_name: string;
  start_utc: string;
  start_madrid: string;
  cancel_url: string;
}

export interface SelectedSlot {
  day: AvailableDay;
  slot: TimeSlot;
}

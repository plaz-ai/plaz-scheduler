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

export interface AvailabilityResponse {
  team_name: string;
  duration_minutes: number;
  available_days: AvailableDay[];
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

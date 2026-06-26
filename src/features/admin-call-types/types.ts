// Tipos de llamada configurables por el admin (≈ event-types de cal.com).

// Ubicación de la reunión (≈ "location" de un event-type de cal.com).
export type CallLocation = 'google_meet' | 'phone' | 'in_person';

export const LOCATIONS: { value: CallLocation; label: string }[] = [
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'in_person', label: 'Presencial' },
];

export interface CallType {
  id: string;               // id real del backend, o temporal para filas nuevas
  name: string;
  slug: string;             // derivado del nombre, usado en el link público
  duration_minutes: number; // 15 | 30 | 45 | 60
  active: boolean;
  location: CallLocation;   // dónde ocurre la llamada
  description?: string;     // texto mostrado en la booking page
}

export interface AdminCallTypesResponse {
  admin_name: string;
  call_types: CallType[];
  token_invalid?: boolean;
}

export interface SaveCallTypesPayload {
  admin_token: string;
  call_types: CallType[];
}

export interface SaveCallTypesResult {
  status: 'saved';
}

export const DURATIONS = [15, 30, 45, 60];

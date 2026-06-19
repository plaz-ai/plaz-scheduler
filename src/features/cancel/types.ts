// Contrato de cancelación (coherente con el de agenda).
// El backend lo resolverá vía cancel_token opaco devuelto al confirmar la reserva.
export interface CancelDetails {
  booking_id: string;
  host_name: string;
  start_utc: string;
  start_madrid: string;   // "miércoles, 28 de mayo · 09:00"
  duration_minutes: number;
  booker_name: string;
  status: 'confirmed' | 'cancelled';
}

export interface CancelResult {
  status: 'cancelled';
}

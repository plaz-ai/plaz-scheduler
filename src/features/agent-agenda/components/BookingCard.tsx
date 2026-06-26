'use client';

import { useState } from 'react';
import type { AgentBooking, RespondAction } from '../types';
import { timeLabel } from '../datetime';

interface Props {
  booking: AgentBooking;
  onCancel: (booking: AgentBooking) => Promise<void>;
  onRespond?: (booking: AgentBooking, action: RespondAction) => Promise<void>;
  onReschedule?: (booking: AgentBooking) => void;
}

const STATUS_BADGE: Record<AgentBooking['status'], { label: string; cls: string }> = {
  pending: { label: 'Pendiente', cls: 'bg-amber/15 text-amber border-amber/30' },
  confirmed: { label: 'Confirmada', cls: 'bg-amber-soft text-amber border-amber/25' },
  completed: { label: 'Realizada', cls: 'bg-navy-light/60 text-muted border-amber-dim' },
  cancelled: { label: 'Cancelada', cls: 'bg-red-400/10 text-red-400 border-red-400/20' },
};

// El canto izquierdo codifica el estado de la cita (color = información, no adorno).
const STATUS_ACCENT: Record<AgentBooking['status'], string> = {
  pending: 'border-l-amber/50',
  confirmed: 'border-l-amber',
  completed: 'border-l-navy-light',
  cancelled: 'border-l-red-400/50',
};

export default function BookingCard({ booking, onCancel, onRespond, onReschedule }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [responding, setResponding] = useState<RespondAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const badge = STATUS_BADGE[booking.status];
  const canAct = booking.status === 'confirmed';
  const isPending = booking.status === 'pending';

  async function handleRespond(action: RespondAction) {
    if (!onRespond) return;
    setResponding(action);
    setError(null);
    try {
      await onRespond(booking, action);
    } catch {
      setError(action === 'confirm' ? 'No se pudo confirmar. Intenta de nuevo.' : 'No se pudo rechazar. Intenta de nuevo.');
    } finally {
      setResponding(null);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    setError(null);
    try {
      await onCancel(booking);
      setConfirming(false);
    } catch {
      setError('No se pudo cancelar. Intenta de nuevo.');
      setConfirming(false);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className={`booking-card @container flex flex-col h-full min-h-[10.5rem] p-4 rounded-2xl bg-navy-mid border border-amber-dim border-l-[3px] ${STATUS_ACCENT[booking.status]} transition-colors hover:bg-navy-card`}>
      <div className="flex items-start gap-4">
        {/* Hora: ancla temporal de la cita */}
        <div className="flex-none text-center min-w-[3.25rem] pr-4 border-r border-amber-dim/40">
          <p className="font-display text-[1.75rem] text-cream leading-none tabular-nums tracking-tight">{timeLabel(booking.start_utc)}</p>
          <p className="text-subtle text-[11px] mt-1.5 tabular-nums uppercase tracking-wide">{booking.duration_minutes} min</p>
        </div>

        {/* Detalle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-cream font-semibold truncate">{booking.booker_name}</p>
            <span className={`flex-none text-xs font-medium px-2 py-0.5 rounded-full border ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-muted text-sm truncate">{booking.booker_email}</p>
          {booking.vertical && (
            <p className="text-subtle text-xs mt-1 truncate">{booking.vertical}</p>
          )}
          {booking.notes && (
            <p className="text-muted text-xs mt-2 line-clamp-1">{booking.notes}</p>
          )}
        </div>
      </div>

      {/* Acciones de cita pendiente: confirmar / rechazar */}
      {isPending && onRespond && (
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-amber-dim/60 flex-wrap">
          <button
            type="button"
            onClick={() => handleRespond('confirm')}
            disabled={responding !== null}
            className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl bg-amber hover:bg-amber-hover disabled:opacity-60 text-navy font-semibold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
          >
            {responding === 'confirm' ? 'Confirmando…' : 'Confirmar'}
          </button>
          <button
            type="button"
            onClick={() => handleRespond('reject')}
            disabled={responding !== null}
            className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl bg-navy-light/50 hover:bg-navy-light text-cream/75 hover:text-cream border border-amber-dim text-sm font-medium disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
          >
            {responding === 'reject' ? 'Rechazando…' : 'Rechazar'}
          </button>
        </div>
      )}

      {/* Acciones */}
      {(canAct || booking.meet_url) && (
        <div className="flex flex-wrap items-center gap-2 mt-auto pt-3 border-t border-amber-dim/60">
          {booking.meet_url && (
            <a
              href={booking.meet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl bg-amber hover:bg-amber-hover text-navy font-semibold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Unirse
            </a>
          )}

          {canAct && !confirming && onReschedule && (
            <button
              type="button"
              onClick={() => onReschedule(booking)}
              className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl bg-navy-light/50 hover:bg-navy-light text-cream/75 hover:text-cream border border-amber-dim text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
            >
              Reprogramar
            </button>
          )}

          {canAct && !confirming && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex items-center justify-center min-h-11 px-3 rounded-xl text-muted hover:text-cream hover:bg-navy-light/40 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
            >
              Cancelar
            </button>
          )}

          {canAct && confirming && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted text-xs">¿Cancelar esta cita?</span>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex items-center justify-center min-h-11 px-3 rounded-xl bg-red-400/15 hover:bg-red-400/25 text-red-400 border border-red-400/30 text-sm font-semibold transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 cursor-pointer"
              >
                {cancelling ? 'Cancelando…' : 'Sí, cancelar'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={cancelling}
                className="inline-flex items-center justify-center min-h-11 px-3 rounded-xl text-muted hover:text-cream text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
              >
                No
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}

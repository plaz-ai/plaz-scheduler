'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { fetchAgentAgenda, cancelBooking, respondBooking, fetchAgentSlots, rescheduleBooking } from './api';
import type { AgentAgendaResponse, AgentBooking, RespondAction } from './types';
import type { AvailabilityResponse } from '../agenda/types';
import { dayKey, dayLabel, timeLabel, isPast } from './datetime';
import BookingCard from './components/BookingCard';
import RescheduleDialog from './components/RescheduleDialog';
import AppShell from '@/ui/AppShell';
import { agentNav } from './nav';

gsap.registerPlugin(useGSAP);

type Tab = 'upcoming' | 'pending' | 'past' | 'cancelled';

const TABS: { id: Tab; label: string }[] = [
  { id: 'upcoming', label: 'Próximas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'past', label: 'Pasadas' },
  { id: 'cancelled', label: 'Canceladas' },
];

interface Props {
  token: string;
}

interface DayGroup {
  key: string;
  label: string;
  bookings: AgentBooking[];
}

function groupByDay(bookings: AgentBooking[], descending: boolean): DayGroup[] {
  const map = new Map<string, DayGroup>();
  for (const b of bookings) {
    const key = dayKey(b.start_utc);
    if (!map.has(key)) map.set(key, { key, label: dayLabel(b.start_utc), bookings: [] });
    map.get(key)!.bookings.push(b);
  }
  const groups = [...map.values()];
  groups.sort((a, b) => (descending ? b.key.localeCompare(a.key) : a.key.localeCompare(b.key)));
  for (const g of groups) {
    g.bookings.sort((a, b) =>
      descending
        ? b.start_utc.localeCompare(a.start_utc)
        : a.start_utc.localeCompare(b.start_utc)
    );
  }
  return groups;
}

export default function AgentAgendaPage({ token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<AgentAgendaResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('upcoming');
  // Estado del flujo de reprogramación
  const [reschedTarget, setReschedTarget] = useState<AgentBooking | null>(null);
  const [reschedSlots, setReschedSlots] = useState<AvailabilityResponse | null>(null);
  const [reschedLoading, setReschedLoading] = useState(false);
  const [reschedError, setReschedError] = useState<string | null>(null);
  const [reschedSubmitting, setReschedSubmitting] = useState(false);

  useEffect(() => {
    fetchAgentAgenda(token)
      .then((res) => {
        if (res.token_invalid) setLoadError('Este enlace no es válido o ha caducado.');
        else setData(res);
      })
      .catch(() => setLoadError('No pudimos cargar tu agenda. Revisa tu conexión.'));
  }, [token]);

  const groups = useMemo(() => {
    if (!data) return [];
    const all = data.bookings;
    if (tab === 'pending') {
      return groupByDay(all.filter((b) => b.status === 'pending'), false);
    }
    if (tab === 'cancelled') {
      return groupByDay(all.filter((b) => b.status === 'cancelled'), true);
    }
    if (tab === 'past') {
      return groupByDay(
        all.filter((b) => (b.status === 'confirmed' || b.status === 'completed') && isPast(b.start_utc, b.duration_minutes)),
        true
      );
    }
    return groupByDay(all.filter((b) => b.status === 'confirmed' && !isPast(b.start_utc, b.duration_minutes)), false);
  }, [data, tab]);

  const counts = useMemo(() => {
    const all = data?.bookings ?? [];
    return {
      upcoming: all.filter((b) => b.status === 'confirmed' && !isPast(b.start_utc, b.duration_minutes)).length,
      pending: all.filter((b) => b.status === 'pending').length,
      past: all.filter((b) => (b.status === 'confirmed' || b.status === 'completed') && isPast(b.start_utc, b.duration_minutes)).length,
      cancelled: all.filter((b) => b.status === 'cancelled').length,
    };
  }, [data]);

  // Anima la entrada respetando prefers-reduced-motion (HIG obligatorio)
  useGSAP(
    () => {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      if (!containerRef.current?.querySelector('.booking-card')) return;
      gsap.from('.booking-card', { y: 16, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' });
    },
    { scope: containerRef, dependencies: [tab, data] }
  );

  async function handleCancel(booking: AgentBooking) {
    // Optimista: marca cancelada de inmediato; si el webhook falla, revierte y
    // re-lanza para que la BookingCard muestre su mensaje de error.
    const previousStatus = booking.status;
    setData((prev) =>
      prev
        ? {
            ...prev,
            bookings: prev.bookings.map((b) =>
              b.booking_id === booking.booking_id ? { ...b, status: 'cancelled' } : b
            ),
          }
        : prev
    );
    try {
      await cancelBooking({ agent_token: token, booking_id: booking.booking_id });
    } catch (err) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              bookings: prev.bookings.map((b) =>
                b.booking_id === booking.booking_id ? { ...b, status: previousStatus } : b
              ),
            }
          : prev
      );
      throw err;
    }
  }

  // Confirma/rechaza una cita pendiente; optimista con rollback (re-lanza para
  // que la BookingCard muestre el error si el webhook falla).
  async function handleRespond(booking: AgentBooking, action: RespondAction) {
    const previousStatus = booking.status;
    const nextStatus = action === 'confirm' ? 'confirmed' : 'cancelled';
    setData((prev) =>
      prev
        ? {
            ...prev,
            bookings: prev.bookings.map((b) =>
              b.booking_id === booking.booking_id ? { ...b, status: nextStatus } : b
            ),
          }
        : prev
    );
    try {
      await respondBooking({ agent_token: token, booking_id: booking.booking_id, action });
    } catch (err) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              bookings: prev.bookings.map((b) =>
                b.booking_id === booking.booking_id ? { ...b, status: previousStatus } : b
              ),
            }
          : prev
      );
      throw err;
    }
  }

  // Abre el diálogo de reprogramación y carga los slots disponibles del agente.
  function openReschedule(booking: AgentBooking) {
    setReschedTarget(booking);
    setReschedSlots(null);
    setReschedError(null);
    setReschedLoading(true);
    fetchAgentSlots(token)
      .then((res) => setReschedSlots(res))
      .catch(() => setReschedError('No pudimos cargar los horarios disponibles.'))
      .finally(() => setReschedLoading(false));
  }

  async function confirmReschedule(newSlotUtc: string) {
    if (!reschedTarget) return;
    setReschedSubmitting(true);
    setReschedError(null);
    try {
      const res = await rescheduleBooking({ agent_token: token, booking_id: reschedTarget.booking_id, new_slot_utc: newSlotUtc });
      setData((prev) =>
        prev
          ? {
              ...prev,
              bookings: prev.bookings.map((b) =>
                b.booking_id === reschedTarget.booking_id ? { ...b, start_utc: res.start_utc, status: 'confirmed' } : b
              ),
            }
          : prev
      );
      setReschedTarget(null);
    } catch {
      setReschedError('No se pudo reprogramar. Intenta de nuevo.');
    } finally {
      setReschedSubmitting(false);
    }
  }

  return (
    <AppShell nav={agentNav(token, 'agenda')} footerTitle={data?.agent_name} footerSubtitle="Agente">
      <div ref={containerRef} className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <h1 className="font-display text-4xl text-cream mb-6 leading-tight">Tu agenda</h1>

        {/* Tabs */}
        {data && (
          <div className="-mx-6 mb-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="inline-flex items-center gap-1 mx-6 p-1 rounded-2xl bg-navy-mid border border-amber-dim">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={[
                    'min-h-11 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60',
                    tab === t.id
                      ? 'bg-amber text-navy font-semibold'
                      : 'text-cream/70 hover:text-cream hover:bg-navy-light/50',
                  ].join(' ')}
                >
                  {t.label}
                  <span className={tab === t.id ? 'text-navy/60 ml-1.5' : 'text-muted ml-1.5'}>
                    {counts[t.id]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {!data && !loadError && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-navy-mid rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {loadError && (
          <div className="py-20 text-center">
            <p className="text-red-400 text-base mb-2">{loadError}</p>
            <p className="text-subtle text-sm">Si el problema persiste, contacta con soporte.</p>
          </div>
        )}

        {/* Listado agrupado por día */}
        {data && groups.length > 0 && (
          <div className="space-y-8">
            {groups.map((g) => (
              <section key={g.key}>
                <h2 className="text-amber text-xs font-semibold uppercase tracking-widest mb-3">{g.label}</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-3">
                  {g.bookings.map((b) => (
                    <BookingCard key={b.booking_id} booking={b} onCancel={handleCancel} onRespond={handleRespond} onReschedule={openReschedule} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Vacío */}
        {data && groups.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted text-base">
              {tab === 'upcoming'
                ? 'No tienes citas próximas.'
                : tab === 'pending'
                ? 'No hay citas pendientes de confirmar.'
                : tab === 'past'
                ? 'No hay citas pasadas.'
                : 'No hay citas canceladas.'}
            </p>
          </div>
        )}
      </div>

      {reschedTarget && (
        <RescheduleDialog
          currentLabel={`${dayLabel(reschedTarget.start_utc)} · ${timeLabel(reschedTarget.start_utc)}`}
          slots={reschedSlots}
          loading={reschedLoading}
          error={reschedError}
          submitting={reschedSubmitting}
          onPick={confirmReschedule}
          onClose={() => setReschedTarget(null)}
        />
      )}
    </AppShell>
  );
}

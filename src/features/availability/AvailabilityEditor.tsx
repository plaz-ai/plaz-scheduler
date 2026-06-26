'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AppShell from '@/ui/AppShell';
import { agentNav } from '../agent-agenda/nav';
import { fetchSchedule, saveSchedule } from './api';
import type { TimeRange, WeeklySchedule } from './types';
import { normalize, scheduleIsValid, WORKDAYS, TIMEZONES } from './schedule';
import DayRow from './components/DayRow';

gsap.registerPlugin(useGSAP);

interface Props {
  token: string;
}

export default function AvailabilityEditor({ token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetchSchedule(token)
      .then((res) => {
        if (res.token_invalid) {
          setLoadError('Este enlace no es válido o ha caducado.');
          return;
        }
        setAgentName(res.agent_name);
        setSchedule(normalize(res.schedule));
      })
      .catch(() => setLoadError('No pudimos cargar tu disponibilidad. Revisa tu conexión.'));
  }, [token]);

  useGSAP(
    () => {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!containerRef.current?.querySelector('.day-row')) return;
      gsap.from('.day-row', { y: 14, opacity: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' });
    },
    { scope: containerRef, dependencies: [!!schedule] }
  );

  function mutate(updater: (s: WeeklySchedule) => WeeklySchedule) {
    setSchedule((prev) => (prev ? updater(prev) : prev));
    setDirty(true);
    setSaved(false);
  }

  function updateDay(weekday: number, patch: (d: WeeklySchedule['days'][number]) => WeeklySchedule['days'][number]) {
    mutate((s) => ({ ...s, days: s.days.map((d) => (d.weekday === weekday ? patch(d) : d)) }));
  }

  function changeTimezone(timezone: string) {
    mutate((s) => ({ ...s, timezone }));
  }

  function toggleDay(weekday: number, enabled: boolean) {
    updateDay(weekday, (d) => ({
      ...d,
      enabled,
      ranges: enabled && d.ranges.length === 0 ? [{ start: '09:00', end: '18:00' }] : d.ranges,
    }));
  }

  function changeRange(weekday: number, index: number, range: TimeRange) {
    updateDay(weekday, (d) => ({ ...d, ranges: d.ranges.map((r, i) => (i === index ? range : r)) }));
  }

  function addRange(weekday: number) {
    updateDay(weekday, (d) => ({ ...d, ranges: [...d.ranges, { start: '09:00', end: '14:00' }] }));
  }

  function removeRange(weekday: number, index: number) {
    updateDay(weekday, (d) => ({ ...d, ranges: d.ranges.filter((_, i) => i !== index) }));
  }

  function copyToWorkdays(weekday: number) {
    mutate((s) => {
      const src = s.days.find((d) => d.weekday === weekday);
      if (!src) return s;
      return {
        ...s,
        days: s.days.map((d) =>
          WORKDAYS.includes(d.weekday)
            ? { ...d, enabled: src.enabled, ranges: src.ranges.map((r) => ({ ...r })) }
            : d
        ),
      };
    });
  }

  async function handleSave() {
    if (!schedule) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveSchedule({ agent_token: token, schedule });
      setSaved(true);
      setDirty(false);
    } catch {
      setSaveError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const valid = schedule ? scheduleIsValid(schedule) : false;

  return (
    <AppShell nav={agentNav(token, 'disponibilidad')} footerTitle={agentName ?? undefined} footerSubtitle="Agente">
      <div ref={containerRef} className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <h1 className="font-display text-4xl text-cream mb-2 leading-tight">Tu disponibilidad</h1>
        <p className="text-muted text-sm mb-5">
          Define tus horas disponibles por día. Los slots se calculan en tu zona horaria.
        </p>

        {schedule && (
          <div className="flex items-center gap-3 mb-8">
            <label htmlFor="tz" className="text-cream/70 text-sm">Zona horaria</label>
            <select
              id="tz"
              value={schedule.timezone}
              onChange={(e) => changeTimezone(e.target.value)}
              className="bg-navy/60 border border-amber/20 text-cream rounded-xl px-3 py-2.5 text-sm [color-scheme:dark] focus:outline-none focus:border-amber/60 focus:ring-2 focus:ring-amber/10 transition-all"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        )}

        {/* Loading */}
        {!schedule && !loadError && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] gap-3 items-start">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-navy-mid rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {loadError && (
          <div className="py-20 text-center">
            <p className="text-red-400 text-base mb-2">{loadError}</p>
            <p className="text-subtle text-sm">Si el problema persiste, contacta con soporte.</p>
          </div>
        )}

        {schedule && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] gap-3">
            {schedule.days.map((day) => (
              <DayRow
                key={day.weekday}
                day={day}
                onToggle={(enabled) => toggleDay(day.weekday, enabled)}
                onChangeRange={(i, r) => changeRange(day.weekday, i, r)}
                onAddRange={() => addRange(day.weekday)}
                onRemoveRange={(i) => removeRange(day.weekday, i)}
                onCopyToWorkdays={() => copyToWorkdays(day.weekday)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Barra de guardado */}
      {schedule && (
        <div className="sticky bottom-0 border-t border-amber-dim bg-navy/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between gap-4">
            <span className="text-sm">
              {saveError ? (
                <span className="text-red-400">{saveError}</span>
              ) : saved ? (
                <span className="text-amber">Cambios guardados</span>
              ) : dirty ? (
                <span className="text-muted">Cambios sin guardar</span>
              ) : (
                <span className="text-subtle">Todo al día</span>
              )}
            </span>
            <button
              onClick={handleSave}
              disabled={saving || !dirty || !valid}
              className="inline-flex items-center justify-center gap-2 min-h-11 px-6 rounded-xl bg-amber hover:bg-amber-hover disabled:opacity-50 disabled:cursor-not-allowed text-navy font-semibold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando…
                </>
              ) : (
                'Guardar disponibilidad'
              )}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

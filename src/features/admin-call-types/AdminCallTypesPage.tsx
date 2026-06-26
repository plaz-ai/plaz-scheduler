'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { fetchCallTypes, saveCallTypes } from './api';
import type { CallType } from './types';
import { slugify } from './slug';
import CallTypeRow from './components/CallTypeRow';
import AppShell from '@/ui/AppShell';
import { adminNav } from '../admin-team/nav';

gsap.registerPlugin(useGSAP);

interface Props {
  token: string;
}

const NEW_PREFIX = 'nuevo-';
const isNewRow = (id: string) => id.startsWith(NEW_PREFIX);

export default function AdminCallTypesPage({ token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Contador por instancia (evita estado compartido entre requests/admins en SSR).
  const tempCounter = useRef(0);

  function newCallType(): CallType {
    tempCounter.current += 1;
    return { id: `${NEW_PREFIX}${tempCounter.current}`, name: '', slug: '', duration_minutes: 30, active: true, location: 'google_meet', description: '' };
  }

  const [adminName, setAdminName] = useState<string | null>(null);
  const [callTypes, setCallTypes] = useState<CallType[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetchCallTypes(token)
      .then((res) => {
        if (res.token_invalid) setLoadError('Este enlace de administración no es válido.');
        else {
          setAdminName(res.admin_name);
          setCallTypes(res.call_types);
        }
      })
      .catch(() => setLoadError('No pudimos cargar los tipos de llamada. Revisa tu conexión.'));
  }, [token]);

  useGSAP(
    () => {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!containerRef.current?.querySelector('.calltype-row')) return;
      gsap.from('.calltype-row', { y: 14, opacity: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' });
    },
    { scope: containerRef, dependencies: [!!callTypes] }
  );

  function mutate(next: CallType[]) {
    setCallTypes(next);
    setDirty(true);
    setSaved(false);
  }

  function updateRow(id: string, patch: Partial<CallType>) {
    if (!callTypes) return;
    mutate(
      callTypes.map((ct) => {
        if (ct.id !== id) return ct;
        const merged = { ...ct, ...patch };
        // El slug se deriva del nombre SOLO en filas nuevas; en tipos ya existentes
        // el slug está en URLs públicas vivas y no debe cambiar al renombrar.
        if (patch.name !== undefined && isNewRow(ct.id)) merged.slug = slugify(patch.name);
        return merged;
      })
    );
  }

  function addRow() {
    if (!callTypes) return;
    mutate([...callTypes, newCallType()]);
  }

  function removeRow(id: string) {
    if (!callTypes) return;
    mutate(callTypes.filter((ct) => ct.id !== id));
  }

  // Slugs que aparecen más de una vez (colisionan en el upsert del backend).
  const duplicateSlugs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ct of callTypes ?? []) {
      if (ct.slug) counts.set(ct.slug, (counts.get(ct.slug) ?? 0) + 1);
    }
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([s]) => s));
  }, [callTypes]);

  const valid = callTypes
    ? callTypes.every((ct) => ct.name.trim().length > 0 && ct.slug.length > 0) &&
      duplicateSlugs.size === 0
    : false;

  async function handleSave() {
    if (!callTypes) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveCallTypes({ admin_token: token, call_types: callTypes });
      setSaved(true);
      setDirty(false);
    } catch {
      setSaveError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell nav={adminNav(token, 'tipos')} footerTitle={adminName ?? undefined} footerSubtitle="Administración">
      <div ref={containerRef} className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <h1 className="font-display text-4xl text-cream mb-2 leading-tight">Tipos de llamada</h1>
        <p className="text-muted text-sm mb-8">
          Define los tipos de cita que pueden reservarse{adminName ? ` · ${adminName}` : ''}.
        </p>

        {!callTypes && !loadError && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] gap-3 items-start">
            {[...Array(4)].map((_, i) => (
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

        {callTypes && (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] gap-3 items-start">
              {callTypes.map((ct) => (
                <CallTypeRow
                  key={ct.id}
                  callType={ct}
                  duplicateSlug={!!ct.slug && duplicateSlugs.has(ct.slug)}
                  onChange={(patch) => updateRow(ct.id, patch)}
                  onRemove={() => removeRow(ct.id)}
                />
              ))}
            </div>

            <button
              onClick={addRow}
              className="w-full inline-flex items-center justify-center gap-1.5 min-h-12 mt-3 rounded-2xl border border-dashed border-amber/30 text-amber text-sm font-medium hover:bg-amber-soft transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Añadir tipo de llamada
            </button>
          </>
        )}
      </div>

      {callTypes && (
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
                'Guardar tipos'
              )}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { fetchTeam, setAgentActive } from './api';
import type { AdminTeamResponse, TeamAgent } from './types';
import AgentCard from './components/AgentCard';
import AppShell from '@/ui/AppShell';
import { adminNav } from './nav';

gsap.registerPlugin(useGSAP);

interface Props {
  token: string;
}

interface Stat {
  label: string;
  value: number;
}

export default function AdminTeamPage({ token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<AdminTeamResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam(token)
      .then((res) => {
        if (res.token_invalid) setLoadError('Este enlace de administración no es válido.');
        else setData(res);
      })
      .catch(() => setLoadError('No pudimos cargar el equipo. Revisa tu conexión.'));
  }, [token]);

  useGSAP(
    () => {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!containerRef.current?.querySelector('.agent-card')) return;
      gsap.from('.agent-card', { y: 16, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' });
    },
    { scope: containerRef, dependencies: [!!data] }
  );

  const stats: Stat[] = useMemo(() => {
    const agents = data?.agents ?? [];
    const active = agents.filter((a) => a.active);
    return [
      { label: 'Agentes', value: agents.length },
      { label: 'Activos', value: active.length },
      { label: 'Citas próximas', value: active.reduce((sum, a) => sum + a.upcoming_count, 0) },
    ];
  }, [data]);

  async function handleToggleActive(agent: TeamAgent, active: boolean) {
    setToggleError(null);
    // Optimista
    setData((prev) =>
      prev ? { ...prev, agents: prev.agents.map((a) => (a.id === agent.id ? { ...a, active } : a)) } : prev
    );
    try {
      await setAgentActive({ admin_token: token, agent_id: agent.id, active });
    } catch {
      // Rollback
      setData((prev) =>
        prev
          ? { ...prev, agents: prev.agents.map((a) => (a.id === agent.id ? { ...a, active: agent.active } : a)) }
          : prev
      );
      setToggleError(`No se pudo actualizar a ${agent.name}. Intenta de nuevo.`);
    }
  }

  return (
    <AppShell nav={adminNav(token, 'equipo')} footerTitle={data?.admin_name} footerSubtitle="Administración">
      <div ref={containerRef} className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <h1 className="font-display text-4xl text-cream mb-1 leading-tight">Equipo</h1>
        {data && <p className="text-muted text-sm mb-8">{data.admin_name}</p>}

        {/* Resumen */}
        {data && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="p-4 rounded-2xl bg-navy-mid border border-amber-dim text-center">
                <p className="font-display text-3xl text-cream leading-none">{s.value}</p>
                <p className="text-subtle text-xs mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {toggleError && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-4">
            {toggleError}
          </p>
        )}

        {/* Loading */}
        {!data && !loadError && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-navy-mid rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {loadError && (
          <div className="py-20 text-center">
            <p className="text-red-400 text-base mb-2">{loadError}</p>
            <p className="text-subtle text-sm">Si el problema persiste, contacta con soporte.</p>
          </div>
        )}

        {/* Listado */}
        {data && data.agents.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-3">
            {data.agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onToggleActive={handleToggleActive} />
            ))}
          </div>
        )}

        {data && data.agents.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted text-base">Aún no hay agentes en el equipo.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

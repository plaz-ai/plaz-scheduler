'use client';

import Link from 'next/link';
import type { TeamAgent } from '../types';
import Toggle from '@/ui/Toggle';

interface Props {
  agent: TeamAgent;
  onToggleActive: (agent: TeamAgent, active: boolean) => void;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function AgentCard({ agent, onToggleActive }: Props) {
  return (
    <div className={`agent-card flex flex-col h-full min-h-[8.5rem] p-4 rounded-2xl bg-navy-mid border border-amber-dim border-l-[3px] ${agent.active ? 'border-l-amber' : 'border-l-navy-light'} transition-colors hover:bg-navy-card`}>
      <div className="flex items-start gap-3">
        {/* Avatar con iniciales */}
        <div className="flex-none w-11 h-11 rounded-full bg-amber-soft border border-amber/25 flex items-center justify-center">
          <span className="text-amber text-sm font-semibold">{initials(agent.name)}</span>
        </div>

        {/* Detalle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={agent.active ? 'text-cream font-semibold truncate' : 'text-muted font-semibold truncate'}>
              {agent.name}
            </p>
            {!agent.active && (
              <span className="flex-none text-xs font-medium px-2 py-0.5 rounded-full border border-amber-dim text-muted">
                Inactivo
              </span>
            )}
          </div>
          <p className="text-muted text-sm truncate">{agent.email}</p>
          {agent.vertical && <p className="text-subtle text-xs mt-0.5 truncate">{agent.vertical}</p>}
        </div>

        {/* Activo en reparto */}
        <div className="flex-none flex flex-col items-end gap-1">
          <Toggle
            checked={agent.active}
            onChange={(v) => onToggleActive(agent, v)}
            label={`Activar a ${agent.name} en el reparto`}
          />
          <span className="text-muted text-xs">{agent.upcoming_count} {agent.upcoming_count === 1 ? 'próxima' : 'próximas'}</span>
        </div>
      </div>

      {/* Accesos a sus vistas */}
      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-amber-dim/60">
        <Link
          href={`/agente/?token=${agent.agent_token}`}
          className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl bg-navy-light/50 hover:bg-navy-light text-cream/75 hover:text-cream border border-amber-dim text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60"
        >
          Ver agenda
        </Link>
        <Link
          href={`/agente/disponibilidad/?token=${agent.agent_token}`}
          className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl text-muted hover:text-cream text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60"
        >
          Disponibilidad
        </Link>
      </div>
    </div>
  );
}

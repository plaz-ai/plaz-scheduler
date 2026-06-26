'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
}

interface Props {
  nav: NavItem[];
  footerTitle?: string;
  footerSubtitle?: string;
  children: ReactNode;
}

/**
 * Shell de navegación estilo cal.com: barra lateral fija en escritorio,
 * barra superior con navegación deslizable en móvil. Mantiene la identidad
 * Plaz (navy + ámbar). El viewport es el contenedor natural del shell, por eso
 * usa breakpoints de viewport (lg:) en vez de container queries.
 */
export default function AppShell({ nav, footerTitle, footerSubtitle, children }: Props) {
  return (
    <div className="min-h-dvh app-shell flex flex-col lg:flex-row">
      <aside className="flex items-center lg:flex-col lg:items-stretch gap-3 lg:gap-1 px-4 py-3 lg:px-4 lg:py-6 border-b lg:border-b-0 lg:border-r border-amber-dim lg:w-60 lg:flex-none lg:sticky lg:top-0 lg:h-dvh">
        <span className="flex-none font-display text-cream text-xl tracking-tight lg:px-2 lg:mb-6">
          Plaz
        </span>

        <nav className="flex lg:flex-col gap-1 flex-1 lg:flex-none min-w-0 overflow-x-auto lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nav.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              aria-current={it.active ? 'page' : undefined}
              className={[
                'inline-flex items-center gap-2.5 min-h-11 px-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60',
                it.active
                  ? 'bg-amber-soft text-amber'
                  : 'text-cream/70 hover:text-cream hover:bg-navy-light/50',
              ].join(' ')}
            >
              <span className="flex-none">{it.icon}</span>
              {it.label}
            </Link>
          ))}
        </nav>

        {(footerTitle || footerSubtitle) && (
          <div className="flex-none min-w-0 text-right lg:text-left lg:mt-auto lg:pt-4 lg:px-2 lg:border-t lg:border-amber-dim">
            {footerTitle && <p className="text-cream text-sm font-medium truncate">{footerTitle}</p>}
            {footerSubtitle && <p className="text-subtle text-xs truncate">{footerSubtitle}</p>}
          </div>
        )}
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  );
}

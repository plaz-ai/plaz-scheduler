# CLAUDE.md — plaz-scheduler

Scheduler de citas autohospedado de Plaz: clon del flujo público de reserva de **cal.com** con la identidad visual de Plaz (navy + ámbar). Es la página donde el cliente elige horario, reserva y, si lo necesita, cancela. Repo: **`plaz-ai/plaz-scheduler`** (GitHub). Antes vivía en `Downloads/psched`; movido a `C:\Trabajo\Projects\plaz-scheduler` el 2026-06-19.

## Relación con el Front que hicimos

Este es el **mismo scheduler** que la app `plaz-scheduler` dentro del monorepo Front (`C:\Trabajo\Projects\Front`, que agrupa 3 apps: plaz-scheduler + verticales_pages + verticales_pages_git). Este repo es la versión **standalone desplegable** (export estático → GitHub Pages). Al trabajar el scheduler, considerar ambos sitios y verificar si el código diverge entre `Front/plaz-scheduler/src` y este repo antes de editar.

> Memorias relacionadas: el "cal propio" / backoffice de agendamiento, estructura clon de cal.com, y backend del scheduler (Supabase + webhooks n8n) están documentados en la memoria de usuario.

## Stack

- **Next.js 16** (App Router, Turbopack) con **export estático** (`output: 'export'`, `basePath: '/plaz-scheduler'`, `trailingSlash`, `images.unoptimized`).
- **React 19** · **Tailwind v4** (container queries nativas `@container`/`@md`/`@3xl`) · **GSAP** para animaciones.
- Despliegue: **GitHub Pages** vía GitHub Actions (push a `main` → `npm ci` → `npm run build` → publica `./out`).

## Comandos

```powershell
npm run dev      # desarrollo local (mock)
npm run build    # export estático a ./out
npm run lint
```

## Arquitectura (resumen)

- `src/app/` — App Router. Rutas `/agenda` (`?id=<token>`) y `/cancelar` (`?token=<token>`). Patrón **Loader** (lee el query param en cliente bajo `<Suspense>` porque no hay rutas dinámicas en export estático).
- `src/features/agenda/` — reserva en 3 pasos: `SlotPicker` (calendario mensual estilo cal.com) → `BookingForm` → `SuccessScreen`. `api.ts` + `mock.ts` + `types.ts`.
- `src/features/cancel/` — flujo de cancelación (confirmar / cancelada / mantenida).
- Documentación completa del frontend en **`docs/FRONTEND.md`**.

## Estado actual

- Desplegado en **https://plaz-ai.github.io/plaz-scheduler/agenda/?id=demo**, corriendo sobre **capa mock** (el build de producción sale sin `NEXT_PUBLIC_N8N_BASE_URL`, por lo que `USE_MOCK=true`).
- **No persiste nada todavía**: reservar/cancelar son simuladas. Para conexión real falta: 2 webhooks n8n (disponibilidad + reserva/cancelación), definir `NEXT_PUBLIC_N8N_BASE_URL`, y Supabase (clave de servicio la configura el admin, nunca embebida). Ver `docs/FRONTEND.md` → "Backend pendiente".

## Convenciones

- **Responsividad fluida**: container queries (`@container`) + `minmax`, sin valores planos ni breakpoints de viewport. **No** usar Apple HIG aquí (choca con la fluidez).
- Integración a `main` siempre por **rebase** (sin commits de merge). Nunca desplegar/commitear sin pedido explícito.
- Branch de trabajo actual: `feat/deploy-estatico-mock`.

## graphify

Grafo de conocimiento en `graphify-out/` (deep, con docs incluidos, sin ruido de config). Para preguntas de arquitectura usar `graphify query "<pregunta>"`. Tras cambios: `graphify update .`. El `.graphifyignore` excluye config/lockfiles para evitar nodos huérfanos.

# Brief Ralph — Pase de pulido front (UX/a11y), sin backend, sin features nuevas

## Objetivo
Pulir la capa front del scheduler: consistencia visual fina, micro-UX y accesibilidad. NO son features
del roadmap Cal.com (eso ya está o necesita backend). Es pulido sobre lo que YA existe.

## Restricciones (duras)
- SOLO pulido. **NINGUNA feature nueva**, ningún cambio de comportamiento funcional.
- SIN backend (no tocar `api.ts` contratos, n8n, Supabase, OAuth).
- NO desplegar, NO commitear. Branch `feat/calcom-fase0`. Solo este repo (no el monorepo Front).
- **Mínimo código, cambios quirúrgicos.** Tocar solo lo necesario. No "mejorar" código adyacente.
  Si dudas entre cambiar o no, NO cambies. Sin sobre-pulido.
- NO usar Apple HIG aquí (choca con la responsividad fluida por design; regla del proyecto).

## Alcance concreto (auditar y, solo si aporta, corregir)
1. **B3 diferido**: unificar `tracking`/`line-height` en micro-labels uppercase
   (`text-[9px]`/`text-[10px]` `uppercase tracking-widest`) — hoy hay ligeras inconsistencias entre
   SuccessScreen, SlotPicker, RescheduleConfirm, CalendarGrid. Unificar a un patrón único.
2. **A11y de lo recién añadido**: verificar que el toggle 12/24h (SlotPicker) y el botón "Añadir a
   Google Calendar" (SuccessScreen) cumplen el estándar ya establecido: focus-visible, aria correcto,
   tap target, estados con aria-live. Corregir si falta algo.
3. **Consistencia de superficies/hover/transición**: que los nuevos controles usen los tokens
   (`bg-navy-card`, `bg-navy-card-hover`, anillos focus) igual que el resto. Detectar divergencias.
4. **Micro-UX**: detalles pequeños y seguros (ritmo de spacing, duraciones de transición coherentes,
   `prefers-reduced-motion` respetado en cualquier animación nueva). Sin rediseños.

## Fuera de alcance
- Cualquier feature, cambio de copy funcional, i18n, animaciones nuevas grandes, refactors.
- Tocar backend o contratos.

## Método (loop de verificación)
- `graphify query` antes de leer fuentes para orientarte.
- Iteración 1: AUDITAR y escribir checklist concreto en `docs/_ralph-pulido-progress.md` (cada item:
  archivo:línea, qué está mal, fix propuesto, severidad). Marcar lo que se decida diferir con razón.
- Iteraciones siguientes: aplicar fixes en tandas pequeñas; gate `npm run build` + `npm run lint`
  limpios + TS OK tras cada tanda. Anotar archivos tocados.
- Verificación visual en navegador: pendiente de revisión humana (headless no alcanza localhost Windows).

## Criterio de finalización
Cuando: (a) exista el checklist de auditoría en `docs/_ralph-pulido-progress.md` con cada item
resuelto o diferido-con-razón; (b) B3 (tracking/line-height) unificado; (c) a11y del toggle 12/24h y
del botón Google Calendar verificada/corregida; (d) `npm run build` y `npm run lint` limpios;
(e) sin features nuevas ni cambios de comportamiento. Promise: FRONT_PULIDO_LISTO.

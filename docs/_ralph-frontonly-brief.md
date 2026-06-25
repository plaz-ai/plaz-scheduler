# Brief Ralph — Implementar los cambios front-only del roadmap Cal.com (SIN backend)

## Contexto
El estudio `docs/cal-clone-roadmap.md` clasificó las funcionalidades de Cal.com a clonar. La mayoría
de los quick wins (email/recordatorios, estado "pending", invitados, políticas, ventana/buffers)
**dependen de backend (n8n/Supabase)** y NO entran aquí. Esta tarea implementa SOLO lo genuinamente
**front-only, sin tocar backend**.

Tras analizar el roadmap, el único cambio front-only sustancial y de valor es:

### Alcance ÚNICO: Formato de hora 12/24h (toggle de display)
Cal.com deja al invitado elegir entre formato 24h y 12h (AM/PM). Hoy nuestro scheduler muestra
siempre 24h. Implementar un toggle de display, persistente, que afecte a TODAS las horas que se
renderizan en el flujo.

Fuera de alcance (no tocar en este loop): embeds (el export ya es embebible vía iframe, nada que
construir) e i18n (refactor grande; la app es es-only por diseño de producto).

## Forma de los datos (ya verificada — no re-descubrir)
- `TimeSlot` (`src/features/agenda/types.ts`): `{ start_utc: string /*ISO*/, start_madrid: string /*"HH:MM"*/, end_utc }`.
  → Cada slot SÍ tiene `start_utc`, así que se puede derivar la hora con `Intl` de forma uniforme.
- `BookingResult` / `RescheduleOriginal`: traen `start_utc` + `start_madrid` (este último es una
  **etiqueta completa** tipo "lunes, 23 de junio · 10:00", formateada por backend/mock).
- Renderizan horas: `components/TimeSlotButton.tsx` (slot.start_madrid), `steps/SlotPicker.tsx`
  (atajo "lo antes posible" usa `firstSlot.start_madrid`), `steps/SuccessScreen.tsx`
  (result.start_madrid), `steps/RescheduleConfirm.tsx` (original.start_madrid), `features/cancel/CancelPage.tsx`.

## Diseño propuesto (mínimo código, quirúrgico)
1. **Util compartido** `src/features/agenda/time.ts`:
   - `formatMadridTime(startUtc: string, fmt: '12'|'24'): string` → solo hora, `Intl.DateTimeFormat('es-ES', { timeZone:'Europe/Madrid', hour:'2-digit', minute:'2-digit', hour12: fmt==='12' })`.
   - (Opcional) `formatMadridFull(startUtc, fmt)` para las etiquetas completas de confirmación, si se
     decide respetar el toggle también ahí — re-derivando desde `start_utc` en vez de usar el
     `start_madrid` pre-formateado. Si resulta enredado, dejar las etiquetas completas como están y
     documentar la limitación; lo PRIORITARIO es la selección de slots.
2. **Preferencia persistida**: hook ligero (p. ej. `useTimeFormat`) sobre `localStorage`
   (clave `plaz-scheduler:timeformat`), default `'24'`. SSR-safe (export estático: leer en efecto, no en render inicial).
3. **Toggle UI**: control pequeño y coherente con la identidad (navy+ámbar) en la cabecera del
   `SlotPicker`, junto a la línea de duración/zona horaria. Accesible (focus-visible, aria-pressed/role),
   tap target ≥44px, sin romper el layout responsive (container queries).
4. **Aplicar** el formato en: `TimeSlotButton` (horas de slot), atajo "lo antes posible".
   Extensión a SuccessScreen/RescheduleConfirm/CancelPage solo si queda limpio vía `start_utc`.

## Restricciones (no violar)
- **SIN backend**: no tocar `api.ts` salvo que sea estrictamente de presentación; NO cambiar contratos,
  NO tocar n8n/Supabase, NO añadir campos al payload.
- **NO desplegar, NO commitear** (el usuario lo pide aparte). Branch actual: `feat/calcom-fase0`.
- Trabajar SOLO en este repo (`C:\Trabajo\Projects\plaz-scheduler`). Existe una copia en el monorepo
  Front (`Front/plaz-scheduler/src`) — NO tocarla aquí; solo anotar al final que habría que portar el cambio.
- Mínimo código. Sin features extra. Cambios pequeños y revisables.

## Método (loop de verificación = palanca principal)
- Antes de leer fuentes para arquitectura, usar `graphify query "<pregunta>"` (hay grafo en graphify-out/).
- Gate por iteración: `npm run build` Y `npm run lint` deben quedar limpios. TS sin errores.
- Iteración 1: crear `time.ts` + hook + toggle UI en SlotPicker, aplicar a TimeSlotButton y "lo antes posible".
- Iteraciones siguientes: extender a confirmaciones si queda limpio, pulir a11y/responsive, verificar build/lint.
- Registrar progreso en `docs/_ralph-frontonly-progress.md` (checklist + archivos tocados + estado build/lint).

## Criterio de finalización
Cuando: (a) el toggle 12/24h funcione y persista, (b) afecte al menos a la selección de slots y al
atajo "lo antes posible", (c) `npm run build` y `npm run lint` estén limpios, (d) el progreso esté
anotado en `docs/_ralph-frontonly-progress.md` con archivos tocados y decisión sobre las pantallas de
confirmación. Promise: FRONT_ONLY_CAMBIOS_LISTOS.

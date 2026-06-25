# Progreso — Cambios front-only del roadmap Cal.com (toggle 12/24h)

> Gate por iteración: `npm run build` + `npm run lint` limpios.
> Estado: ✅ build OK · ✅ lint limpio · ✅ TS OK · ✅ conversión verificada (node, casos límite).

## Qué se implementó
Toggle de **formato de hora 12h (AM·PM) / 24h** estilo cal.com, solo display, persistente y
sincronizado entre componentes. Default `24h` (no cambia el comportamiento de quien no lo toca).

## Decisiones de diseño
- **Conversión pura sobre `"HH:MM"`** (no recálculo de TZ) para los slots: `regroupByTimezone` ya
  resuelve la hora a la TZ del invitado en 24h; `formatTime` solo la reescribe a 12h. Así el toggle
  no puede desincronizar la zona horaria ya calculada.
- **Persistencia con `useSyncExternalStore`** (SSR-safe para export estático): `getServerSnapshot`
  devuelve `'24'`, el cliente hidrata desde `localStorage` (`plaz-scheduler:timeformat`). Store
  module-level con listeners → todos los componentes quedan en sync al togglear.
- **Confirmaciones**: `SuccessScreen` ya re-derivaba la etiqueta desde `start_utc` con `Intl`, así que
  honrar el formato fue solo añadir `hour12`. `RescheduleConfirm` aplica `formatTime` al **slot nuevo**
  (`"HH:MM"`). El "horario actual" original (`original.start_madrid`) se deja como etiqueta completa
  del backend (struck-through, secundario; no recibe TZ para re-derivar) — limitación menor aceptada.
- **CancelPage**: NO muestra hora de la reserva (solo estados de cancelación) → nada que hacer.

## Archivos tocados
- `src/features/agenda/lib/timeFormat.ts` — NUEVO: `TimeFormat`, `formatTime()`, `useTimeFormat()` + store persistente.
- `src/features/agenda/components/TimeSlotButton.tsx` — prop `timeFormat`, aplica `formatTime` a la hora del slot.
- `src/features/agenda/steps/SlotPicker.tsx` — hook `useTimeFormat`, toggle UI (24h / AM·PM) en la cabecera, formato en slots y en el atajo "lo antes posible".
- `src/features/agenda/steps/SuccessScreen.tsx` — `useTimeFormat` + `hour12` en la etiqueta de fecha/hora.
- `src/features/agenda/steps/RescheduleConfirm.tsx` — `useTimeFormat` + `formatTime` en el slot nuevo.

## Cobertura del toggle
- ✅ Lista de slots (TimeSlotButton)
- ✅ Atajo "Lo antes posible"
- ✅ Pantalla de confirmación de reserva (SuccessScreen)
- ✅ Confirmación de reagendado — slot nuevo (RescheduleConfirm)
- ⚠️ Horario original en reagendado: queda en etiqueta del backend (limitación documentada)

## Sin tocar (respetando "sin backend")
- `api.ts`, contratos, payloads, n8n, Supabase: intactos.
- No deploy, no commit. Branch `feat/calcom-fase0`.
- Copia en monorepo Front (`Front/plaz-scheduler/src`): NO tocada aquí — **pendiente portar** estos 5
  archivos + el nuevo `lib/timeFormat.ts` si se quiere paridad.

## Verificación
- `npm run lint`: limpio.
- `npm run build`: compila, TS OK, 6/6 páginas estáticas generadas.
- Conversión 12/24h: verificada por node con casos límite (00:00→12:00 AM, 12:00→12:00 PM, 13:00→1:00 PM, input inválido→passthrough).
- ⚠️ Verificación visual en navegador: pendiente de revisión humana (entorno headless no alcanza localhost de Windows).

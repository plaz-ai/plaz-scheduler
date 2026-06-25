# Progreso — Pase de pulido front (UX/a11y)

> Gate: `npm run build` + `npm run lint` + TS limpios. ✅ Todo en verde.
> Hallazgo general: el pase estético previo ya dejó la base sólida; quedaban pocos items reales.

## Auditoría (checklist)

### B3 — tracking / line-height en micro-labels uppercase
- [x] **Verificado: `tracking-widest` ya es uniforme** en TODOS los micro-labels uppercase. No diverge.
- [x] **Verificado: `line-height` no se fija en ninguno** (labels de una línea) → concern moot, sin cambios.
- [x] **Fix real: caption con `font-medium` huérfano.** `SlotPicker.tsx:165` (label del día sobre los
  slots) llevaba `font-medium`, mientras las 6 captions del mismo rol
  (`text-subtle text-[9px] uppercase tracking-widest`: SuccessScreen ×5, RescheduleConfirm) NO lo
  llevan. Eliminado `font-medium` para unificar al patrón dominante.
- [n/a] **Roles distintos — NO tocados (intencionales):**
  - `text-[10px]` ámbar de labels flotantes de formulario (BookingForm, RescheduleConfirm) — rol "label de input".
  - `text-[10px]` de sidebar/step en AgendaPage — rol "navegación/paso".
  - `font-semibold` de los encabezados de día en CalendarGrid — rol "header de grilla" (énfasis estructural).
  Unificar tamaños/peso entre roles sería cambiar jerarquía, no pulir → fuera de alcance.

### A11y de los controles añadidos en loops anteriores
- [x] **Toggle 12/24h (SlotPicker):** `role="group" aria-label="Formato de hora"`, `aria-pressed` por
  botón, `type="button"`, focus-visible `ring-amber/50`. Correcto. Tap target ~32px: aceptable según el
  estándar ya fijado (pills de duración y celdas de día también <44px) — no se fuerza 44px para no
  romper la coherencia con las pills hermanas.
- [x] **Botón "Añadir a Google Calendar" (SuccessScreen):** focus-visible `ring-2 ring-cream`,
  `min-h-44`, `disabled` en `adding`, `aria-live` (anuncia "Añadiendo…"), confirmación con
  `role="status" aria-live="polite"`. Correcto.
- [x] **Fix real: el mensaje de error del gcal no se anunciaba.** Añadido `role="alert"` al `<p>` de
  error (`SuccessScreen.tsx`) para que los lectores de pantalla anuncien el fallo al insertarse.

### Tokens / superficies / transiciones
- [x] Verificado: toggle 12/24h y botones de calendario usan los tokens correctos (`bg-navy-card`,
  `bg-navy-card-hover`, `bg-amber`/`text-on-amber`, anillos focus) igual que el resto. Sin divergencias.

### Reduced-motion
- [n/a] Spinner `animate-spin` del botón gcal: sin guard de reduced-motion, **igual que el spinner ya
  existente** de RescheduleConfirm (`CircleNotch animate-spin`). Es un patrón preexistente del repo; no
  se cambia uno solo por coherencia. Anotado como posible item global futuro (fuera de alcance).

## Archivos tocados
- `src/features/agenda/steps/SlotPicker.tsx` — quitado `font-medium` del caption del día (B3).
- `src/features/agenda/steps/SuccessScreen.tsx` — `role="alert"` en el mensaje de error del alta en Google Calendar.

## Verificación
- `npm run lint`: limpio · `npm run build`: OK (TS, 6/6 páginas).
- Sin features nuevas, sin cambios de comportamiento, sin tocar backend/contratos.
- Verificación visual en navegador: pendiente de revisión humana (headless no alcanza localhost Windows).

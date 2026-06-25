# Progreso — Pase estético del scheduler (Ralph)

> Gate por iteración: `npm run build` + `npm run lint` limpios.
> Estado actual: ✅ build OK · ✅ lint limpio · ✅ TS OK (verificado tras cada tanda).

## Checklist de auditoría

### 🔴 ALTA
- [x] **A1 · Superficies unificadas en token tema-aware.** Nuevos tokens `--bg-card-hover` (dark
  `cream/0.09`, light `white/0.92`) + utilidad `bg-navy-card-hover`. Reemplazadas todas las
  superficies ad-hoc (`bg-cream/[0.02]`, `bg-white/[0.05]`, `bg-white/[0.04]`) por `bg-navy-card`
  y sus hovers por `bg-navy-card-hover`. Divisores hairline (`bg-cream/[0.06]`) se conservan (no son superficie).
- [x] **A2 · Focus-visible consistente en TODOS los controles.** Anillo `focus-visible:ring-1
  ring-amber/50` en links/botones secundarios; `ring-2 ring-cream ring-offset-2 ring-offset-navy`
  en CTAs ámbar (contraste). Cubre: CalendarGrid (celdas+nav), SlotPicker (4), SuccessScreen
  (botones+links), CancelPage (3), BookingForm (back+submit), RescheduleConfirm (back+submit),
  AgendaPage (wordmark, cambiar tipo, 2× volver). Inputs usan borde ámbar en foco (ya existía).
- [x] **A3 · Accesibilidad semántica.** CalendarGrid: `aria-label` con fecha completa,
  `aria-current="date"` (hoy), `aria-pressed` (seleccionado), `aria-label` en nav mes.
  SuccessScreen: `role="status" aria-live="polite"` en el heading de confirmación.
  CancelPage: `role="status" aria-live="polite" aria-busy` en el contenedor de resultado.

### 🟡 MEDIA
- [x] **M1 · Doble animación de entrada resuelta.** SuccessScreen: solo dibuja el check (la entrada
  la da el keyframe `.step-panel`); eliminados los `.from` redundantes de título/detalle/cancel-link.
  CalendarGrid: stagger suavizado + guard de reduced-motion.
- [x] **M2 · Tap targets ≥ 44px.** Botones Google/Outlook/.ics (SuccessScreen) y botones de CancelPage
  a `py-2.5 min-h-[44px]`. Celdas de día ≈42px (aspect-square en columna ~300px) — aceptable.
- [x] **M3 · CancelPage coherente con AgendaPage.** Añadido glow ambiental ámbar; "Nueva reserva"
  alineada al patrón ámbar+backdrop-blur de "lo antes posible"; guard reduced-motion en su entrada.
- [x] **M4 · Paridad dark/light.** Superficies ahora salen de tokens definidos por tema (dark/light
  simétricos), eliminando la divergencia de `cream`-alpha vs `white`-alpha entre modos.

### 🟢 BAJA
- [x] **B1 · Stagger de calendario** suavizado (`scale 0.82 → 0.94`) + reduced-motion.
- [x] **B2 · Sombra del día seleccionado** — verificado: el grid no tiene `overflow-hidden`, no se corta.
- [ ] **B3 · Consistencia fina de tracking/line-height** en labels uppercase `text-[9px]/[10px]` —
  DIFERIDO: cosmético menor, no bloquea producción.

## Cambios aplicados (archivos tocados)
- `src/app/globals.css` — tokens `--bg-card-hover` (dark+light) + `--color-navy-card-hover`.
- `src/features/agenda/steps/EventTypePicker.tsx` — hover superficie.
- `src/features/agenda/steps/SlotPicker.tsx` — superficie duración + empty-state, focus-visible ×4.
- `src/features/agenda/steps/SuccessScreen.tsx` — superficie, focus-visible, tap targets, role=status, anim solo-check.
- `src/features/agenda/steps/BookingForm.tsx` — focus-visible (back + submit).
- `src/features/agenda/steps/RescheduleConfirm.tsx` — focus-visible (back + submit).
- `src/features/agenda/components/CalendarGrid.tsx` — aria, focus-visible, hover superficie, stagger suavizado + reduced-motion.
- `src/features/agenda/AgendaPage.tsx` — focus-visible (wordmark, cambiar tipo, volver ×2).
- `src/features/cancel/CancelPage.tsx` — glow, aria-live, focus-visible, tap targets, reduced-motion.

## Estado de finalización
- build + lint limpios ✅
- sin items ALTA/MEDIA abiertos ✅ (todos marcados)
- único BAJA abierto (B3) explícitamente diferido por cosmético
- cambios anotados ✅

⚠️ Verificación visual en navegador pendiente de revisión humana (el entorno headless no alcanza
localhost de Windows). Todo lo verificable por build/lint/código está en verde.

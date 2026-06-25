# Brief Ralph — Pulido estético del scheduler para producción

## Objetivo
Dejar la UI del scheduler (plaz-scheduler) **lista estéticamente para producción**: pulida,
consistente y sin defectos visuales, conservando su identidad (navy + ámbar) y su sistema de tokens.
NO es un rediseño: son mejoras quirúrgicas de calidad visual sobre lo que ya existe.

## Gate de verificación OBLIGATORIO (en CADA iteración, antes de dar nada por bueno)
Desde `C:/Trabajo/Projects/plaz-scheduler`:
1. `npm run build` debe terminar sin errores (export estático a ./out). Si falla, arréglalo antes de seguir.
2. `npm run lint` debe quedar limpio (sin nuevos errores/warnings introducidos por ti).
3. TypeScript sin errores de tipos.
Si no puedes verificar visualmente en navegador (el browser headless no alcanza localhost de Windows),
apóyate en build + lint + lectura cuidadosa del código contra la rúbrica. NO afirmes "se ve bien"
sin evidencia; afirma solo lo que el build/lint/código respaldan.

## Alcance — TODAS las vistas y estados de usuario
- Flujo agenda: EventTypePicker → SlotPicker (CalendarGrid, TimeSlotButton, selector de duración,
  atajo "lo antes posible") → BookingForm → SuccessScreen → RescheduleConfirm.
- Flujo cancelación: `src/features/cancel` (confirmar / cancelada / mantenida).
- Estados transversales: loading skeleton, error de carga, link expirado, link agotado,
  sin disponibilidad, panel izquierdo (organizer/step counter), footer.
- Dark y light mode (paridad total).

## Rúbrica de calidad (qué auditar y mejorar)
1. **Consistencia de tokens**: nada de colores/spacing hardcodeados fuera del sistema de tokens
   (`globals.css`). Reusar `navy/cream/amber/...` y las variables de tema.
2. **Tipografía y jerarquía**: escalas coherentes, line-height/tracking consistentes, sin saltos raros.
3. **Spacing y ritmo vertical**: paddings/márgenes en escala coherente; alineaciones limpias.
4. **Estados interactivos completos**: hover, focus-visible, active, disabled, loading, empty, error
   — todos presentes y coherentes en cada control.
5. **Accesibilidad**: focus visible siempre, contraste WCAG AA (ya verificado en tokens — no romperlo),
   tap targets ≥ 44px en móvil, `aria-*` donde aporte.
6. **Responsividad fluida**: respetar el enfoque del repo. NO introducir breakpoints de viewport
   nuevos innecesarios; preferir soluciones fluidas donde sea trivial. No refactor masivo.
7. **Microinteracciones coherentes**: transiciones suaves, GPU-composited (opacity/transform),
   sin `filter: blur()` animado (causa jank), respetar `prefers-reduced-motion`.
8. **Sin artefactos visuales**: nada de degradados/halos no intencionales, bordes/sombras cortados,
   colores no uniformes, parpadeos en montaje.
9. **Pulido de detalle**: radios, bordes, sombras, dot-grid, glow ambiental — coherentes y discretos.

## Método (Karpathy: trozos pequeños y verificables)
- PRIMERA iteración: AUDITA todo el alcance y vuelca un checklist priorizado (Alta/Media/Baja) en
  `docs/_ralph-aesthetic-progress.md`. No empieces a cambiar hasta tener el checklist.
- Iteraciones siguientes: implementa 1–3 items relacionados por iteración, corre el gate, y marca
  el checklist como hecho con una nota de qué cambiaste y archivo:línea.
- Cambios quirúrgicos: toca solo lo necesario; no "mejores" código adyacente ni reescribas componentes
  enteros. Conserva la identidad visual y el sistema de tokens.

## Restricciones (no violar)
- NO desplegar ni commitear nada sin pedido explícito del usuario.
- NO usar el MCP apple-hig (tiene errores pendientes).
- NO tocar el backend (Supabase, n8n, OAuth) ni la capa de datos/api/mock.
- Rama de trabajo actual: `feat/calcom-fase0`. No cambiar de rama.
- Respetar el sistema de tokens y la paleta navy+ámbar. Nada de rediseño.

## Criterio de finalización
Cuando: (1) `npm run build` y `npm run lint` pasan limpios; (2) el checklist de
`docs/_ralph-aesthetic-progress.md` no tiene items abiertos de prioridad Alta ni Media;
(3) cada cambio quedó anotado en ese archivo. Los items de prioridad Baja pueden quedar
documentados como "diferidos" si no aportan a producción. Al terminar, lista los archivos tocados
y el resumen del checklist.

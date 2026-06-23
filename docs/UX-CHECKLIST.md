# UX Checklist — plaz-scheduler

Aplica este checklist a cada vista o componente nuevo **antes de dar la tarea por terminada**.
Está destilado de lo que Cal.com, Stripe y Linear hacen bien, adaptado a este stack.

---

## 1. Los 4 estados async (obligatorio en toda vista con datos remotos)

Cada vista que llama a una API debe diseñar los cuatro:

| Estado | Qué mostrar | Ejemplo en el proyecto |
|---|---|---|
| **Loading** | Skeleton o spinner contextual | Skeleton de calendario en AgendaPage |
| **Error** | Mensaje + acción de recuperación | "No pudimos cargar" + botón Volver |
| **Empty** | Explicación + salida | "Sin disponibilidad" + cambiar tipo |
| **Success** | Contenido real | SlotPicker / SuccessScreen |

> Regla: si diseñas solo el estado Success, la vista está incompleta.

---

## 2. Ningún estado es un callejón sin salida

Toda pantalla — incluyendo errores, estados vacíos y confirmaciones — necesita al menos **una salida visible**.

Checklist por tipo:

- [ ] **Error de red / API** → botón "Volver" o "Reintentar"
- [ ] **Link inválido / expirado** → explicación + "Nueva reserva"
- [ ] **Estado vacío** → botón para cambiar parámetros o ir atrás
- [ ] **Confirmación final** → botón para volver al inicio o hacer otra acción
- [ ] **Página de resultado** (cancelar, éxito) → mínimo "← Volver" + acción principal

---

## 3. Navegación mínima por tipo de vista

### Flujo de pasos (wizard)
- [ ] Cada paso tiene un botón **← Volver** visible que revierte al paso anterior
- [ ] El logo/wordmark resetea al inicio del flujo
- [ ] El sidebar muestra el paso actual (número + label)
- [ ] En móvil hay un botón de volver al tipo de evento si aplica

### Página standalone (cancel, resultado)
- [ ] Header con logo linkable a `/agenda/`
- [ ] Flecha `←` en el header para `window.history.back()`
- [ ] Tras el resultado: acción primaria (Nueva reserva) + acción secundaria (Volver)

---

## 4. Formularios

- [ ] Botón submit tiene estado **disabled + spinner** mientras espera
- [ ] Error del servidor se muestra inline, cerca del botón (no solo en consola)
- [ ] Campos required marcados con ` *` en el label
- [ ] Inputs con `autoComplete` apropiado (`name`, `email`, `tel`)
- [ ] Campos inválidos marcados con `aria-invalid` cuando hay error
- [ ] Nunca limpiar el formulario al recibir un error — el usuario pierde su trabajo

---

## 5. Botones y acciones

- [ ] Todo botón clicable tiene estado `:hover` y `:active` (escala o color)
- [ ] Botones deshabilitados tienen `opacity-50 cursor-not-allowed`
- [ ] Botones sin texto tienen `aria-label`
- [ ] Tap target mínimo **44×44 px** en móvil (padding si el elemento es más pequeño)
- [ ] `active:scale-[0.98]` en botones primarios — feedback táctil inmediato

---

## 6. Accesibilidad básica (no negociable)

- [ ] HTML semántico: `<header>`, `<main>`, `<footer>`, `<nav>`, `<button>`, `<form>`
- [ ] `focus-visible` ring visible en todos los elementos interactivos
- [ ] Elementos decorativos con `aria-hidden="true"`
- [ ] Animaciones respetan `prefers-reduced-motion` (ver nota abajo)
- [ ] Contraste mínimo WCAG AA: texto normal ≥ 4.5:1, texto grande ≥ 3:1

```css
/* Añadir a globals.css cuando haya capacidad */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Micro-interacciones (consistencia visual)

Patrones ya establecidos en el proyecto — úsalos siempre, no inventes nuevos:

| Elemento | Patrón |
|---|---|
| Botón primario | `bg-amber hover:bg-amber-hover active:scale-[0.98]` |
| Botón secundario / ghost | `border border-cream/[0.1] hover:border-amber/40 hover:text-cream` |
| Link de acción (CTA sutil) | `text-amber hover:opacity-75 transition-opacity` |
| Link destructivo | `text-cream/50 hover:text-cream/80` |
| Input focus | `border-amber` + label flota en amber uppercase |
| Transición estándar | `transition-colors duration-200` |
| Entrada de pantalla | GSAP `fromTo` clip-path wipe (0.45s) |
| Salida de pantalla | GSAP `to` clip-path wipe izquierda (0.25s) |
| Listas stagger | GSAP `from` y=10 opacity=0, stagger 0.08–0.12s |

---

## 8. Template para vista nueva

Antes de escribir una línea de JSX, confirma que tienes diseñado cada bloque:

```
Vista: ___________

[ ] Estado loading   → ________________________________
[ ] Estado error     → ________________________________ + botón: __________
[ ] Estado vacío     → ________________________________ + botón: __________
[ ] Estado success   → ________________________________

Navegación:
[ ] Salida primaria  → ________________________________
[ ] Salida secundaria → _______________________________
[ ] Logo / header    → ________________________________

Formulario (si aplica):
[ ] Submit loading   → spinner en botón
[ ] Submit error     → inline bajo el botón
[ ] Campos required  → marcados con *
```

---

## Referentes consultados

- **Cal.com**: patrón de wizard con sidebar fijo, chip de duración, hover "hora | Confirmar"
- **Stripe**: estados de error inline, never lose user input, feedback inmediato
- **Linear**: estados vacíos accionables, navegación siempre visible, tipografía bold display

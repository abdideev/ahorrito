# Huevo de Pascua «Cuadre perfecto» (SC-02)

| Dato | Valor |
|---|---|
| Solicitud de cambio | SC-02, incidencia #8 |
| Requisito | RF-14 · El sistema deberá revelar los créditos del proyecto mediante una secuencia oculta de interacción |
| Prioridad | Baja |
| Origen | Indicación del docente (STK-03) |
| Criterio de aceptación | CA-13 |
| Componente | C-01, alojado en `/demo` hasta la Fase 4 |

---

## 1. La secuencia

1. **Cuadrar el plan al centavo.** Generar un plan en el que todas las semanas terminen con
   exactamente $0.00 en la columna "Queda".
2. **Depositar las monedas en orden.** En ese estado, cada $0.00 se vuelve activable. Hay que
   activarlas de la primera a la última semana. Activar una fuera de orden, o repetir una ya
   depositada, reinicia la alcancía.
3. **Recibir los créditos.** Al depositar la última moneda se abre el plan de créditos, con
   confeti.

**Por qué este diseño.** El primer paso solo es alcanzable porque el motor calcula en centavos
enteros: con punto flotante quedaría un residuo y la cerradura no abriría nunca. El huevo de
Pascua premia la propiedad técnica central del sistema.

## 2. Receta verificable

En `http://localhost:3000/demo`:

| Campo | Valor |
|---|---|
| Fecha de cálculo | 2026-09-14 |
| Presupuesto semanal | 200 |
| La semana inicia en | Lunes |
| Compromisos | Uno solo: monto 600, fecha límite 2026-09-30, 1 ocurrencia |
| Meta de ahorro | Vacía |

El plan resultante tiene tres semanas con $200.00 apartados y $0.00 de remanente. Activar las
tres monedas en orden abre los créditos.

## 3. Criterio de aceptación CA-13

| # | Verificación | Resultado esperado |
|---|---|---|
| 1 | Ejecutar la receta de la sección 2 | Se abre el plan de créditos |
| 2 | Activar una moneda fuera de orden | La alcancía se reinicia y no se abren los créditos |
| 3 | Calcular un plan que no cuadra (presupuesto 201 en la receta) | No aparece ninguna moneda activable |
| 4 | Completar la secuencia solo con teclado (Tab y Enter) y cerrar con Esc | Todo se opera sin ratón; el foco vuelve a la página al cerrar |
| 5 | Activar "reducir movimiento" en el sistema operativo y repetir | Los créditos se muestran sin confeti |

## 4. Implementación

| Archivo | Responsabilidad |
|---|---|
| `src/lib/huevo/secuencia.ts` | Lógica pura: detección del cuadre perfecto y estado de la alcancía |
| `src/lib/huevo/creditos.ts` | Roles, horas y créditos tomados de las secciones 1.7.2 y 1.8.5 del documento maestro |
| `src/components/ui/confetti.tsx` | Componente Confetti de Magic UI (MIT), sin `ConfettiButton` |
| `src/components/creditos/dialogo-creditos.tsx` | Diálogo accesible con el plan de créditos |
| `src/app/demo/page.tsx` | Integración en la vista del plan |

**Decisiones:**

- **La lógica no vive en `src/core`.** Revelar créditos no es una regla del dominio financiero;
  mezclarla con el motor contaminaría el componente que exige RNF-08.
- **Solo se incorpora `Confetti`.** Instalar el componente con la CLI de shadcn habría creado
  `components.json`, instalado `Button` con cuatro dependencias adicionales y reescrito
  `globals.css`. La única dependencia añadida es `canvas-confetti` (ISC).
- **El lienzo vive dentro del diálogo.** Un `<dialog>` modal se pinta en la capa superior del
  navegador y taparía cualquier lienzo externo, sin importar su `z-index`.
- **Accesibilidad (RNF-11).** `<dialog>` nativo con `showModal`, que confina el foco y se cierra
  con Esc; las monedas son botones con `aria-pressed`; el confeti respeta
  `prefers-reduced-motion`.
- **Sin red (RNF-10).** Nada de la secuencia sale del navegador.

## 5. Pendiente

Cuando se construya la vista del plan de la Fase 4 (paso 4.4), la integración de `/demo` debe
trasladarse a esa vista.

# Huevo de Pascua «Cuadre perfecto» (SC-02)

| Dato | Valor |
|---|---|
| Solicitud de cambio | SC-02, incidencia #8 |
| Requisito | RF-14 · El sistema deberá revelar los créditos del proyecto mediante una secuencia oculta de interacción |
| Prioridad | Baja |
| Origen | Indicación del docente (STK-03) |
| Criterio de aceptación | CA-13 |
| Componente | C-01, en la vista del plan del panel desde la Fase 4 |

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

En `http://localhost:3000/panel`, con la sesión iniciada:

| Campo | Valor |
|---|---|
| Presupuesto semanal | 200 |
| La semana inicia en | Lunes |
| Compromisos | Uno solo: monto 600, una sola vez, con fecha límite en el **último día de la tercera semana** |
| Ingresos extraordinarios | Ninguno |
| Meta de ahorro | Sin definir |

La fecha de cálculo ya no se captura: la fija el servidor con la fecha de hoy en
`America/Mexico_City` (SC-05). Por eso la fecha límite se calcula respecto del inicio de la
semana en curso: si la semana 1 empieza el lunes *L*, la fecha límite es *L* + 20 días.

El plan resultante tiene tres semanas con $200.00 apartados y $0.00 de remanente. Activar las
tres monedas en orden abre los créditos.

Ejemplo verificado el 29 de septiembre de 2026: semana 1 desde el 2026-09-28, fecha límite
2026-10-18.

## 3. Criterio de aceptación CA-13

| # | Verificación | Resultado esperado |
|---|---|---|
| 1 | Ejecutar la receta de la sección 2 | Se abre el plan de créditos |
| 2 | Activar una moneda fuera de orden | La alcancía se reinicia y no se abren los créditos |
| 3 | Calcular un plan que no cuadra (presupuesto 201 en la receta) | No aparece ninguna moneda activable: la columna muestra el importe |
| 4 | Completar la secuencia solo con teclado (Tab y Enter) y cerrar con Esc | Todo se opera sin ratón; el foco vuelve a la página al cerrar |
| 5 | Activar "reducir movimiento" en el sistema operativo y repetir | Los créditos se muestran sin confeti |

## 4. Implementación

| Archivo | Responsabilidad |
|---|---|
| `src/lib/huevo/secuencia.ts` | Lógica pura: detección del cuadre perfecto y estado de la alcancía |
| `src/lib/huevo/creditos.ts` | Roles, horas y créditos tomados de las secciones 1.7.2 y 1.8.5 del documento maestro |
| `src/components/ui/confetti.tsx` | Componente Confetti de Magic UI (MIT), sin `ConfettiButton` |
| `src/components/creditos/dialogo-creditos.tsx` | Diálogo accesible con el plan de créditos |
| `src/components/plan/tabla-semanas.tsx` | Integración en la vista del plan: la columna "Te queda" se vuelve moneda |

**Decisiones:**

- **Pista discreta (30 de septiembre de 2026).** Si alguna semana del plan cierra en $0.00
  pero no todas (`hayCuadreParcial`), bajo la tabla aparece: "Algunas semanas cierran justo
  en $0.00. ¿Qué pasaría si todas lo hicieran?". Sugiere que hay algo por descubrir sin
  revelar la secuencia; un plan sin ninguna semana en cero no muestra pista. La condición de
  activación de SC-02 no cambia.
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

## 5. Estado

Trasladado a la vista real del plan en la Fase 4 (commit `e687dcb`) y retirado del prototipo
`/demo`, que lo alojaba de forma temporal: existe una sola implementación.

**Verificación del 29 de septiembre de 2026.** Los pasos 1 a 4 de CA-13 se ejecutaron en el
panel con el usuario de prueba: la secuencia en orden abre los créditos, activar una moneda
fuera de orden reinicia la alcancía, un plan que no cuadra no muestra monedas, y todo se opera
con teclado, con el diálogo modal cerrándose con Esc. El paso 5, con "reducir movimiento"
activado en el sistema operativo, queda para la Fase 5.

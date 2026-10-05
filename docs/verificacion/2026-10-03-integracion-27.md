# Evidencia · incidencia #27 y primera ejecución de la integración en la Fase 5 · 03/10/2026

Rama `feature/verificacion` en `8ca4523` más la corrección de la #27 sin commitear. Node 25.7.0.
Usuario C creado por el responsable. Se comprobó que sus variables existen y que su correo es
distinto del de A y del de B, sin imprimir los valores.

## Ejecución

```text
$ pnpm exec vitest run --config vitest.integracion.mts --reporter=default --reporter=json \
    --outputFile=docs/verificacion/2026-10-03-integracion-27.json
 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 19 passed | 2 skipped (22)
   Start at  17:24:35
```

| Archivo | Resultado |
|---|---|
| `captura.integracion.test.ts` (usuario C) | 11 de 11 correctas y 1 marcador omitido |
| `aislamiento.integracion.test.ts` (usuarios A y B) | 8 correctas, **1 fallida** y 1 marcador omitido |

## #27: la captura del usuario A sobrevive a la ejecución

Conteo de filas con la sesión de A después de la ejecución:

| presupuestos | compromisos | ingresos_extra | metas_ahorro | planes |
|---|---|---|---|---|
| 1 | 1 | 0 | 0 | 5 |

Antes de la corrección, `limpiar` dejaba en 0 las cuatro primeras tablas (30/09/2026). La
captura de A ya no se toca: **la #27 queda corregida**.

## Fallo de CA-10: es un defecto de la prueba, no una fuga de datos

La prueba "ningún intento del usuario B alcanza datos del usuario A" encontró filas en cuatro
intentos:

| Intento | Filas visibles para B |
|---|---|
| `select * from planes` | 2 |
| `select * from asignaciones_semanales` | 4 |
| `select * from presupuestos` | 1 |
| `select * from compromisos` | 1 |

Se comprobó la propiedad de cada fila con la sesión de B:

| Tabla | Filas | De B | De A | De otro usuario |
|---|---|---|---|---|
| planes | 2 | 2 | 0 | 0 |
| presupuestos | 1 | 1 | 0 | 0 |
| compromisos | 1 | 1 | 0 | 0 |
| ingresos_extra | 0 | 0 | 0 | 0 |
| metas_ahorro | 0 | 0 | 0 | 0 |
| asignaciones_semanales | 4 | 4 (de planes de B) | 0 | 0 |

**Todas las filas son de B.** La seguridad por fila funciona.

**Causa.** Los intentos 5 a 10 cuentan **todas** las filas que B puede leer, en lugar de las
filas de A. La prueba asumía, sin comprobarlo, que B nunca tiene datos propios. El 30/09/2026 se
usó la cuenta de B para la demostración del huevo de Pascua: capturó un presupuesto y un pago y
generó dos planes. Desde entonces, la prueba da un **falso positivo de fuga**.

**Consecuencia.** CA-10 no puede declararse con esta ejecución. Se registra como defecto de la
prueba y se repite tras corregirlo (Bloque 3). Este JSON queda como resultado "antes".

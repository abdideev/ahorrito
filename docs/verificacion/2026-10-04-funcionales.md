# Criterios funcionales CA-02, CA-03, CA-05, CA-14, CA-15, CA-16, CA-18, CA-19 y CA-08 (local) · 04/10/2026

Plan de pruebas, secciones 6.1 y 6.2. Compilación de producción (`pnpm build` + `pnpm start`) en
`feature/verificacion`. Navegador integrado (Chromium 152), con la sesión de la cuenta creada en
CP-01 (vacía al empezar: 0 pagos). Fecha de referencia de los planes: 04/10/2026.

**Datos capturados para la tanda:** presupuesto de 500 con inicio en lunes; "Prueba CA-03" de 600
con vencimiento el 20/10/2026 y 3 meses; "Prueba CA-05" de 700 con vencimiento el 29/11/2026,
una sola vez. El plan resultante tiene 12 semanas.

## CP-02 · CA-02 (RF-02), parte funcional

**Criterio:** "Al capturar un presupuesto de 500 con inicio de semana en lunes, el plan generado
inicia sus periodos en lunes".

**Resultado:** las 12 semanas de la tabla empiezan en lunes (día de la semana calculado de cada
fecha de inicio, conjunto `{1}`), del 28 sep al 14 dic. **Cumplido.** La parte unitaria
(`calendario.test.ts`) está en verde en cada ejecución de `pnpm test`.

## CP-03 · CA-03 (RF-03), parte funcional

**Criterio:** "Un compromiso de 600 con vencimiento el día 20 y 3 ocurrencias genera tres fechas
límite: 20 del mes actual y de los dos siguientes".

| Semana | Periodo | Vence |
|---|---|---|
| 4 | 19 oct – 25 oct | Prueba CA-03 $600.00 (20/10) |
| 8 | 16 nov – 22 nov | Prueba CA-03 $600.00 (20/11) |
| 12 | 14 dic – 20 dic | Prueba CA-03 $600.00 (20/12) |

**Cumplido.**

## CP-05 · CA-05 (RF-08), parte funcional

**Criterio:** "Una semana en la que vencen compromisos por 700 con un presupuesto de 500 aparece
marcada como semana de carga elevada".

Semana 9 (23 nov – 29 nov): presupuesto $500.00, "Vence: Prueba CA-05 $700.00", chip
**"Carga alta"**. No queda en déficit, porque lo apartado antes la cubre (ver la observación de
`2026-10-03-ca07.md`). **Cumplido.**

## CP-14 · CA-14 (RF-04)

**Criterio:** "Al cambiar el monto de un compromiso de 600 a 900 y eliminar otro, el plan
regenerado aparta según 900 y no incluye el eliminado; un plan guardado antes del cambio muestra
todavía 600".

1. "Prueba CA-03" se editó a 900 ("Pago actualizado.") y "Prueba CA-05" se eliminó con
   confirmación.
2. **Plan regenerado:** vencimientos de $900.00 en las semanas 4, 8 y 12, y ninguna semana con
   "CA-05".
3. **Plan guardado antes del cambio** (`GET /api/planes/{id}` del más antiguo de la cuenta,
   generado a las 07:07:20 UTC): contiene `"monto":60000` (600.00) y `"monto":70000` (700.00, el
   pago eliminado), y **no** contiene 90000. Es la instantánea de SC-03.

**Cumplido.**

## CP-15 · CA-15 (RF-05)

**Criterio:** "Un ingreso extraordinario de 1,000 con fecha en la semana 3 eleva el disponible de
esa semana a presupuesto + 1,000 y de ninguna otra".

Ingreso de 1,000 el 14/10/2026 ("Ingreso agregado.") y "Recalcular con mis datos". La columna
"Disponible" muestra **$1,500.00 en la semana 3** (12 oct – 18 oct) y **$500.00 en las otras 11**.
**Cumplido.**

## CP-16 · CA-16 (RF-06)

**Criterio:** "Una meta con fecha de hoy o anterior se rechaza con un mensaje en el campo; una meta
válida aparece evaluada en el plan siguiente".

| Paso | Resultado |
|---|---|
| Meta de 3,000 **con fecha de hoy** (04/10/2026), quitando antes la restricción `min` del campo para que la validación sea la del servidor | Rechazo: el campo queda con `aria-invalid="true"`, el mensaje del campo dice "Elige una fecha posterior a hoy." y el general, "Revisa los campos marcados." |
| Meta de 3,000 al 31/12/2026 | "Meta guardada." |
| "Recalcular con mis datos" | Tarjeta **"Tu meta de ahorro: Sí es alcanzable para el 31 de diciembre de 2026"**, el resumen "Además, $3,000.00 van a tu meta" y la columna "Para tu meta" en la tabla |

**Cumplido.**

## CP-18 · CA-18 (RF-12), sistema HTTP con la sesión del navegador

**Criterio:** "Tras generar planes, `GET /api/planes` los lista en orden descendente; el detalle
es idéntico al generado; `DELETE` responde 204, el plan desaparece y un segundo `DELETE`
responde 404".

| Comprobación | Resultado |
|---|---|
| `GET /api/planes` | `{ planes: [...] }` con 6 planes, en orden descendente por `generadoEn` |
| `POST /api/planes` con `{"explicar":false}` | 200, `application/x-ndjson`, una línea `{tipo, id, plan}` |
| El plan nuevo encabeza la lista | Sí (7 planes) |
| `GET /api/planes/{id}` frente al plan de la línea NDJSON | **0 diferencias** en una comparación campo por campo. Una comparación textual de JSON daba distinto solo por el orden de las claves anidadas |
| `DELETE /api/planes/{id}` | **204** |
| `GET` del mismo id | **404** |
| Segundo `DELETE` | **404** |
| Lista después del borrado | 6 planes; el borrado ya no aparece |
| `GET` de un UUID que no existe | 404 |

**Cumplido.** Los dos planes creados para esta prueba se borraron.

## CP-19 · CA-19 (RF-13)

**Criterio:** "Al modificar un dato y pulsar 'Recalcular con mis datos', el plan se actualiza sin
pedir explicación en 2 s o menos, 5 de 5 veces" (umbral aprobado el 03/10/2026).

Medido desde el clic hasta que el botón deja de decir "Calculando…" y vuelve a estar activo. Se
interceptó el cuerpo de cada `POST`.

| # | Tiempo | Cuerpo enviado | Aviso "se recalculó sin pedir explicación" |
|---|---|---|---|
| 1 (justo después de editar el pago a 900) | 721 ms | `{"explicar":false}` | Sí |
| 2 | 526 ms | `{"explicar":false}` | Sí |
| 3 | 333 ms | `{"explicar":false}` | Sí |
| 4 | 314 ms | `{"explicar":false}` | Sí |
| 5 | 293 ms | `{"explicar":false}` | Sí |

**5 de 5 en 2 s o menos (máximo 721 ms). Cumplido.**

## CP-08 · CA-08 (RNF-01), medición local

**Criterio:** "Sobre 20 solicitudes registradas, al menos 18 se completan en 30 segundos o menos".

Script `docs/verificacion/scripts/cronometro-plan.js`: 20 `POST /api/planes` seguidos con
explicación, como "Generar mi plan". Mide la llegada de la línea del plan y la de la
explicación. Resultado completo en `2026-10-04-ca08-local.json`.

| | Valor |
|---|---|
| Dentro de 30 s | **20 de 20** |
| Plan: mínimo / mediana / máximo | 245 / 310 / 804 ms |
| Explicación: rango | 2,039 a 2,963 ms, las 20 recibidas |
| HTTP | 200 en las 20 |
| Planes de prueba borrados al terminar | 20 de 20 |

**Cumple en local.** Según el plan (sección 8), **solo la medición en producción cuenta para
RNF-01**. Esta queda como evidencia preliminar y se repite en Vercel en el Bloque 6.

## Estado de la cuenta al terminar

Presupuesto de 500; "Prueba CA-03" de 900; el ingreso de 1,000 el 14/10; la meta de 3,000 al
31/12; y los planes de la tanda que no se borraron. Es una cuenta de un miembro del proyecto: se
puede limpiar desde la interfaz.

---

## CP-22 · CA-22 (RNF-06) y CP-24 · CA-24 (RNF-08)

```text
$ pnpm exec vitest run --coverage --reporter=default --reporter=json \
    --outputFile=docs/verificacion/2026-10-04-unitarias-cobertura.json
 Test Files  28 passed (28)
      Tests  354 passed (354)
All files  | 99.21 % Stmts | 98.63 % Branch | 100 % Funcs | 99.19 % Lines   (solo src/core)
```

**CA-22:** casos de `src/core` en el JSON: **94 de 94 correctos**, frente a un mínimo de 15 con el
100 % satisfactorio. **Cumplido.**

**CA-24:**

- Importaciones de los archivos de producción de `src/core`: **solo módulos relativos del propio
  núcleo** (`./tipos`, `./calendario`, `./vencimientos`, `./distribucion`, `./evaluacion` y
  `./plan`).
- `vitest` aparece únicamente en los seis `*.test.ts`. No hay ninguna importación de `next`,
  `react`, `@supabase/*` ni `@/`.
- La regla `no-restricted-imports` de `eslint.config.mjs` lo impone, y `pnpm lint` termina sin
  errores.
- Cobertura del motor: **99.19 % en líneas**, frente a un mínimo de 80 %.

**Cumplido.**

**Aclaración para el informe:** el 99.19 % es la cobertura de `src/core`, la única carpeta que
mide `vitest.config.mts`. No es la cobertura de toda la aplicación.

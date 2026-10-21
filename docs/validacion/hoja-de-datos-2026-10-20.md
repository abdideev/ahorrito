# Hoja de datos de las sesiones de validación · 20/10/2026

| Campo | Valor |
|---|---|
| Origen | Perfiles P1 a P3 del plan de pruebas, sección 7.1 (referencia original 05/10/2026) |
| Desplazamiento | **+15 días** en todas las fechas (justificación: protocolo, sección 5) |
| Fecha de referencia del resultado esperado | **20/10/2026** (hora del centro de México) |
| Cálculo | Motor real, `docs/validacion/scripts/perfiles-validacion.sim.ts`; salida en `docs/validacion/2026-10-20-perfiles-esperados.txt` |
| Comprobación | Todas las fechas quedan después del 20/10/2026 |
| Versión | 1.1, del 21/10/2026, corregida por revisión antes de cualquier sesión (receta de la sección 5 y validez de la sección 4). Aprobada con el protocolo 1.1 el 21/10/2026 (registrada a las 02:40) |
| Validez del resultado esperado | Planes generados el **20 o el 21/10/2026**. Con referencia 21/10 el resultado es idéntico (`2026-10-21-perfiles-esperados.txt`); desde el 22/10 cambia P2 y hay que recalcular. Los datos que se entregan no cambian |

**Cómo se usa:** cada evaluador recibe **solo** la hoja de su perfil (secciones 1 a 3), copiada tal
cual. La sección 4, el resultado esperado, **no se entrega**.

---

## 1. Hoja para E1 · Perfil P1

> **Tus datos para Ahorrito**
>
> Tu presupuesto
> - ¿Cuánto dinero recibes cada semana? **700**
> - ¿Qué día inicia tu semana? **Lunes**
>
> Tus pagos (agrega los cuatro)
>
> | ¿Qué pago es? | Monto de cada pago | Fecha límite | ¿Cuántos meses? |
> |---|---|---|---|
> | Renta | 1800 | 20/11/2026 | 3 meses seguidos |
> | Transporte | 600 | 30/10/2026 | 3 meses seguidos |
> | Servicio de internet | 350 | 04/11/2026 | 3 meses seguidos |
> | Teléfono | 250 | 12/11/2026 | 3 meses seguidos |
>
> Con eso ya puedes generar tu plan.

## 2. Hoja para E2 · Perfil P2

> **Tus datos para Ahorrito**
>
> Tu presupuesto
> - ¿Cuánto dinero recibes cada semana? **1500**
> - ¿Qué día inicia tu semana? **Jueves**
>
> Tus pagos (agrega los tres)
>
> | ¿Qué pago es? | Monto de cada pago | Fecha límite | ¿Cuántos meses? |
> |---|---|---|---|
> | Inscripción escolar | 6000 | 31/10/2026 | Una sola vez |
> | Renta | 2000 | 16/11/2026 | 3 meses seguidos |
> | Gimnasio | 300 | 09/11/2026 | 3 meses seguidos |
>
> Con eso ya puedes generar tu plan.

## 3. Hoja para E3 · Perfil P3

> **Tus datos para Ahorrito**
>
> Tu presupuesto
> - ¿Cuánto dinero recibes cada semana? **2000**
> - ¿Qué día inicia tu semana? **Domingo**
>
> Tus pagos (agrega los dos)
>
> | ¿Qué pago es? | Monto de cada pago | Fecha límite | ¿Cuántos meses? |
> |---|---|---|---|
> | Renta | 2500 | 18/11/2026 | 2 meses seguidos |
> | Servicios del hogar | 600 | 06/11/2026 | 2 meses seguidos |
>
> Con eso ya puedes generar tu plan.
>
> **Después de ver tu plan** (ya sin prisa), agrega esto en la sección "Opcional: ingresos extra y
> meta de ahorro":
> - Ingreso extra: ¿De cuánto? **1000** · ¿Qué día lo recibes? **07/11/2026**
> - Meta de ahorro: ¿Cuánto quieres ahorrar? **25000** · ¿Para cuándo? **19/12/2026**
>
> Después pulsa **"Recalcular y explicar"**.

---

## 4. Resultado esperado (NO se entrega a los evaluadores)

Motor real, fecha de referencia **20/10/2026**; idéntico con referencia 21/10/2026. Si un
evaluador genera su plan otro día, se recalcula con `FECHA_REFERENCIA=<fecha>` antes de comparar.
Del 22 al 25/10 se comprobó que P2 ya no coincide.

| Perfil | Primer plan (presupuesto y pagos) | Semanas con carga alta | Semanas que no alcanzan | Semana 1 | Remanente mínimo |
|---|---|---|---|---|---|
| **P1** | 14 semanas, del 19/10/2026 al 20/01/2027 | 5, 7, 9 y 14 | 1, 2, 6, 7, 8 y 9 | Aparta 839.17; queda −139.17 | −139.17 |
| **P2** | 14 semanas, del 15/10/2026 al 16/01/2027 | 3, 5, 9 y 14 | 1, 2 y 3 | Aparta 2,475.00; queda −975.00 | −975.00 |
| **P3** | 9 semanas, del 18/10/2026 al 18/12/2026 | 5 y 9 | Ninguna | Aparta 700.00; queda 1,300.00 | 1,255.00 |

- **P3 con el ingreso extra y la meta** (después del primer plan): 9 semanas, del 18/10/2026 al
  19/12/2026. **Meta no alcanzable:** ahorro posible de 12,800.00 y faltante de 12,200.00.
- **Cambia respecto al plan de pruebas** (referencia 05/10): en P1, las semanas con carga alta
  pasan de 5, 9, 11 y 14 a 5, 7, 9 y 14, porque cambia el día de la semana de la fecha de
  referencia (sección 5 del protocolo). P2 y P3 conservan las mismas semanas señaladas.

## 5. Receta para la Parte B (solo E2 y E3, después de la Parte A)

El paso 7 del guion de humo necesita un plan que cuadre al centavo.

**Pasos en el panel, con los nombres exactos de los controles** (verificados en el código de
v1.1.0):

| # | Qué se borra o cambia | Control | Quién | Código |
|---|---|---|---|---|
| 1 | Cada pago del perfil | Icono de papelera (su nombre accesible es "Eliminar <nombre del pago>") → **"Confirmar"** | E2 y E3 | `fila-compromiso.tsx:70`, `boton-eliminar.tsx` |
| 2 | El ingreso extra | **"Eliminar"** → **"Confirmar"** | E3 | `seccion-ingresos.tsx:43`, `boton-eliminar.tsx` |
| 3 | La meta de ahorro | **"Quitar la meta de ahorro"** (sin confirmación) | E3 | `formulario-meta.tsx:98` |
| 4 | Presupuesto | **"Editar"** → 200, Lunes → **"Guardar presupuesto"** | E2 y E3 | `formulario-presupuesto.tsx:116` |
| 5 | Pago nuevo | **"Renta" · 600 · fecha límite 08/11/2026 · Una sola vez** | E2 y E3 | — |

**E3 debe borrar el ingreso extra y la meta.** Si no, el plan no cuadra. Comprobado con el motor
real (`esCuadrePerfecto`, referencia 21/10/2026):

| Datos | Resultado |
|---|---|
| Receta sin ingreso extra ni meta | **3 semanas** (19/10, 26/10 y 02/11), aparta **200** cada una, queda **$0.00**; cuadra |
| Receta más el ingreso de P3 (1,000 el 07/11) | 3 semanas, pero la tercera queda en 1,000; **no cuadra** |
| Receta más la meta de P3 (25,000 al 19/12) | **9 semanas**, las seis últimas quedan en 200; **no cuadra** |

**Vigencia:** sin ingreso ni meta, la receta da el mismo plan con referencia del 20, 21, 22 y
25/10/2026; el 26/10 ya no cuadra (2 semanas en déficit).

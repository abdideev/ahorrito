# Mantenimiento de Ahorrito (lista de verificación, puntos 10.1 a 10.7)

| Campo | Valor |
|---|---|
| Versión del documento | 1.0, 21/10/2026 |
| Procedimiento base | Control de cambios del documento maestro, sección 2.8, y `docs/Ahorrito-PLAN.md`, secciones 2.4 y 2.6 |
| Restricción | RES-15: no hay mantenimiento comprometido después de la entrega. Lo que sigue es el proceso aplicado durante el proyecto, que rige hasta la calificación |

**Caso ejercitado de principio a fin:** SC-09, aviso de privacidad, [#32](https://github.com/abdideev/ahorrito/issues/32).

**Contraejemplo:** el botón "Mostrar contraseña" de `v1.1.0`, [#41](https://github.com/abdideev/ahorrito/pull/41), que entró sin solicitud de cambio.

---

## 10.1 Proceso para solicitar modificaciones

**Toda modificación se pide con una incidencia en GitHub:**

| Tipo | Etiqueta | Identificador |
|---|---|---|
| Cambio de requisito, diseño o tecnología | `cambio` (y `requisito` si toca la línea base) | SC-nn en el título |
| Defecto o incidente | `defecto` | — |

Ambos llevan una etiqueta de prioridad: `prioridad:alta`, `media` o `baja`.

**Plantilla de solicitud de cambio**, que es el formato usado desde SC-01:

```text
Título: SC-nn: <cambio en una línea>
Etiquetas: cambio, prioridad:<…> [, requisito]

## Registro (paso 1)
- Cambio solicitado:
- Origen y fecha:
- Requisitos y documentos afectados (secciones 2.2, 2.7, 3.x…):
## Evaluación de impacto (paso 2)
- Alcance / cronograma / costo / riesgos:
- Efecto sobre criterios de aceptación (en la Fase 7: CA-20 y OBJ-05):
- Alternativas descartadas:
## Decisión (paso 3) — comentario aparte de STK-01, con fecha
## Cierre (pasos 4 y 5) — commits con Refs #n, pruebas, documentación actualizada
```

**Evidencia:** SC-01 a SC-10, [#1](https://github.com/abdideev/ahorrito/issues/1) a [#33](https://github.com/abdideev/ahorrito/issues/33), todas cerradas.

**Estado: ejercitado.**

## 10.2 Evaluación de impacto antes de implementar

- **En el caso SC-09:** registro a las 20:17:26 del 03/10/2026, con su impacto evaluado. Primer
  commit de implementación a las 21:08:15.
- **Fuente:** API de GitHub y `git log`; detalle en las respuestas del 05/10/2026, sección B.3.
- **Estado: ejercitado.**

## 10.3 Requisitos afectados por cada cambio

- **En el caso SC-09:**
  - el registro nombra RF-15 (nuevo), 1.5.1, 2.2, 2.7, 2.10 (CA-26), 3.9.1 y A.4;
  - la matriz 2.7 del documento maestro tiene la nota de SC-09.
- **Estado: ejercitado.**

## 10.4 Autorización de los cambios

- **En el caso SC-09:** comentario "Decisión (paso 3)" de STK-01 en #32, a las 20:26:51 del
  03/10/2026, **antes** del primer commit.
- **Contraejemplo:** el botón de #41 se implementó el 05/10/2026 **sin solicitud ni decisión
  registrada**, por indicación del responsable, y se declaró después en el documento maestro (2.8,
  "Cambios sin solicitud").
- **Regla vigente desde la Fase 7:** con la versión congelada (`v1.1.0`), cualquier cambio exige
  solicitud de cambio registrada y autorizada **antes** de programarlo, con su efecto sobre CA-20 y
  OBJ-05 (protocolo de validación, sección 2).
- **Estado: ejercitado,** con una excepción declarada.

## 10.5 Pruebas antes de liberar

| Caso | Pruebas | Evidencia |
|---|---|---|
| SC-09 | `validacion.test.ts` (casilla de consentimiento), `rutas.test.ts` (aviso público) y, desde SC-10, E2E-04 ("Volver al panel"); suite completa antes del PR #35 | `docs/verificacion/2026-10-03-unitarias-sc09.json` (354 de 354) |
| `v1.1.0` | Unitarias, integración y E2E antes del PR #43; prueba de humo en producción | `docs/verificacion/2026-10-05-liberacion-v1.1.0.md` |

**Precisión:** el "6 de 6" de interfaz registrado para `v1.1.0` corrió sobre una compilación
anterior. Se repitió el 05/10 después de `pnpm build`, con 6 de 6. Ver la recomendación de
compilar antes en las respuestas del 05/10, H.2.

**Estado: ejercitado.**

## 10.6 Documentación actualizada después de los cambios

- **En el caso SC-09:**
  - `docs/verificacion/2026-10-03-sc09.md`;
  - documento maestro, versión 4.0 (RF-15 y CA-26);
  - PLAN §1.7 (tabla de cambios de alcance).
- **Bitácora:** `docs/verificacion/cambios-al-documento.md` registra cada cambio que el trabajo
  obliga a hacer en el documento maestro, con texto actual, texto nuevo y evidencia.
- **Estado: ejercitado.** Falta aplicar las contradicciones del PLAN §1.7 listadas el 20/10/2026.

## 10.7 Historial de versiones

| Fuente | Evidencia |
|---|---|
| Etiquetas anotadas en `main` | `v0.1.0`, `v0.2.0`, `v0.3.0`, `v0.9.0`, `v1.0.0` y `v1.1.0`; `v1.0.0-rc.1` en `dev` (`git tag -n1`) |
| Documento maestro | "Historial de versiones del documento", de 1.0 a 4.1 |
| Repositorio | Historial de commits y pull requests (#2 a #44) |
| Identificación de versiones | `docs/liberacion.md` 8.2 |

**Estado: ejercitado.**

---

## Resumen

| Punto | Estado | Falta |
|---|---|---|
| 10.1 | Ejercitado | — |
| 10.2 | Ejercitado | — |
| 10.3 | Ejercitado | — |
| 10.4 | Ejercitado con una excepción declarada (#41) | — |
| 10.5 | Ejercitado | Hacer que `pnpm test:e2e` compile antes, o exigirlo en el procedimiento |
| 10.6 | Ejercitado | Aplicar el PLAN §1.7 |
| 10.7 | Ejercitado | — |

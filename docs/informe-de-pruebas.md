# Informe de pruebas de Ahorrito · Fase 5

| Dato | Valor |
|---|---|
| Versión del informe | 1.0, **borrador para aprobación** |
| Fecha | 04/10/2026 |
| Elaboró | Abdiel Avila Neri, como tester (STK-02), con asistencia de Claude |
| Aprueba | Abdiel Avila Neri, como líder y cliente (STK-01) |
| Plan de referencia | `docs/plan-de-pruebas.md`, versión 1.0, aprobada el 03/10/2026 |
| Base probada | Rama `feature/verificacion` en `248fa5f`, compilación de producción (`pnpm build` + `pnpm start`) |
| Periodo de ejecución | 03 y 04/10/2026 |
| Evidencia | `docs/verificacion/`: un archivo por criterio o grupo, con los JSON de Vitest y Playwright, registros, capturas y scripts |

---

## 1. Resumen

| Estado | Criterios |
|---|---|
| **Cumplidos** (21) | CA-01, CA-02, CA-03, CA-04, CA-05, CA-06, CA-07, CA-09, CA-10, CA-11, CA-12, CA-13, CA-14, CA-15, CA-16, CA-17, CA-18, CA-19, CA-22, CA-24 y CA-26 |
| **Cumplidos en parte** (3) | CA-08: cumple en local; la medición que cuenta es la de producción. CA-21: cumple la parte (a); la (b) es de producción. CA-23: 3 navegadores sin defectos, pero una sola versión de cada uno y sin Safari |
| **Pendientes por diseño del plan** (2) | CA-25 (despliegue, Bloque 6) y CA-20 (usuarios reales, Fase 7) |
| **Incumplidos** | **Ninguno** |

**Defectos de la fase:** 4 con incidencia (#27, #30, #31 y #34), más 3 corregidos sin incidencia
propia (sección 4.2). Todos están **corregidos**, y los cuatro con incidencia tienen una prueba que
los protege. **0 defectos abiertos** de cualquier severidad.

**Regresión final** (`docs/verificacion/regresion/2026-10-04-regresion-final.md`): 354 de 354
unitarias, 20 de 20 de integración y 6 de 6 de interfaz.

---

## 2. Resultado por criterio

| CA | Requisito | Resultado | Cifra | Evidencia |
|---|---|---|---|---|
| CA-01 | RF-01 | **Cumplido** | Registro real con confirmación por correo, acceso al panel y rechazo de la contraseña incorrecta ("Correo o contraseña incorrectos.") | `2026-10-04-ca01-ca26.md` |
| CA-02 | RF-02 | **Cumplido** | 12 de 12 semanas inician en lunes con 500 de presupuesto; la prueba unitaria está en verde | `2026-10-04-funcionales.md` |
| CA-03 | RF-03 | **Cumplido** | 600 el día 20 con 3 ocurrencias → vencimientos el 20/10, el 20/11 y el 20/12 | Ídem |
| CA-04 | RF-07 | **Cumplido** | Unitaria `distribucion.test.ts`: 200 / 200 / 200 | `regresion/2026-10-04-unitarias.json` |
| CA-05 | RF-08 | **Cumplido** | La semana con 700 de vencimientos y 500 de presupuesto lleva el chip "Carga alta"; la prueba unitaria está en verde | `2026-10-04-funcionales.md` |
| CA-06 | RF-09 | **Cumplido** | Unitaria `evaluacion.test.ts`: no alcanzable, con el faltante | `regresion/2026-10-04-unitarias.json` |
| CA-07 | RF-11 | **Cumplido** | Descargo entre 97 y 187 px en una ventana de 800 (escritorio) y entre 16 y 194 px en una de 812 (móvil, **primera medición en móvil**); lo protege E2E-01 | `2026-10-03-ca07.md`, `2026-10-04-sc10-e2e.md` |
| CA-08 | RNF-01 | **En parte** | Local: **20 de 20** en 30 s o menos, con mediana de 310 ms y máximo de 804 ms. Falta producción | `2026-10-04-ca08-local.json` |
| CA-09 | RNF-03 | **Cumplido** | **5 de 5** desde la interfaz con la clave revocada (HTTP 400 en el servidor); 10 de 10 en el servidor el 18/09 | `2026-10-04-ca09-ca11-ca17.md` |
| CA-10 | RNF-04 | **Cumplido** | **13 de 13** intentos denegados con 0 filas ajenas, más el rechazo `42501` de la escritura a nombre de otro usuario. La denegación se manifiesta como 0 filas, 404 o `42501`, sin revelar si el recurso existe (AM-01, decisión del 03/10) | `2026-10-03-ca10.md` |
| CA-11 | RNF-10 | **Cumplido** | **10 de 10** solicitudes al proveedor (el 100 % de la sesión) sin datos identificables | `2026-10-04-ca09-ca11-ca17.md` |
| CA-12 | RNF-11 | **Cumplido** | axe: 0 violaciones en 7 pantallas × 2 temas. Lighthouse: 100 en 5 pantallas y 31/31 en Snapshot. Contraste mínimo de 4.79:1 en claro y 5.81:1 en oscuro. **27 de 27** controles con teclado | `2026-10-03-ca12.md` |
| CA-13 | RF-14 | **Cumplido** | Pasos 1 a 4 (30/09). Paso 5: sin confeti con "reducir movimiento"; el lienzo queda en 300 × 150 frente a 836 × 948 en el control positivo | `2026-10-04-ca13.md` |
| CA-14 | RF-04 | **Cumplido** | Plan regenerado con 900 y sin el pago eliminado; el plan anterior conserva 600 | `2026-10-04-funcionales.md` |
| CA-15 | RF-05 | **Cumplido** | Semana 3 con disponible de $1,500.00; las otras 11, con $500.00 | Ídem |
| CA-16 | RF-06 | **Cumplido** | Meta con fecha de hoy rechazada en el servidor ("Elige una fecha posterior a hoy."); la meta válida aparece como "Sí es alcanzable" | Ídem |
| CA-17 | RF-10 | **Cumplido** | **5 de 5** explicaciones con advertencias y las 7 cifras citadas idénticas a las del motor | `2026-10-04-ca09-ca11-ca17.md` |
| CA-18 | RF-12 | **Cumplido** | Lista en orden descendente, 0 diferencias entre el detalle y el plan generado, `DELETE` 204 y luego 404 | `2026-10-04-funcionales.md` |
| CA-19 | RF-13 | **Cumplido** | **5 de 5** en 2 s o menos (de 293 a 721 ms), todos con `{"explicar":false}` | Ídem |
| CA-20 | RNF-02 | Pendiente (Fase 7) | — | — |
| CA-21 | RNF-05 | **En parte** | (a) **6 de 6** contraseñas con bcrypt `$2a$10$`, 0 fuera de formato. (b) Pendiente de producción | `2026-10-04-ca21a.md` |
| CA-22 | RNF-06 | **Cumplido** | 94 de 94 casos de `src/core` (mínimo: 15) | `2026-10-04-funcionales.md` |
| CA-23 | RNF-07 | **En parte** | Guion de 11 pasos sin defectos en Chrome 154, Edge 154 y Firefox 157 | `2026-10-04-ca23-guion.md` |
| CA-24 | RNF-08 | **Cumplido** | 0 importaciones del marco en `src/core`; cobertura del motor de 99.19 % en líneas | `2026-10-04-funcionales.md` |
| CA-25 | RNF-09 | Pendiente (Bloque 6) | Evidencia local preliminar: clon limpio en 151 s (03/10) | — |
| CA-26 | RF-15 | **Cumplido** | Aviso a un clic con y sin sesión, rechazo en el servidor sin la casilla, y constancia `aviso_privacidad_version: "1.0"` en la cuenta | `2026-10-03-sc09.md`, `2026-10-04-ca01-ca26.md` |

---

## 3. Mediciones de rendimiento

| Medición | Valor | Fuente |
|---|---|---|
| Llegada del plan (CA-08, local, n = 20) | Mínimo 245 ms, mediana 310 ms, máximo 804 ms | `2026-10-04-ca08-local.json` |
| Llegada de la explicación con servicio (n = 25) | De 2.0 a 3.6 s | CA-08 y CA-17 |
| Recálculo sin explicación (CA-19, n = 5) | De 293 a 721 ms | `2026-10-04-funcionales.md` |
| Aviso sin servicio de IA (CA-09, n = 5) | De 419 a 1,825 ms | `2026-10-04-ca09-ca11-ca17.md` |

Todas son mediciones **locales**: el servidor y el navegador están en el mismo equipo, y Supabase
en us-east-2. Las de producción tendrán latencia de red y arranque en frío de Vercel.

---

## 4. Defectos

Escala de severidad del plan, sección 3. La prioridad es la etiqueta de GitHub.

### 4.1 Defectos con incidencia

| # | Defecto | Severidad | Prioridad | Cómo se detectó | Corrección | Prueba que lo protege | Estado |
|---|---|---|---|---|---|---|---|
| 27 | Las pruebas de integración borraban la captura del usuario A | Menor | Media | Uso (30/09) | Usuario C exclusivo, con una guarda contra el correo de A | La propia guarda de `captura.integracion.test.ts`; captura de A intacta tras ejecutar | Corregido; se cierra con el pull request |
| 30 | La prueba de CA-10 contaba las filas propias de B como acceso cruzado (falso positivo) | Menor | Media | Primera ejecución de la integración en la Fase 5 | Cuenta solo las filas ajenas, con un control positivo | La propia prueba: rojo antes, verde después, con B conservando sus datos | Corregido; ídem |
| 31 | La aplicación no publicaba el aviso de privacidad que exige RES-08 | **Mayor** | Alta | Recolección de evidencia (03/10) | SC-09 (#32): RF-15, `/privacidad`, casilla en el registro | `validacion.test.ts` (casilla), `rutas.test.ts` (ruta pública) y E2E-04 (aviso desde la sesión) | Corregido; ídem |
| 34 | Al borrar el último plan no se anunciaba la confirmación y se perdía el foco | Menor | Media | **Prueba automatizada E2E-04** (SC-10) | Región de estado y foco en la pantalla vacía | E2E-04: rojo antes, verde después, dos veces | Corregido; ídem |

### 4.2 Corregidos sin incidencia propia (desviación del proceso)

| Hallazgo | Severidad | Cómo se detectó | Corrección | Prueba que lo protege |
|---|---|---|---|---|
| El apellido del autor aparecía con acento ("Ávila") en los créditos y el aviso | Cosmética | Indicación del responsable (03/10) | Commit `fix: escribe el apellido del autor sin acento` | Ninguna automática; inspección visual |
| Con sesión, "Volver al inicio" del aviso llevaba a la portada y parecía un cierre de sesión | Menor | Revisión del responsable de SC-09 | Con sesión regresa al panel (`Refs #32`) | E2E-04 comprueba "Volver al panel" |
| El aviso simplificado alargaba la tarjeta del registro a 1,221 px y obligaba a desplazar | Menor (usabilidad) | Revisión del responsable de SC-09 | Aviso compacto: tarjeta de 732 px (`Refs #32`) | Ninguna automática; medición en `2026-10-03-ca12.md` |

Los dos últimos se trataron como ajustes dentro del alcance de SC-09, antes de su cierre. El
primero se propuso como incidencia y no se registró. **El informe los declara para que la
trazabilidad no dependa de leer los commits.**

### 4.3 Defectos anteriores a la Fase 5

El documento maestro, sección 5.3, registra doce problemas de la integración. Solo el último
tiene incidencia (#27). De los once restantes:

- **Con prueba automática que los protege:** la zona horaria de la fecha de referencia
  (`fecha.test.ts`), la fuga de la etiqueta anónima (`etiquetas.test.ts`) y los contratos de SC-05
  y SC-06.
- **Protegidos desde la Fase 5 por SC-10:** los tres de interfaz. E2E-01 cubre las dos regresiones
  de CA-07, E2E-02 las capas de CSS y E2E-03 el panel en blanco.

---

## 5. Regresión

La política del plan (sección 9) se aplicó así:

1. **Cada defecto corregido tiene su prueba.** La salvedad son los tres de la sección 4.2 sin
   prueba automática.
2. **Se guardó el resultado antes y después** en cada corrección con prueba (#30 y #34). En #27,
   el "antes" es el incidente del 30/09, y el "después" la captura de A intacta tras la ejecución.
3. **Suite completa al final:** 354 de 354, 20 de 20 y 6 de 6
   (`docs/verificacion/regresion/`).
4. **Pruebas de interfaz automatizadas (SC-10):** existen desde el 04/10/2026 y ya detectaron un
   defecto (#34) que ni axe, ni Lighthouse, ni la prueba manual de SC-07 habían visto.

---

## 6. Cobertura

| Nivel | Qué cubre | Cifra |
|---|---|---|
| Unitaria (`pnpm test:cov`) | **Solo `src/core`**, la única carpeta que mide `vitest.config.mts` | **99.19 % en líneas**, 98.63 % en ramas y 100 % en funciones (247 de 249 líneas) |
| Unitaria (resto) | Adaptadores, validación, rutas, flujo NDJSON, utilidades | 260 pruebas más, **sin cifra de cobertura**: no se mide |
| Integración | Repositorio contra la base real: aislamiento y captura | 20 pruebas |
| Interfaz | Regresión de CA-07, capas de CSS, render sin JavaScript y humo | 6 pruebas, solo en Chromium |
| Manual | Los criterios funcionales, CA-12 y CA-23 | Según la sección 2 |

**El 99.19 % no es la cobertura de la aplicación**, sino la del motor de cálculo. Huecos conocidos
sin prueba automática propia:

- las Server Actions de captura (`src/app/(app)/acciones.ts`), aunque validan con funciones que sí
  tienen 58 pruebas;
- las rutas `GET` y `DELETE` sobre HTTP con sesión real, cubiertas por CA-18 de forma manual con
  un script;
- la interfaz fuera de los 6 casos de Playwright.

---

## 7. Observaciones (no son defectos)

| Observación | Detalle | Tratamiento propuesto |
|---|---|---|
| Un solo chip por semana | Una semana sobrecargada y en déficit solo muestra "No alcanza"; la sobrecarga se comunica en las advertencias | Decisión documentada (`resumen.ts`). Se mantiene |
| La explicación lista 5 de 8 advertencias | `LIMITES.elementos = 5` en `gemini.ts`; la lista completa está en el plan | Decisión de diseño; revisar si se quiere el total |
| Fechas en ISO en 2 de 5 explicaciones | Estilo del modelo | Ajustar la instrucción del sistema, pendiente desde la Fase 3 |
| El enlace de confirmación solo abre la sesión en el mismo navegador | Flujo PKCE de Supabase; el correo queda confirmado y la aplicación lo explica | Limitación declarada; se repite con el SMTP propio en la Fase 6 |
| La portada no reconoce la sesión | Muestra "Iniciar sesión" aunque haya sesión | Fuera del alcance de la Fase 5; posible mejora |
| Aviso de dependencias pares | Vitest 5 pide `@types/node` 22 o superior; el proyecto declara 20 | Rama `chore/*` antes de la Fase 6 |

---

## 8. Limitaciones

| Limitación | Efecto en los resultados |
|---|---|
| Safari no se pudo probar y solo hay una versión de cada navegador | CA-23 en parte |
| Un solo proyecto de Supabase para el desarrollo, las pruebas y la producción | Las pruebas escriben en la base de producción con cuentas `.test` que se limpian solas |
| Mediciones de rendimiento solo locales | CA-08 en parte hasta medir en Vercel |
| El SMTP por omisión solo entrega a miembros del proyecto | CA-01 se hizo con un correo de miembro; se repite en la Fase 6 |
| Node 25 en desarrollo y Node 24 en producción | Comparación sin diferencias el 03/10; se revisa al desplegar |
| Los puntos legales del aviso no se revisaron contra la ley vigente | Declarados como supuestos en SC-09 |
| Las pruebas de interfaz solo usan Chromium | No sustituyen a CA-23 |
| Las pruebas manuales las hizo la misma persona que desarrolló | Sin independencia entre quien programa y quien prueba; es la condición del equipo de una persona (sección 1.7) |

---

## 9. Lecciones aprendidas

1. **Una restricción sin requisito no se verifica.** RES-09 tuvo su requisito (RF-11) desde la
   revisión de la sección 2.4, pero RES-08 no, y llegó a la Fase 5 sin aviso de privacidad.
   **Regla para adelante:** cada restricción de la sección 1.6 debe tener un requisito o una
   justificación escrita de por qué no lo necesita.
2. **Una prueba no debe depender de datos que no prepara.** La prueba de CA-10 suponía que B no
   tenía datos, y una demostración con su cuenta la volvió roja (#30).
3. **La prueba manual se hace con el caso común.** SC-07 se probó con varios planes y no con el
   último (#34). La prueba automatizada sí lo hizo, porque su recorrido empieza de cero.
4. **Un indicador objetivo vale más que una captura.** En CA-13, el tamaño del lienzo del confeti,
   con su control positivo, probó lo que una captura de pantalla no podía asegurar.

---

## 10. Lo que queda para el despliegue (Bloque 6) y la Fase 7

| Criterio o tarea | Cuándo |
|---|---|
| CA-08 en producción (20 solicitudes) | Bloque 6, después del despliegue |
| CA-21 (b): redirección 308 o 301, HSTS y HAR sin `http://` | Bloque 6 |
| CA-25: despliegue cronometrado en 15 min o menos | Bloque 6 |
| CA-01 con el SMTP propio | Bloque 6 |
| Prueba de humo y juego de capturas desde un commit etiquetado | Bloque 6 |
| CA-20 con tres usuarios | Fase 7 |

---

## 11. Aprobación

| Rol | Nombre | Decisión | Fecha |
|---|---|---|---|
| Líder y cliente (STK-01) | Abdiel Avila Neri | Pendiente | — |

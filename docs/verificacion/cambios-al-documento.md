# Cambios al documento maestro derivados de la Fase 5

Bitácora de los cambios que el trabajo de verificación obliga a hacer en
`docs/ACS-U1-APP-AvilaNeriAbdiel.docx`. El responsable los aplica a mano. Cada entrada indica
la sección, el texto actual (tal como está en el .docx), el texto nuevo y su origen.

**Estado** de cada entrada:

- **Pendiente:** listo para aplicar.
- **Condicionado:** depende de una decisión que aún no se toma.
- **Aplicado:** el responsable ya lo pasó al .docx, con la fecha.

---

## 1. Incidencia #27 · usuario C para las pruebas de captura

**Estado:** pendiente. La corrección se verificó el 03/10/2026
(`2026-10-03-integracion-27.md`); la #27 se cierra con el pull request.

### 1.1 Sección 4.6, Registro y control de defectos

Texto actual:

> …y dos de tipo defecto: #3, con prioridad baja (commits directos de la Fase 0), y #27, con
> prioridad media, abierta (las pruebas de integración borran la captura del usuario de prueba
> con el que se hacen las verificaciones manuales). Ninguna corresponde a un defecto funcional
> del código entregado: #27 afecta al entorno de pruebas y se corregirá al inicio de la Fase 5.

Texto nuevo:

> …y dos de tipo defecto: #3, con prioridad baja (commits directos de la Fase 0), y #27, con
> prioridad media (las pruebas de integración borraban la captura del usuario de prueba con el
> que se hacen las verificaciones manuales), corregida al inicio de la Fase 5 con un usuario de
> prueba exclusivo para esas pruebas. Ninguna corresponde a un defecto funcional del código
> entregado.

**Nota.** En la Fase 5 se registraron además los defectos #30 (la prueba de CA-10 cuenta las
filas propias de B) y #31 (RES-08 sin requisito), y la solicitud de cambio SC-09 (#32). El
conteo de incidencias de este párrafo conviene redactarlo una sola vez, al cerrar los defectos
de la fase.

---

## 2. RES-08 · aviso de privacidad (SC-09, RF-15, CA-26)

**Estado:** pendiente. SC-09 (#32) fue autorizada por STK-01 el 03/10/2026; se aplica después de
fusionar su implementación.

### 2.1 Sección 1.5.1, Funcionalidad incluida

Texto actual (último elemento de la lista):

> Revelación de los créditos del proyecto mediante una secuencia oculta de Interacción (SC-02).

Texto nuevo (se agrega un elemento después de ese):

> Publicación del aviso de privacidad y obtención del consentimiento al registrarse (SC-09).

**De paso:** "Interacción" lleva mayúscula a mitad de frase; debería ser "interacción".

### 2.2 Sección 2.2, Requisitos funcionales

Texto actual: la tabla termina en RF-14.

Texto nuevo (fila agregada después de RF-14):

| ID | Requisito funcional | Verbo de acción | Prioridad | Origen |
|---|---|---|---|---|
| RF-15 | El sistema deberá dar a conocer el aviso de privacidad antes de recabar los datos del usuario, obtener su consentimiento al registrarse y mantener el aviso integral consultable sin sesión. | Dar a conocer, obtener | Alta | RES-08 (SC-09) |

### 2.3 Sección 2.7, Trazabilidad de los requisitos

Texto actual (nota bajo la matriz):

> RF-14 es de origen académico (STK-03, SC-02) y no deriva de ninguna necesidad NEC-01 a NEC-07.

Texto nuevo (nota agregada después de la de SC-08):

> SC-09 agrega RF-15, que deriva de la restricción legal RES-08 y no de una necesidad NEC-01 a
> NEC-07. Se implementa en C-01 (`src/app/privacidad`, registro) y C-06 (consentimiento en los
> metadatos del usuario) y se verifica con CA-26.

### 2.4 Sección 2.8, Registro de solicitudes de cambio

Texto actual: la tabla termina en SC-08.

Texto nuevo (fila agregada):

| ID | Fecha | Cambio solicitado | Requisitos afectados | Impacto evaluado | Decisión |
|---|---|---|---|---|---|
| SC-09 | 03/10/2026 | Aviso de privacidad (simplificado en el registro, con consentimiento; integral sin sesión) | Nuevo RF-15; 1.5.1; CA-26 | Sin migración ni cambio de interfaces; unas 5 h, absorbidas por el adelanto del cronograma. Corrige el defecto #31 (RES-08 sin requisito) | Autorizado por STK-01 el 03/10/2026, incidencia #32 |

### 2.5 Sección 2.10, Verificabilidad de los requisitos

Texto actual: la tabla termina en CA-13.

Texto nuevo: fila CA-26, después de las de CA-14 a CA-25 que agregará el plan de pruebas
(Bloque 2):

| ID | Requisito | Criterio de aceptación | Método de verificación |
|---|---|---|---|
| CA-26 | RF-15 | Sin sesión, el aviso integral se abre en un clic desde la portada y desde las pantallas de acceso, y muestra su versión y su fecha; con sesión, se abre desde la barra de navegación. El formulario de registro muestra el aviso simplificado, y si la casilla de consentimiento no está marcada no se crea la cuenta, aunque la petición se envíe sin la interfaz. | Prueba unitaria y funcional |

### 2.6 Sección 2.4, Revisión de los requisitos

Sin cambio de texto. **Observación para el informe:** la revisión interna detectó que RES-09 no
tenía requisito y agregó RF-11, pero no hizo la misma comprobación con RES-08. Conviene
mencionarlo en el informe de pruebas como lección aprendida, no corregir el acta histórica.

### 2.7 Sección 3.9.1, Trazabilidad entre requisitos y diseño

Se agrega RF-15 asignado a C-01 y C-06. El texto exacto depende de la tabla de 3.9.1, que se
revisará al implementar.

### 2.8 Anexo A.4, Factibilidad legal

Texto actual:

> Las obligaciones aplicables se cumplen mediante un aviso de privacidad accesible desde la
> aplicación, la limitación de los datos recabados a los estrictamente necesarios para generar
> el plan, y la restricción de lo que se transmite al proveedor de inteligencia artificial
> (RES-10).

Texto nuevo:

> Las obligaciones aplicables se cumplen mediante un aviso de privacidad accesible desde la
> aplicación (RF-15, incorporado por SC-09 tras detectarse en la verificación que RES-08 no
> tenía requisito), la limitación de los datos recabados a los estrictamente necesarios para
> generar el plan, y la restricción de lo que se transmite al proveedor de inteligencia
> artificial (RES-10).

### 2.9 Historial de versiones

Una fila nueva con la versión siguiente a la vigente, la fecha de aplicación y el resumen
"SC-09: RF-15 y CA-26 (aviso de privacidad); corrección de la #27". La agregas tú, con el número
de versión que corresponda.

---

## 3. Observaciones sobre el .docx sin commitear (03/10/2026, 16:37)

No las causa el trabajo de verificación: las encontré al comparar tu .docx modificado con el de
`dev`. Las anoto para que no se pierdan.

| Hallazgo | Detalle |
|---|---|
| Cambios detectados | Cronograma (S6-S9 → S8-S11; S10 → S11, S12; S11-S2 → S12), fecha objetivo interna (viernes 6 de noviembre, holgura S14), importe en letra del contrato corregido a "setenta y nueve mil … 20/100", y la contingencia de riesgos con S13 y S14 |
| Índice | Al actualizarse, el índice ya no lista **4.1** ni **5.1**, aunque sus títulos siguen en el cuerpo. El índice de `dev` sí los listaba, pero ya en esa versión los dos párrafos carecían de estilo de título; por eso desaparecen al actualizarlo. Hay que aplicarles el estilo **Título 2**, como a 4.2, y volver a actualizar el índice |

---

## 4. Plan de pruebas: criterios CA-14 a CA-25 y redacción de CA-10

**Estado:** pendiente. El plan se aprobó el 03/10/2026.

### 4.1 Sección 2.10, Verificabilidad de los requisitos: tabla

Texto actual: la tabla termina en CA-13.

Texto nuevo: se agregan las filas CA-14 a CA-25, con el criterio, el requisito y el método tal
como aparecen en `docs/plan-de-pruebas.md`, sección 6.2, seguidas de CA-26 (sección 2.5 de esta
bitácora).

### 4.2 Sección 2.10: párrafo final

Texto actual:

> Requisitos sin criterio individual. RF-04, RF-05, RF-06, RF-10, RF-12, RF-13, RNF-02, RNF-05,
> RNF-06, RNF-07, RNF-08 y RNF-09 se verifican mediante los indicadores ya declarados en su propio
> enunciado o mediante los casos de prueba que se definirán en el plan de pruebas de la semana 10.
> Su criterio de aceptación se incorporará en esa etapa, conforme al punto 6.2 de la lista de
> verificación.

Texto nuevo:

> Criterios incorporados en el plan de pruebas. Conforme a lo previsto, el plan de pruebas
> (docs/plan-de-pruebas.md, versión 1.0 del 03/10/2026) incorporó un criterio individual para
> cada requisito que no lo tenía: CA-14 (RF-04), CA-15 (RF-05), CA-16 (RF-06), CA-17 (RF-10),
> CA-18 (RF-12), CA-19 (RF-13), CA-20 (RNF-02), CA-21 (RNF-05), CA-22 (RNF-06), CA-23 (RNF-07),
> CA-24 (RNF-08) y CA-25 (RNF-09). El plan se redactó en la semana 11, no en la 10, y declara las
> mediciones que lo precedieron.

### 4.3 Redacción del resultado de CA-10

Sin cambio en el documento maestro: el cliente decidió conservar "error de autorización" (03/10/2026).
El informe de pruebas explica cómo se manifiesta: 0 filas, 404 o `42501`, sin revelar la
existencia del recurso (AM-01).

---

## 5. Apellido del autor

**Estado:** pendiente.

**En todo el documento**, incluidos la portada y el historial de versiones: "Ávila" →
"**Avila**", sin acento (indicación del responsable, 03/10/2026). En el repositorio se corrigió
en `src/lib/huevo/creditos.ts`, `src/lib/privacidad/aviso.ts` y `docs/Ahorrito-PLAN.md`.

---

## 6. SC-10 (#33): pruebas de interfaz con Playwright

**Estado:** pendiente, para después de fusionar.

### 6.1 Sección 3.5, Tecnologías utilizadas

Texto nuevo (fila agregada, con el formato de la tabla):

> Playwright Test 1.63 · Pruebas de interfaz de extremo a extremo contra la compilación de
> producción (regresión de CA-07, capas de CSS, render sin JavaScript y prueba de humo) ·
> Licencia Apache 2.0 · Incorporado por SC-10.

### 6.2 Sección 2.8, Registro de solicitudes de cambio

| ID | Fecha | Cambio solicitado | Requisitos afectados | Impacto evaluado | Decisión |
|---|---|---|---|---|---|
| SC-10 | 04/10/2026 | Pruebas de interfaz automatizadas con Playwright | Tecnologías (3.5); ningún requisito cambia | $0; unas 6 h, absorbidas por el adelanto del cronograma. Protege tres defectos de interfaz que solo tenían prueba manual. Descubrió el defecto #34 | Autorizado por STK-01 el 04/10/2026, incidencia #33 |

### 6.3 Sección 2.7, matriz de trazabilidad

En la columna de caso de prueba de la fila con RF-11, agregar: "E2E-01 (Playwright)".

### 6.4 Sección 4.6, Registro de defectos

Sumar el defecto **#34** (severidad menor, prioridad media): al borrar el último plan no se
anunciaba la confirmación y se perdía el foco. Lo detectó la prueba de humo automatizada y se
corrigió en la Fase 5.

---

## 7. Fase 6: despliegue y liberación

**Estado:** pendiente, para aplicar en `docs/cierre-fase-6`.

| Sección | Cambio |
|---|---|
| **1.6.1, RES-16** | Agregar al final: "Resuelta en la Fase 6 (04/10/2026) con un SMTP propio sobre una cuenta de Gmail dedicada (`ahorrito.app.uaeh@gmail.com`), sin dominio propio; el registro de un correo ajeno al proyecto se confirmó en producción (CA-01)." |
| **2.8** | Fila SC-10, si aún no se aplicó (sección 6.2 de esta bitácora) |
| **4.6** | Sumar el defecto **#37** (cosmético, prioridad baja): con un solo plan, el enlace decía "Ver mis plan guardado". Se detectó al revisar el juego final de capturas y se corrigió antes de `v1.0.0` |
| **4.8, Identificación de las versiones liberadas** | Agregar `v1.0.0-rc.1` (`dev`, `888c06c`, versión candidata; desviación de GITFLOW declarada) y **`v1.0.0`** (`main`, `b072b45`, 04/10/2026, versión liberada y desplegada en https://ahorrito-nine.vercel.app) |
| **Nueva sección 8 (o la que corresponda a los puntos 8.1 a 8.7)** | Resumir `docs/liberacion.md`: procedimiento, versión, lista de liberación, instalación y despliegue (unos 4 min en Vercel, 151 s en local), configuración (variables, Supabase, SMTP, Vercel), reversión (3 opciones; el esquema no cambia desde `v0.9.0`) y el acta firmada |
| **Resultados de verificación (sección 6)** | CA-08: 20 de 20 en producción, mediana de 360 ms. CA-21: cumplido completo. CA-25: unos 4 min, con 37 s de compilación. CA-01: repetido en producción con el SMTP propio. Con eso, **24 de 26 criterios cumplidos**, CA-23 en parte y CA-20 en la Fase 7 |
| **Riesgos (1.8.7), RSG-01** | Agregar como evidencia: en producción, una ráfaga de 20 solicitudes en menos de un minuto recibió HTTP 429 de Gemini en las 6 últimas; el plan se entregó en todas (RNF-03) |
| **Historial de versiones** | Nueva fila con la versión siguiente: "Fase 6: despliegue en Vercel, SMTP propio, verificación en producción, defecto #37 y liberación de v1.0.0" |

---

## 8. Versión v1.1.0: botón "Mostrar contraseña"

**Estado:** pendiente, para aplicar en `docs/version-1.1.0`.

| Sección | Cambio |
|---|---|
| **4.8, Identificación de las versiones liberadas** | Agregar **`v1.1.0`** (`main`, `4d14004`, 05/10/2026): botón para mostrar u ocultar la contraseña en el registro y el inicio de sesión (#41). Versión MENOR según el versionado semántico, porque agrega una funcionalidad compatible; sin cambios en la base de datos ni en la configuración |
| **Sección 8 (liberación), identificación de la versión** | Misma fila que en 4.8, y la nota: "Se liberó después del acta de `v1.0.0`, con las suites en verde sobre `dev` y la verificación posterior en producción (`docs/verificacion/2026-10-05-liberacion-v1.1.0.md`)" |
| **Historial de versiones** | Nueva fila: "Versión v1.1.0 del sistema: botón Mostrar contraseña en el registro y el inicio de sesión" |

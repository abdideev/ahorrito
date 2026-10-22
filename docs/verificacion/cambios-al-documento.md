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

---

## 9. Comparación integral del .docx con el repositorio al cierre de la Fase 6

**Estado:** pendiente. Preparada el 05/10/2026 en una sesión de consulta, sin cambios al código.

**Qué se comparó.**

- **El .docx:** `docs/ACS-U1-APP-AvilaNeriAbdiel.docx`, blob `16e5292`, el mismo en `main` y en
  `origin/dev`. Su último commit es `8495cac` (04/10/2026). La extracción del texto, con los
  estilos de párrafo, está en el espacio de trabajo de Claude y no se versiona.
- **El repositorio:** `origin/dev` en `6389d3e` y `origin/main` en `4d14004` (`v1.1.0`).

**Aviso sobre el historial.** La última fila del historial del .docx **no es la 3.9**: hay una
fila **4.0**, del 04/10/2026, con el texto "SC-09: RF-15 y CA-26 (aviso de privacidad);
corrección de la #27". Por eso varias entradas de las secciones 2, 4 y 6 de esta bitácora ya están
aplicadas; la tabla 9.1 dice cuáles.

**Formato de cada cambio:** sección del .docx, texto actual (tal como está en el .docx; "…"
indica que se omite una parte que no cambia), texto nuevo y evidencia.

**Fuera de esta sección:**

- **Las secciones 6 (Verificación) y 8 (Liberación) no se redactan aquí.** Se escriben en el chat
  principal; 9.5 solo dice qué archivos y qué evidencia las respaldan.
- **La sección 7 (Validación) y los puntos 9 a 12 de la lista** son de la Fase 7 y no se tocan.

### 9.1 Estado de las entradas 1 a 8 de esta bitácora, comprobado en el .docx

| Entrada | Estado en el .docx | Comprobación |
|---|---|---|
| 1 · #27 en 4.6 | **Aplicada** | 4.6 dice "corregida al inicio de la Fase 5 con un usuario de prueba exclusivo" |
| 2.1 · 1.5.1 | **Aplicada** | Último punto: "Publicación del aviso de privacidad y obtención del consentimiento al registrarse (SC-09)" |
| 2.2 · RF-15 en 2.2 | **Aplicada** | La fila RF-15 existe |
| 2.3 · nota de SC-09 en 2.7 | **Aplicada** | La nota está bajo la matriz |
| 2.4 · SC-09 en 2.8 | **Aplicada** | La fila SC-09 existe |
| 2.5 · CA-26 en 2.10 | **Aplicada** | La fila CA-26 existe |
| 2.6 · observación sobre 2.4 | **Mal aplicada** | La nota dirigida al responsable se copió dentro del .docx; ver 9.3.6 |
| 2.7 · RF-15 en 3.9.1 | **Aplicada** | La fila "RF-15 \| C-01, C-06" existe |
| 2.8 · Anexo A.4 | **Aplicada** | El texto nuevo está en A.4 |
| 2.9 · historial | **Aplicada** | Es la fila 4.0 |
| 3 · índice sin 4.1 ni 5.1 | **En parte** | 4.1 y 5.1 ya tienen el estilo Título 2, pero el índice no se actualizó; ver 9.2.2 |
| 4.1 · CA-14 a CA-25 en la tabla de 2.10 | **Pendiente** | La tabla pasa de CA-13 a CA-26; ver 9.3.10 |
| 4.2 · párrafo final de 2.10 | **Aplicada** | Dice "El plan se redactó en la semana 11, no en la 10" |
| 4.3 · CA-10 | Sin cambio | Decisión del 03/10/2026 |
| 5 · apellido | **Aplicada** | 0 apariciones de "Ávila" en el texto |
| 6.1 · Playwright en 3.5 | **Mal aplicada** | La fila quedó desplazada de columna; ver 9.4.2 |
| 6.2 · SC-10 en 2.8 | **Aplicada** | La fila SC-10 existe |
| 6.3 · E2E-01 en 2.7 | **Aplicada** | Fila NEC-07: "…E2E-01 (Playwright)" |
| 6.4 · #34 en 4.6 | **Aplicada** | Párrafo "Defecto #34 (severidad menor, prioridad media)…" |
| 7 · Fase 6 | **Pendiente** | Se integra y amplía en esta sección |
| 8 · v1.1.0 | **Pendiente** | Se integra en 9.6.3 y 9.7.4 |

### 9.2 Historial de versiones e índice

#### 9.2.1 Historial de versiones: fila nueva

- **Texto actual:** la última fila es "4.0 | 04/10/2026 | SC-09: RF-15 y CA-26 (aviso de
  privacidad); corrección de la #27 | Abdiel Avila Neri".
- **Texto nuevo** (fila agregada):

  > 4.1 | 05/10/2026 | Cierre de las Fases 5 y 6: criterios CA-14 a CA-25 en 2.10 y matriz 2.7
  > con los casos de prueba; SC-10 y defectos #30, #31, #34 y #37; tecnologías actualizadas en 3.5;
  > RES-16 resuelta con SMTP propio; despliegue en https://ahorrito-nine.vercel.app; versiones
  > v1.0.0-rc.1, v1.0.0 y v1.1.0 en 4.3, 4.8 y 5.4; corrección de cronograma, costo, riesgos,
  > cobertura de requisitos y cifras de pruebas. | Abdiel Avila Neri

- **Fecha:** 05/10/2026 es la del cierre de la Fase 6 (acta firmada ese día). [SUPUESTO] Si
  aplicas los cambios otro día, usa la fecha en que los apliques, como en las filas anteriores. Si
  en la misma edición integras las secciones 6 y 8 que se redactan en el chat principal,
  agrégalas a esta fila.
- **Evidencia:** las entradas 9.3 a 9.7 de esta sección; `git log -1 --format=%ci origin/dev --
  docs/ACS-U1-APP-AvilaNeriAbdiel.docx` da 2026-10-04 17:26:32 −0600 (última edición versionada).

#### 9.2.2 Índice (corrección 1 del 03/10)

- **Texto actual:** el índice lista 4.7 (la corrección 1 **ya está aplicada**), pero no lista
  **4.1**, **4.9** ni **5.1**.
  - 4.1 y 5.1 tienen el estilo Título 2 en el cuerpo: solo falta actualizar el índice.
  - **"4.9 Documentación técnica para el mantenimiento" tiene el estilo Normal**, no Título 2.
- **Texto nuevo:** aplicar el estilo Título 2 al párrafo de 4.9 y después actualizar toda la tabla
  del índice (Ctrl+E, F9, "Actualizar toda la tabla").
- **Evidencia:** en `word/document.xml`, los párrafos de 4.1 y 5.1 llevan
  `<w:pStyle w:val="Ttulo2"/>`; el de 4.9 no lleva estilo; las entradas del índice (estilos TDC)
  saltan de 4 a 4.1.1 y de 5 a 5.2.

### 9.3 Sección 1 y sección 2

#### 9.3.1 1.6.1, RES-16 (resuelta) y la URL de producción

- **Texto actual** (justificación): "Limitación del plan gratuito; sin SMTP propio ningún usuario
  real podría confirmar su cuenta"
- **Texto nuevo:**

  > Limitación del plan gratuito; sin SMTP propio ningún usuario real podría confirmar su cuenta.
  > Resuelta el 04/10/2026 con un SMTP propio sobre una cuenta de Gmail dedicada
  > (ahorrito.app.uaeh@gmail.com, smtp.gmail.com:587) y una plantilla de confirmación en español,
  > sin dominio propio (RES-06). En producción (https://ahorrito-nine.vercel.app) un correo ajeno
  > al proyecto recibió la confirmación y llegó al panel (CA-01).

  Además, al enunciado de RES-16 le falta el punto final ("…no permite editar las plantillas").
- **Evidencia:** `docs/verificacion/2026-10-04-produccion.md` (sección CA-01 y tabla de
  configuración), `docs/verificacion/produccion/2026-10-04-ca01-correo-confirmacion.png` y
  `docs/liberacion.md` 8.5 (Correo, SMTP propio).

#### 9.3.2 1.6.3, RES-11 (errata nueva)

- **Texto actual:** "El proyecto dispone de 14 0semanas, del 10 de agosto…"
- **Texto nuevo:** "El proyecto dispone de 14 semanas, del 10 de agosto…"
- **Evidencia:** el texto del .docx.

#### 9.3.3 1.8.2 y 1.8.3, cronograma (correcciones 2 y 3 del 03/10)

- **Corrección 2, ya aplicada.** El párrafo bajo la tabla de 1.8.3 dice: "Fecha objetivo-interna:
  viernes 6 de noviembre (cierre de S13). La S14 se reserva como holgura; fecha límite 13 de
  noviembre". **Solo falta el punto final.**
- **Corrección 3, ya aplicada.** La columna Semanas de 1.8.2 dice "S8 – S11", "S11, S12" y "S12";
  ya no aparece "S11-S2". Es coherente con 1.8.3: codificación en S8 a S10 y documentación del
  código en S11, que en 1.8.2 es actividad de Programación.
- **Observación sin cambio obligatorio:**
  - 1.8.2 declara seis fases y ninguna cubre la S13 (validación) ni la S14. El PLAN usa otra
    división, en ocho fases (0 a 7).
  - Si quieres que coincidan, agrega una fila: "7 | Validación y cierre | Validación con usuarios;
    documentación de operación, mantenimiento y retiro; evaluación final | Tester y Líder del
    proyecto | S13, S14".
- **Evidencia:** el texto del .docx y `docs/Ahorrito-PLAN.md`, sección 3.

#### 9.3.4 1.8.5, costo (corrección 6 del 03/10)

**Pendiente.**

- **Texto actual:** "La cifra de 68,320.80 pesos representa el valor de mercado del esfuerzo
  invertido y es la que se emplea en el contrato de desarrollo de la sección 1.8.6."
- **Texto nuevo:**

  > La cifra de 68,320.00 pesos (79,251.20 con IVA) representa el valor de mercado del esfuerzo
  > invertido; el total con IVA es el que se emplea en el contrato de desarrollo de la sección
  > 1.8.6.

- **Evidencia:** la tabla de 1.8.5, con subtotal de 68,320.00, IVA de 10,931.20 y total de
  79,251.20, y la cláusula 6 de 1.8.6, con $79,251.20. 68,320.80 no coincide con ninguna cifra
  del documento.

#### 9.3.5 1.8.6, cláusula 6 (corrección 5 del 03/10)

**Ya aplicada.** El texto dice "$79,251.20 (setenta y nueve mil doscientos cincuenta y un pesos
20/100 M.N.)", y el anticipo de $39,625.60 es exactamente el 50 %.

#### 9.3.6 1.8.7, matriz de riesgos (corrección 4 del 03/10, y dos más)

- **RSG-04, ya aplicada:** "Reservar las semanas S13 y S14."
- **RSG-07, pendiente.**
  - Texto actual (contingencia): "Absorber el trabajo adicional en la S12 de holgura."
  - Texto nuevo: "Absorber el trabajo adicional en la S14 de holgura."
- **RSG-06 (nueva, misma causa).**
  - Texto actual: "Regenerar todas las imágenes durante la S12 antes de la integración final."
  - Texto nuevo: "Regenerar todas las imágenes durante la S14 antes de la integración final."
  - La integración final del documento está en la S14 (1.8.3).
- **RSG-01, evidencia nueva** (viene de la entrada 7):
  - Agregar a la acción de mitigación: "Materializado de forma parcial el 04/10/2026: en
    producción, una ráfaga de 20 solicitudes en menos de un minuto recibió HTTP 429 de Gemini en
    las 6 últimas; el plan se entregó en las 20 (RNF-03)."
  - Evidencia: `docs/verificacion/2026-10-04-produccion.md` (sección CA-08, registros `[ia]`) y
    `docs/verificacion/produccion/2026-10-04-ca08-registros-ia-vercel.png`.
- **RSG-03, pendiente** (respuesta del responsable del 05/10/2026: el docente no revisó).
  - Texto actual (acción de mitigación): "Someter los requisitos a revisión con STK-04 antes de su
    aprobación. Redactar los criterios de aceptación antes de iniciar la construcción."
  - Texto nuevo: agregar al final "Materializado: la revisión con STK-04 no se realizó y la
    contingencia (revisión del docente) tampoco se ejecutó. Se compensa en parte con los criterios
    de aceptación redactados antes de construir y con la validación de la Fase 7 (sección 2.4)."
  - Evidencia: sección 2.4 ya corregida en el .docx ("Revisión externa no realizada") e indicación
    del responsable del 05/10/2026.

#### 9.3.7 2.2 y 1.5.1, RF-15

**Ya aplicadas.** Las incorporó la versión 4.0.

#### 9.3.8 2.4, revisión externa (corrección 8 del 03/10)

**Pendiente.**

- **Texto actual:**

  > Revisión externa programada
  >
  > La revisión con los tres usuarios representativos (STK-04) está programada para la semana del
  > 17 al 23 de agosto de 2026. Se realizará mediante una sesión de lectura guiada…

- **Texto nuevo:**

  > Revisión externa no realizada
  >
  > La revisión con los tres usuarios representativos (STK-04) se programó para la semana del 17
  > al 23 de agosto de 2026, mediante una sesión de lectura guiada de los requisitos, y no se
  > ejecutó. La línea base se aprobó solo con la revisión interna. Esta desviación materializa el
  > riesgo RSG-03 (sesgo de aprobación por la coincidencia de los roles de cliente y
  > desarrollador). Los tres usuarios participarán en la validación de la Fase 7 (CA-20 y OBJ-05),
  > que es la primera contrastación del sistema con usuarios externos.

  Confirmado por el responsable el 05/10/2026: el docente tampoco revisó los requisitos, así que la
  contingencia de RSG-03 no se ejecutó (ver 9.3.6).
- **Eliminar también el párrafo** "Observación para el informe: la revisión interna detectó que
  RES-09 no tenía requisito…". Era una indicación de esta bitácora (entrada 2.6), no texto del
  documento, y la lección ya está en `docs/informe-de-pruebas.md`, sección 9, lección 1.
- **Evidencia:** ningún acta de la revisión externa en `docs/` ni en las incidencias (API pública
  de GitHub, 16 incidencias, ninguna de revisión de requisitos), y tu indicación del 05/10/2026 de
  que nunca se ejecutó.

#### 9.3.9 2.7, matriz de trazabilidad

**Pendiente.**

- **Párrafo inicial.**
  - Texto actual: "Las columnas de diseño, implementación y prueba se completarán conforme avancen
    las etapas correspondientes…"
  - Texto nuevo: "Las columnas de diseño, implementación y prueba se completaron conforme avanzaron
    las etapas; al cierre de la Fase 6 cada requisito puede rastrearse desde su origen hasta el
    criterio que lo verifica, salvo RNF-02 (CA-20), que se verifica en la Fase 7."
- **Columna "Caso de prueba", texto nuevo por fila:**

| Fila | Caso de prueba (texto nuevo) |
|---|---|
| NEC-01 | distribucion.test.ts, plan.test.ts (CA-04); CA-08 en producción, 20 de 20; CA-22 |
| NEC-02 | vencimientos.test.ts (CA-03), distribucion.test.ts (CA-04), validacion.test.ts, captura.integracion.test.ts; CA-22 |
| NEC-03 | evaluacion.test.ts (CA-06), plan.test.ts, validacion.test.ts; CA-16 |
| NEC-04 | evaluacion.test.ts (CA-05), plan.test.ts |
| NEC-05 | carga.test.ts, gemini.test.ts, orquestador.test.ts, degradacion.test.ts; CA-09 (5 de 5 en la interfaz), CA-17 (5 de 5) |
| NEC-06 | CA-01 (también en producción), CA-02, CA-14, CA-15, CA-18, CA-19; aislamiento.integracion.test.ts (CA-10, 13 de 13); CA-25 (RNF-09); CA-20 (RNF-02) en la Fase 7 |
| NEC-07 | CA-17 (RF-10); CA-07 y E2E-01 (RF-11); CA-12 (RNF-11) |

- **Nota nueva bajo la matriz:**

  > Requisitos que no figuran en ninguna fila de necesidad: RF-14 (CA-13), RF-15 (CA-26), RNF-04
  > (CA-10), RNF-05 (CA-21), RNF-07 (CA-23, cumplido en parte), RNF-08 (CA-24) y RNF-10 (CA-11).

- **Evidencia:** `docs/informe-de-pruebas.md`, sección 2 (resultado y evidencia por criterio);
  `docs/plan-de-pruebas.md`, sección 6 (matriz CA, CP y requisito); `docs/liberacion.md` 8.2
  (24 de 26 criterios).

#### 9.3.10 2.8, SC-09 y SC-10

**Ya aplicadas** en el registro (filas SC-09 y SC-10).

**Desviación por declarar** (ver también 9.6.6): el botón "Mostrar contraseña" (#41, `v1.1.0`) entró sin
solicitud de cambio, por decisión del responsable del 05/10/2026. No modifica ningún requisito:
es parte de RF-01 en la interfaz. Si quieres dejar constancia en 2.8, agrega bajo el registro:

> Cambios sin solicitud. El botón para mostrar la contraseña en el registro y el inicio de sesión
> (pull request #41, versión v1.1.0) se implementó sin solicitud de cambio por decisión del
> cliente del 05/10/2026, al no afectar a ningún requisito ni a la línea base.

**Evidencia:** pull request #41; ninguna de las 16 incidencias de la API pública corresponde a
este cambio; `docs/verificacion/2026-10-05-liberacion-v1.1.0.md`.

#### 9.3.11 2.10, verificabilidad (corrección 7 del 03/10)

- **"Plan de pruebas de la semana 10": ya aplicada** (el párrafo dice "El plan se redactó en la
  semana 11, no en la 10").
- **Tabla: pendiente** (entrada 4.1). Agregar entre CA-13 y CA-26 las filas CA-14 a CA-25. Las
  columnas del .docx son ID, Requisito, Criterio de aceptación y Método de verificación:

| ID | Requisito | Criterio de aceptación | Método de verificación |
|---|---|---|---|
| CA-14 | RF-04 | Al cambiar un compromiso de 600 a 900 y eliminar otro, el plan regenerado aparta según 900 y no incluye el eliminado; un plan guardado antes del cambio sigue mostrando 600. | Prueba de integración y funcional |
| CA-15 | RF-05 | Un ingreso extraordinario de 1,000 en la semana 3 eleva el disponible de esa semana a presupuesto + 1,000 y no el de ninguna otra. | Prueba unitaria y funcional |
| CA-16 | RF-06 | Una meta con fecha de hoy o anterior se rechaza con un mensaje en el campo; una meta válida aparece evaluada en el plan siguiente. | Prueba unitaria, de integración y funcional |
| CA-17 | RF-10 | Con el servicio disponible, 5 de 5 planes reciben una explicación no nula que menciona al menos una advertencia del plan y cuyas cifras coinciden al centavo con las del motor. | Prueba funcional e inspección |
| CA-18 | RF-12 | Tras generar 3 planes, GET /api/planes los lista en orden descendente; el detalle es idéntico al generado; DELETE responde 204, el plan desaparece y un segundo DELETE responde 404. | Prueba de sistema sobre HTTP |
| CA-19 | RF-13 | Al modificar un dato y pulsar "Recalcular con mis datos", el plan se actualiza sin pedir explicación en 2 s o menos, 5 de 5 veces. | Prueba funcional con medición |
| CA-20 | RNF-02 | 3 de 3 usuarios sin experiencia previa pasan del registro al primer plan en 8 min o menos, con los perfiles P1 a P3. | Medición con usuarios |
| CA-21 | RNF-05 | (a) El 100 % de las contraseñas almacenadas tiene formato bcrypt. (b) En producción, una petición http:// se redirige con 308 o 301 a https://, la respuesta lleva HSTS y el HAR de un recorrido completo tiene 0 peticiones http://. | (a) Consulta SQL; (b) inspección en el despliegue |
| CA-22 | RNF-06 | pnpm test ejecuta los casos de src/core con 100 % de resultado satisfactorio y 15 casos o más. | Prueba unitaria |
| CA-23 | RNF-07 | Un guion de humo (registro, captura, plan, historial, borrado, créditos, tema, aviso) da 0 defectos bloqueantes en las dos versiones más recientes de Chrome, Edge y Firefox. | Prueba funcional por navegador |
| CA-24 | RNF-08 | 0 importaciones de next, react o @/ en src/core y cobertura del motor de 80 % o más. | Inspección automatizada |
| CA-25 | RNF-09 | Partiendo del repositorio y de .env.example, un despliegue nuevo en Vercel queda sirviendo / con HTTP 200 en 15 min o menos, cronometrado. | Medición en el despliegue |

  **Nota sobre CA-23 frente a RNF-07:** RNF-07 (2.3) nombra "Chrome, Firefox, Edge y Safari", y
  CA-23 deja fuera a Safari porque no había un equipo Apple disponible. Es el motivo por el que
  CA-23 queda en parte. No cambies RNF-07 sin una solicitud de cambio.

- **"Once intentos": pendiente.** El dato del 17/09 es históricamente correcto (11 intentos), pero
  el vigente es 13.
  - Texto actual: "…once intentos de acceso cruzado entre dos usuarios devolvieron cero filas. La
    verificación es reproducible y forma parte del repositorio."
  - Texto nuevo: "…once intentos de acceso cruzado entre dos usuarios devolvieron cero filas. Con
    SC-07 la prueba se amplió a trece intentos, incluidos dos de borrar el plan ajeno, y en la
    Fase 5 (03/10/2026) dio 13 de 13 denegados, con cero filas ajenas alcanzadas. La verificación
    es reproducible y forma parte del repositorio."
  - Evidencia: `docs/verificacion/2026-10-03-ca10.md` ("13 de 13 intentos denegados, 0 filas
    ajenas alcanzadas") y la fila 3.9 del historial ("Actualización de CA-10 a trece intentos").
- **Evidencia de la tabla:** `docs/plan-de-pruebas.md`, sección 6.2, columnas Requisito, Criterio
  y Método. La fila CA-20 viene de la línea correspondiente de la misma sección; CA-21 a CA-25,
  ídem.

### 9.4 Sección 3

#### 9.4.1 3.2.1, catálogo de componentes: RF-15

- **Texto actual:** C-01, "RF-02, RF-03, RF-04, RF-05, RF-06, RF-11, RF-12, RF-14"; C-06, "RF-01".
- **Texto nuevo:** C-01, "RF-02, RF-03, RF-04, RF-05, RF-06, RF-11, RF-12, RF-14, RF-15"; C-06,
  "RF-01, RF-15".
- **Evidencia:** 3.9.1 del propio .docx ("RF-15 | C-01, C-06"); `src/app/privacidad/`,
  `src/components/privacidad/` (C-01) y `src/app/(auth)/acciones.ts`, que guarda la constancia en
  los metadatos del usuario (C-06).

#### 9.4.2 3.5, tecnologías utilizadas

- **Versiones de referencia, texto nuevo:**

| Fila | Texto actual | Texto nuevo |
|---|---|---|
| Interfaz: Next.js con React | 15 | 16 (16.3.4), con React 19 (19.2.8) |
| Estilos: Tailwind CSS | 4 | 4 (4.3.3) |
| Lenguaje: TypeScript | 5 | 5 (5.9.3) |
| Pruebas: Vitest | — | 5 (5.0.0) |
| Migraciones | Tecnología: "Migraciones" | Tecnología: "Supabase CLI", versión 2.117 (sin cambio) |

- **Fila de Playwright: mal aplicada.** Está así: Capa "Playwright Test 1.63"; Tecnología "Pruebas
  de interfaz de extremo a extremo…"; Versión "Licencia Apache 2.0"; Justificación "Incorporado
  por SC-10.". Texto nuevo, por columna:
  - **Capa:** Pruebas de interfaz
  - **Tecnología:** Playwright Test
  - **Versión de referencia:** 1.63
  - **Justificación:** Pruebas de extremo a extremo contra la compilación de producción
    (regresión de CA-07, capas de CSS, render sin JavaScript y prueba de humo); también contra la
    URL publicada; licencia Apache 2.0. Incorporada por SC-10.
- **Fila de Despliegue.** Texto nuevo de la justificación: "Restricción RES-06. Plan Hobby, Node.js
  24.x, funciones en la región iad1, rama de producción main; https://ahorrito-nine.vercel.app".
- **Fila nueva:**

  > Correo transaccional | SMTP de Gmail (cuenta dedicada) | — | Confirmación de cuentas desde el
  > despliegue (RES-16), sin dominio propio (RES-06)

- **Herramientas de verificación** (axe-core 4.10.2 y Lighthouse): no son dependencias del
  proyecto. Su lugar es la sección 6, no 3.5.
- **Evidencia:** versiones instaladas, leídas hoy de `node_modules/*/package.json` (next 16.3.4,
  react 19.2.8, tailwindcss 4.3.3, typescript 5.9.3, vitest 5.0.0, @playwright/test 1.63.0,
  supabase 2.117.0, motion 13.4.6, react-icons 5.7.0, @supabase/ssr 0.12.7). Vercel:
  `docs/liberacion.md` 8.5 (Vercel: Hobby, iad1, Node.js 24.x); `curl -sI` de hoy devolvió
  `X-Vercel-Id: sfo1::iad1::…`.

#### 9.4.3 3.6.1, nota de verificación

- **Texto actual:** "AM-01: Verificado el 17/09/2026: once intentos de acceso cruzado devolvieron
  cero filas (CA-10)." y "AM-02: Verificado el 17/09/2026: las contraseñas de auth.users están
  derivadas con bcrypt, factor de costo 10."
- **Texto nuevo:**
  - "AM-01: Verificado el 17/09/2026 con once intentos y de nuevo el 03/10/2026 con trece: 13 de
    13 denegados, cero filas ajenas (CA-10)."
  - "AM-02: Verificado el 17/09/2026 y el 04/10/2026: 6 de 6 contraseñas con formato bcrypt
    $2a$10$ (CA-21 a)."
  - Punto nuevo: "AM-03: Verificado el 04/10/2026 en producción: http:// redirige con 308 a
    https:// en todas las rutas probadas, la respuesta lleva HSTS de dos años con preload y un
    recorrido completo tiene 0 peticiones http:// (CA-21 b)."
- **Evidencia:** `docs/verificacion/2026-10-03-ca10.md`, `docs/verificacion/2026-10-04-ca21a.md` y
  `docs/verificacion/2026-10-04-produccion.md` (CA-21 b). `curl -sI` de hoy: 308 y
  `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.

#### 9.4.4 3.7.3, escalabilidad (inconsistencia nueva)

- **Texto actual:** "El costo de cálculo es lineal respecto al número de semanas del horizonte,
  acotado a 26."
- **Texto nuevo:** "…acotado a 28."
- **Evidencia:** 3.7.1 del propio .docx dice "un máximo de 28 semanas", y lo corrigió la versión
  3.2 ("corrección del máximo de semanas en 3.7.1"); `src/core/calendario.ts`, líneas 13 y 142
  (`HORIZONTE_MAXIMO_MESES = 6`). **No verificado con una prueba:** ninguna prueba de `src/core`
  comprueba el máximo de 28. La cifra sale de la cuenta de 3.7.1 (184 días más hasta 6 de la
  primera semana).

#### 9.4.5 3.9.3, cobertura (corrección 9 del 03/10)

**Pendiente.**

- **Texto actual:** "Los trece requisitos funcionales y los once no funcionales cuentan con al
  menos un componente…"
- **Texto nuevo:** "Los quince requisitos funcionales y los once no funcionales cuentan con al
  menos un componente…"
- **Evidencia:** 2.2 y 3.9.1 del propio .docx (RF-01 a RF-15).

### 9.5 Secciones 6 y 8: qué las respalda (no se redactan aquí)

| Sección del .docx | Archivos | Evidencia |
|---|---|---|
| **6.1 Plan de pruebas** | `docs/plan-de-pruebas.md` (v1.0, aprobado el 03/10/2026) | Su sección de aprobación |
| **6.2 y 6.3 Casos y trazabilidad** | `docs/plan-de-pruebas.md`, secciones 6 y 7 | CP-01 a CP-26, perfiles P1 a P3, `docs/verificacion/scripts/perfiles.sim.ts` |
| **6.4 Unitarias** | `docs/verificacion/regresion/2026-10-04-unitarias.json` | Hoy: `pnpm test`, 29 archivos y 356 de 356; `src/core`, 94 de 94; `pnpm test:cov`, 99.19 % en líneas, 98.63 % en ramas y 100 % en funciones |
| **6.5 Integración** | `docs/verificacion/regresion/2026-10-04-integracion.json` y `.log` | 22 casos: 20 pasadas y 2 omitidas (9 + 1 en aislamiento, 11 + 1 en captura); repetido el 05/10 en `2026-10-05-liberacion-v1.1.0.md` |
| **6.6 Funcionales** | `docs/verificacion/2026-10-04-funcionales.md`, `2026-10-04-ca01-ca26.md`, `2026-10-04-ca09-ca11-ca17.md`, `2026-10-04-ca13.md`, `2026-10-04-ca23-guion.md`; E2E en `2026-10-04-sc10-e2e.md` | Por criterio, en el informe, sección 2 |
| **6.7 y 6.8 Defectos** | `docs/informe-de-pruebas.md`, sección 4 | #27, #30, #31, #34 y #37 cerradas (API pública de GitHub) |
| **6.9 Regresión** | `docs/verificacion/regresion/2026-10-04-regresion-final.md` | 354 de 354, 20 de 20 y 6 de 6 (04/10); 356, 20 + 2 omitidas y 6 de 6 (05/10, `2026-10-05-liberacion-v1.1.0.md`) |
| **6.10 Informe** | `docs/informe-de-pruebas.md` (v1.0, aprobado el 04/10/2026); su sección 11 corresponde a los puntos 6.1 a 6.10 | — |
| **Accesibilidad (CA-12)** | `docs/verificacion/2026-10-03-ca12.md`, `docs/verificacion/lighthouse/` | axe 0 violaciones; Lighthouse 100; contraste 4.79:1 y 5.81:1; 27 de 27 controles |
| **Producción** | `docs/verificacion/2026-10-04-produccion.md`, `docs/verificacion/produccion/` | CA-01, CA-08 (20 de 20, mediana 360 ms), CA-21 b, CA-25 (unos 4 min, 37 s de compilación) |
| **8.1 a 8.7 Liberación** | `docs/liberacion.md` | Procedimiento, versiones, lista, instalación, configuración, reversión y acta firmada el 05/10/2026 ("Liberada con observaciones") |
| **8.2 y 8.3, v1.1.0** | `docs/verificacion/2026-10-05-liberacion-v1.1.0.md`, `docs/verificacion/produccion/2026-10-05-humo-v1.1.0.json` | Suites y verificación posterior |
| **8.7, verificación de v1.0.0** | `docs/verificacion/produccion/2026-10-05-humo-v1.0.0.json` | Prueba de humo 1 de 1 |
| **Capturas** | `docs/capturas/` (28 PNG y `README.md`) | De `v1.0.0-rc.1` en producción |

### 9.6 Sección 4

#### 9.6.1 4 (introducción), alcance de esta versión

- **Texto actual:** "Alcance de esta versión: corte al 30/09/2026. Sobre la versión v0.9.0 se
  fusionaron en dev, por el pull request #28, el rediseño visual… se publicarán en v1.0.0. …
  Queda pendiente la Fase 5, que verifica el sistema completo contra los criterios de aceptación."
- **Texto nuevo:**

  > Alcance de esta versión: corte al 05/10/2026, cierre de la Fase 6. El sistema completo se
  > verificó en la Fase 5 y se liberó como v1.0.0 (04/10/2026), desplegada en
  > https://ahorrito-nine.vercel.app. El 05/10/2026 se publicó v1.1.0, con el botón para mostrar la
  > contraseña. Queda la Fase 7: validación con usuarios y cierre.

- **Evidencia:** `git tag -n1` (v1.0.0 sobre `b072b45`, v1.1.0 sobre `4d14004`) y
  `docs/liberacion.md` 8.2.

#### 9.6.2 4.1.1, 4.1.2 y 4.1.3, componentes y requisitos

**4.1.1, columna Estado:**

- **C-01:** agregar "; aviso de privacidad (SC-09) y botón para mostrar la contraseña (v1.1.0)".
- **C-06:** "Completo; consentimiento del aviso guardado en la cuenta (SC-09); confirmación de
  correo con SMTP propio en producción (RES-16)".

**4.1.2 (corrección 10 del 03/10), pendiente:**

- **Texto actual:** "Con la Fase 4, los catorce requisitos funcionales del catálogo de la sección
  2.5 están implementados. Lo que resta no es construcción, sino verificación"
- **Texto nuevo:**

  > Los quince requisitos funcionales del catálogo de la sección 2.2 están implementados: catorce
  > con la Fase 4 y RF-15 con SC-09, en la Fase 5. Todos se verificaron con su criterio de
  > aceptación en la Fase 5.

- **Fila nueva:** "RF-15 Aviso de privacidad (SC-09) | Implementado y verificado (CA-26) |
  src/app/privacidad/, src/lib/privacidad/, src/components/privacidad/".
- **Columna Estado de las demás filas:** "Implementado" → "Implementado y verificado (Fase 5)".

**4.1.3 (corrección 11 del 03/10, contraste), filas nuevas:**

| Requisito | Estado nuevo | Evidencia nueva |
|---|---|---|
| RNF-06, RNF-08 | Cumplidos | 94 pruebas, cobertura 99.19 % en líneas de src/core (CA-22, CA-24) |
| RNF-04 | Cumplido | Sin cambio (13 de 13) |
| RNF-03 | Cumplido | CA-09: 10 de 10 en el servidor y 5 de 5 desde la interfaz con la clave revocada |
| RNF-10 | Cumplido | CA-11: 10 de 10 solicitudes al proveedor sin datos identificables, el 100 % de la sesión |
| RNF-05 | Cumplido | CA-21 (a): 6 de 6 contraseñas bcrypt `$2a$10$`; (b): 308 a https://, HSTS y 0 peticiones http:// en producción |
| RNF-11 | Cumplido | CA-12: axe 0 violaciones en 7 pantallas y 2 temas; Lighthouse 100; contraste mínimo 4.79:1 en claro y **5.81:1** en oscuro; 27 de 27 controles con teclado |
| RNF-01 | Cumplido | CA-08 en producción: 20 de 20 en 30 s o menos, mediana de 360 ms y máximo de 1,189 ms |
| RNF-09 | Cumplido | CA-25: unos 4 min hasta la portada, 37 s de compilación |
| RNF-07 | En parte | CA-23: guion de 11 pasos sin defectos en Chrome 154, Edge 154 y Firefox 157; una versión de cada uno y sin Safari |
| RNF-02 | Pendiente | CA-20, Fase 7 |

- **El 5.77:1 es un error:** la medición del 30/09 y la del 03/10 dan 5.81:1.
- **Evidencia:** `docs/informe-de-pruebas.md`, sección 2; `docs/verificacion/2026-10-03-ca12.md`
  ("Mínimo global: 4.79:1 en claro y 5.81:1 en oscuro… Coincide con la medición del 30/09/2026");
  `docs/interfaz.md`, tabla de contraste (5.81:1); `docs/verificacion/2026-10-04-produccion.md`.
  Cobertura: `pnpm test:cov` de hoy.

#### 9.6.3 4.3, control de versiones del software

- **Texto actual:** "v1.0.0 | Liberación | — | Pendientes (Fase 6)"
- **Texto nuevo** (tres filas en lugar de esa):

  > v1.0.0-rc.1 | Versión candidata: base del despliegue inicial y de las capturas | 04/10/2026 |
  > Creada sobre 888c06c, en dev (desviación de GITFLOW, decisión del responsable)
  >
  > v1.0.0 | Liberación | 04/10/2026 | Creada sobre b072b45 (fusión del pull request #40 en main)
  >
  > v1.1.0 | Botón para mostrar la contraseña | 05/10/2026 | Creada sobre 4d14004 (pull request #43)

- **Párrafo siguiente.** Agregar al final: "Son excepciones v1.0.0-rc.1, que fija la base de la
  verificación en producción, y v1.1.0, una versión menor posterior a la liberación (versionado
  semántico)."
- **Evidencia:** `git for-each-ref refs/tags` de hoy (v1.0.0-rc.1 → 888c06c, v1.0.0 → b072b45,
  v1.1.0 → 4d14004; las tres publicadas en `origin`) y `docs/liberacion.md` 8.2.

#### 9.6.4 4.4, revisiones de código

- **Fila actual:** "Rediseño, SC-07, SC-08 | #28 feature/rediseno-ui | docs/cierre-rediseno | Se
  publicará en v1.0.0"
- **Texto nuevo de esa fila:** "Rediseño, SC-07, SC-08 | #28 feature/rediseno-ui | #29 | #40 →
  v1.0.0"
- **Filas nuevas:**

  > 5 | #35 feature/verificacion | #36 | #40 → v1.0.0
  >
  > 6 | #38 feature/despliegue | #39 docs/liberacion, #42 docs/cierre-fase-6 | #40 → v1.0.0
  >
  > v1.1.0 | #41 feature/mostrar-contrasena | #44 docs/version-1.1.0 | #43 → v1.1.0

- **Observación nueva.** Hay que añadirla, porque la API pública contradice la regla de la sesión:

  > Comentarios de revisión en línea, consultados el 05/10/2026 en la API pública de GitHub:
  > tienen uno los pull requests #35, #38 y #39; no tienen ninguno los #28, #29, #36, #40, #41,
  > #42, #43 y #44, ni revisiones enviadas.

  **Condicionado.** El responsable indicó el 05/10/2026 que sí dejó comentarios y que lo
  revisará. Si quedaron como revisión pendiente, al enviarla ("Submit review") la API los
  mostrará y esta observación no se aplica. Repetir la consulta después de revisarlo.
- **Evidencia:** `GET /repos/abdideev/ahorrito/pulls/{n}/comments` y `/reviews` de hoy;
  `GET /repos/abdideev/ahorrito/branches/main` y `/dev` (`protected: true` en ambas, que confirma
  lo que dice 4.2).

#### 9.6.5 4.6, registro y control de defectos

- **Texto actual:** "Hasta este corte existen diez incidencias: ocho de tipo cambio (…) y dos de
  tipo defecto: #3 (…), y #27 (…), corregida al inicio de la Fase 5… Ninguna corresponde a un
  defecto funcional del código entregado." y el párrafo "Defecto #34…".
- **Texto nuevo:**

  > Al cierre de la Fase 6 existen dieciséis incidencias, todas cerradas: diez de tipo cambio
  > (SC-01 a SC-10: #1, #8, #10, #13, #17, #21, #25, #26, #32 y #33) y seis de tipo defecto. La
  > severidad sigue la escala del plan de pruebas (bloqueante, mayor, menor y cosmética) y la
  > prioridad es la etiqueta de GitHub:
  >
  > - #3, prioridad baja: commits directos de la Fase 0 (no conformidad de proceso).
  > - #27, severidad menor, prioridad media: las pruebas de integración borraban la captura del
  >   usuario de prueba A; corregida con un usuario exclusivo (usuario C).
  > - #30, severidad menor, prioridad media: la prueba de CA-10 contaba las filas propias de B como
  >   acceso cruzado (falso positivo); ahora cuenta solo las filas ajenas, con un control positivo.
  > - #31, severidad mayor, prioridad alta: la aplicación no publicaba el aviso de privacidad que
  >   exige RES-08; corregido por SC-09 (RF-15).
  > - #34, severidad menor, prioridad media: al borrar el último plan no se anunciaba la
  >   confirmación y se perdía el foco; lo detectó la prueba de humo automatizada (SC-10).
  > - #37, severidad cosmética, prioridad baja: con un solo plan guardado, el enlace decía "Ver mis
  >   plan guardado"; se detectó al revisar el juego final de capturas y se corrigió antes de
  >   v1.0.0.
  >
  > Además, tres hallazgos se corrigieron sin incidencia propia, como desviación declarada en el
  > informe de pruebas (sección 4.2). Ningún defecto quedó abierto en v1.0.0.

- **Evidencia:** API pública de GitHub, `GET /repos/abdideev/ahorrito/issues?state=all` de hoy:
  16 incidencias, todas `closed`, con sus etiquetas. `docs/informe-de-pruebas.md`, secciones 4.1 y
  4.2. `docs/liberacion.md` 8.1, paso 3. La severidad de #37 viene de la entrada 7 de esta
  bitácora.

#### 9.6.6 4.7, control de cambios realizados al código

**Párrafo nuevo, después del de SC-07 y SC-08:**

> SC-09 (aviso de privacidad, RF-15) y SC-10 (pruebas de interfaz con Playwright) siguieron el
> procedimiento completo: registro con impacto evaluado, decisión del cliente, implementación con
> Refs #32 y Refs #33, y comentario de cierre publicado antes de fusionar el pull request #35. Las
> correcciones de defectos citan su incidencia (por ejemplo, Refs #37 en el pull request #38). El
> botón para mostrar la contraseña (#41) es la única modificación de código sin incidencia, por
> decisión del cliente, y se declara en la sección 2.8.

**Evidencia:** `git log origin/dev` (commits con `Refs #37`), pull requests #35, #38 y #41, e
incidencias #32 y #33 cerradas.

#### 9.6.7 4.8, identificación de las versiones liberadas

- **Texto actual:** "Las etiquetas v0.1.0, v0.2.0, v0.3.0 y v0.9.0 existen sobre main y
  corresponden al cierre de las Fases 1, 2, 3 y 4. … en v0.9.0: 330 pruebas unitarias, 19 de
  integración en verde y cobertura del núcleo del 99,19 %. …"
- **Texto nuevo:** se conserva lo anterior y se agrega:

  > La versión liberada es v1.0.0 (main, b072b45, 04/10/2026), desplegada en
  > https://ahorrito-nine.vercel.app, con 354 pruebas unitarias, 20 de integración en verde más 2
  > omitidas y 6 de interfaz. La precedió la candidata v1.0.0-rc.1 (888c06c, en dev). El
  > 05/10/2026 se publicó v1.1.0 (4d14004), que agrega el botón para mostrar la contraseña: 356
  > unitarias en 29 archivos, la misma integración y 6 de interfaz. El procedimiento, la
  > identificación y el acta están en la sección 8 y en docs/liberacion.md.

- **Evidencia:** `git tag -n1`; `docs/verificacion/regresion/2026-10-04-regresion-final.md` (354,
  20, 6); `docs/verificacion/2026-10-05-liberacion-v1.1.0.md` (356, 20 + 2, 6); `pnpm test` de hoy
  (29 archivos, 356 de 356).

#### 9.6.8 4.9, documentación técnica

- **Estilo:** ver 9.2.2.
- **Texto actual:** "Además de docs/motor-calculo.md, el repositorio documenta… La documentación
  técnica cubre los siete componentes del sistema."
- **Texto nuevo:** agregar antes de la última oración: "La verificación y la liberación se
  documentan en docs/plan-de-pruebas.md, docs/informe-de-pruebas.md, docs/liberacion.md
  (instalación, configuración y reversión) y docs/verificacion/ (evidencia por criterio)."
- **Párrafo "Estado de avance y siguiente actualización".**
  - Texto actual: "…publicados bajo la etiqueta v0.9.0. Esta sección se actualizará únicamente si
    la Fase 5 produce correcciones de código, y con el despliegue de la Fase 6."
  - Texto nuevo: "…publicados bajo la etiqueta v1.0.0 y, con el botón para mostrar la contraseña,
    v1.1.0. La Fase 5 produjo las correcciones de #27, #30, #31, #34 y #37, ya incorporadas."
- **Evidencia:** `git ls-tree origin/dev docs/`.

### 9.7 Sección 5

#### 9.7.1 5 (introducción), alcance

- **Texto actual:** "Alcance de esta versión: corte al 29/09/2026. … El corte al 30/09/2026 agrega
  la integración de la baja de planes (SC-07), fusionada en dev por el pull request #28."
- **Texto nuevo:** agregar "El corte al 05/10/2026 agrega la integración del aviso de privacidad
  (SC-09, pull request #35) y la del sistema con la plataforma de despliegue y el SMTP propio
  (pull request #38 y v1.0.0)."

#### 9.7.2 5.1, tabla de integración

- **Fila 5, errata:** está desplazada; dice "Pull request  | #22 | src/app/(app)/…". Texto nuevo:
  "5 | C-01 se integra con C-02 y C-05… | Pull request #22 | src/app/(app)/, src/components/".
- **Filas nuevas:**

  > 7 | C-01 y C-06 incorporan el aviso de privacidad y el consentimiento en el registro (SC-09) |
  > Pull request #35 | src/app/privacidad/, src/app/(auth)/acciones.ts
  >
  > 8 | El sistema completo se integra con Vercel, el proyecto de Supabase y el SMTP propio |
  > Pull request #38 y v1.0.0 (#40) | docs/liberacion.md, docs/verificacion/2026-10-04-produccion.md

#### 9.7.3 5.2 y 5.3

- **5.2, método de verificación:**
  - I-07: agregar "; en producción, registro con confirmación por el SMTP propio (CA-01,
    04/10/2026)".
  - I-01: agregar "; en producción, prueba de humo E2E-04 en verde en v1.0.0 y v1.1.0".
  - I-05: "verificación real mediante CA-11" → "…mediante CA-11, 10 de 10 solicitudes sin datos
    identificables".
  - Los conteos "20 pruebas de integración" (I-04) y "9" (I-06) **siguen siendo correctos**:
    aislamiento 9 pasadas + 1 omitida, captura 11 + 1, según
    `docs/verificacion/regresion/2026-10-04-integracion.json`.
- **5.3, problema 12 (#27).**
  - Texto actual: "…los datos se restauraron desde la interfaz y la corrección, un usuario
    exclusivo para esas pruebas, se hará al inicio de la Fase 5."
  - Texto nuevo: "…y se corrigió al inicio de la Fase 5 con un usuario exclusivo para esas
    pruebas (usuario C), con una guarda contra el correo de A."
- **5.3, encabezado.**
  - Texto actual: "Once están resueltos; el último está registrado como la incidencia #27:"
  - Texto nuevo: "Los doce están resueltos; el último se registró como la incidencia #27:"
- **5.3, dos problemas nuevos de la Fase 6** (opcional pero recomendado):
  - "Producción no recibía las fusiones de dev: la rama de producción de Vercel era dev, la
    predeterminada del repositorio. En la liberación pasó a main."
  - "Desfase de despliegue: una pestaña abierta durante el despliegue mostró un error 500 y el
    error #441 de React hasta recargar, porque el JavaScript anterior hablaba con el servidor
    nuevo. Se declaró como limitación en el acta de liberación; la protección contra ese desfase
    es del plan de pago de Vercel."
- **Evidencia:** `docs/verificacion/2026-10-04-produccion.md`, `docs/liberacion.md` (8.1 y la
  observación de 8.7) y `docs/verificacion/2026-10-03-integracion-27.md`.

#### 9.7.4 5.4, control de versiones durante la integración

**Filas nuevas:**

> v1.0.0-rc.1 | Los siete: C-01 a C-07, base del despliegue inicial | Creada, 04/10/2026 (en dev)
>
> v1.0.0 | Los siete, verificados y desplegados | Creada, 04/10/2026
>
> v1.1.0 | Los siete; C-01 con el botón para mostrar la contraseña | Creada, 05/10/2026

**Evidencia:** `git for-each-ref refs/tags` de hoy.

#### 9.7.5 5.5, pruebas posteriores a la integración (corrección 11 del 03/10)

- **Fila Unitarias.** Texto actual: "330, en 27 archivos". Texto nuevo: "356, en 29 archivos" (354
  al cierre de la Fase 5 y 2 más con la corrección de #37).
- **Fila De integración:** "20 en verde, más 2 marcadores omitidos" **sigue siendo correcto**.
  Ejecutado hoy: `Tests 20 passed | 2 skipped (22)`.
- **Fila nueva:** "De interfaz, automatizadas (pnpm test:e2e) | 6 | E2E-01 a E2E-03 (regresión de
  CA-07, capas de CSS, render sin JavaScript) y E2E-04 (prueba de humo), en local y contra
  producción".
- **Fila nueva:** "De sistema, en producción | CA-08: 20 solicitudes; prueba de humo | 20 de 20 en
  30 s o menos (mediana de 360 ms); E2E-04 en 1 de 1 en v1.0.0 y en v1.1.0".
- **Párrafo de CA-09.** Texto actual: "La ejecución formal de las cinco solicitudes que exige el
  criterio, ya con la interfaz, corresponde a la Fase 5." Texto nuevo: "La ejecución formal de las
  cinco solicitudes desde la interfaz se hizo en la Fase 5: 5 de 5 con la clave revocada."
- **Párrafo "Estado de avance".** Texto actual: "…integrados bajo la etiqueta v0.9.0. La sección se
  actualizará solo si la Fase 5 revela defectos de integración." Texto nuevo: "…integrados bajo la
  etiqueta v1.0.0, desplegada y verificada en producción. La Fase 5 no reveló defectos de
  integración; los suyos fueron de prueba (#27, #30), de requisito (#31) y de interfaz (#34, #37)."
- **Evidencia:** `pnpm test` de hoy (29 archivos, 356 de 356); `pnpm test:integracion` y
  `pnpm test:e2e` del 05/10, en este mismo día (`docs/verificacion/2026-10-05-liberacion-v1.1.0.md`:
  20 + 2 y 6 de 6); `docs/verificacion/2026-10-04-ca09-ca11-ca17.md` (5 de 5);
  `docs/verificacion/produccion/` (CA-08 y humo).

### 9.8 Anexo A

**A.2, fila nueva:** "Correo transaccional | Gmail, cuenta dedicada con contraseña de aplicación
(SMTP) | 0.00 MXN".

**Evidencia:** `docs/liberacion.md` 8.5 (Correo, SMTP propio).

### 9.9 Correcciones detectadas el 03/10: estado una por una

| # | Corrección | Estado | Entrada |
|---|---|---|---|
| 1 | El índice no incluye 4.7 | **Ya aplicada** (4.7 está en el índice). Siguen fuera 4.1, 5.1 (falta actualizar el índice) y 4.9 (sin estilo de título) | 9.2.2 |
| 2 | 1.8.3, párrafo del plan de 12 semanas | **Ya aplicada** (solo falta el punto final) | 9.3.3 |
| 3 | 1.8.2, "S11-S2" | **Ya aplicada** | 9.3.3 |
| 4 | 1.8.7, RSG-04 y RSG-07 | **En parte:** RSG-04 aplicada; RSG-07 pendiente (y RSG-06, misma causa) | 9.3.6 |
| 5 | 1.8.6, cantidad en letra | **Ya aplicada** | 9.3.5 |
| 6 | 1.8.5, "68,320.80" | **Pendiente** | 9.3.4 |
| 7 | 2.10, "semana 10" y "once intentos" | **En parte:** "semana 10" aplicada; "once intentos" pendiente, también en 3.6.1 | 9.3.11, 9.4.3 |
| 8 | 2.4, revisión externa "programada" | **Pendiente** | 9.3.8 |
| 9 | 3.9.3, "trece requisitos funcionales" | **Pendiente** | 9.4.5 |
| 10 | 4.1.2, "sección 2.5" y punto final | **Pendiente** | 9.6.2 |
| 11 | 5.5 (330), 4.1.3 (5.77:1) e integración (21 frente a 20 + 2) | **En parte:** 330 y 5.77 pendientes. En el .docx la integración **ya es correcta** (5.5 dice 20 + 2 y 4.8 explica el 21); el 21 solo sobrevive en el PLAN (9.10) | 9.6.2, 9.7.5 |

### 9.10 Contradicciones entre el PLAN, docs/ y el .docx (solo se listan)

| # | Dónde | Qué dice | Qué dice la otra fuente |
|---|---|---|---|
| 1 | `docs/Ahorrito-PLAN.md` §1.7, párrafo "Requisitos implementados" | "Quedan para la Fase 6 RNF-01 y RNF-05 en producción y RNF-09 (CA-25)" | La Fase 6 está completada y los tres se cumplieron (`docs/liberacion.md` 8.2: CA-08, CA-21 y CA-25 en producción) |
| 2 | PLAN §1.7, fila de la Fase 4 | "330 pruebas unitarias y 21 de integración… contraste mínimo 7.55:1" | El .docx (historial 3.9 y 4.8) corrige a 19 en verde + 2 omitidas; el contraste vigente es 4.79:1 y 5.81:1 (`2026-10-03-ca12.md`); 7.55:1 era anterior al rediseño |
| 3 | PLAN §1.7, fila de la Fase 2 | "CA-10 cumplido con 11 intentos" | Correcto para su fecha, pero el vigente es 13 de 13 (`2026-10-03-ca10.md`). Si la tabla describe el estado actual, falta aclararlo |
| 4 | PLAN §1.7, fila de la Fase 6 | Solo "`v1.0.0` en `main` (`b072b45`)" | `main` y producción están en `v1.1.0` (`4d14004`) desde el 05/10 |
| 5 | PLAN §1.7, tabla de cambios de alcance | SC-01 con incidencia "—" | SC-01 es la incidencia #1 (API de GitHub; el .docx 2.8 dice "Incidencia #1") |
| 6 | PLAN §1.2 | "Construcción: semanas 8 a 12" | El .docx 1.8.3 pone la codificación en S8 a S10 y las pruebas y el despliegue en S12. Es compatible si "construcción" incluye pruebas; conviene precisarlo |
| 7 | `docs/liberacion.md` 8.1, paso 1 | "Congelar `dev`: ninguna funcionalidad nueva después de la Fase 5" | Después de liberar entró una funcionalidad (#41, `v1.1.0`). El paso describe la liberación de v1.0.0, pero no se dejó escrito que el congelamiento terminó con ella |
| 8 | .docx 3.7.1 frente a 3.7.3 | "máximo de 28 semanas" | "acotado a 26" (9.4.4) |
| 9 | .docx 2.3, RNF-07 | Chrome, Firefox, Edge y **Safari** | CA-23 (plan de pruebas) no incluye Safari; el informe lo declara como limitación |
| 10 | .docx 2.10, CA-10 | "devuelven error de autorización" | El sistema deniega con 0 filas, 404 o `42501`. Lo decidió el cliente el 03/10 (entrada 4.3) y lo explican el plan y el informe; no es error, pero un lector del .docx solo no lo sabe |
| 11 | .docx 1.7.1 y 2.4 | Los evaluadores (STK-04) aparecen como consultados en la revisión de requisitos | La revisión no se hizo (9.3.8) |
| 12 | Plan de pruebas y PLAN frente al .docx | El plan y el informe cuentan 26 criterios (CA-01 a CA-26) | La tabla de 2.10 del .docx solo tiene 14 (9.3.11) |
| 13 | .docx 1.8.7, RSG-08 | "Construir el motor en la S6" | El .docx 1.8.3 pone el motor en la S8, y se construyó del 11 al 12/09 (S5, `v0.1.0`). Es histórico; solo se señala |
| 14 | Hitos de 1.8.3 | H5 "Sistema verificado, 1 nov" y H6 "Sistema liberado, 6 nov, … validada" | Real: verificado el 04/10 y liberado el 04/10, sin validar. Si se agrega una columna de fecha real, H6 queda "liberado; validación pendiente (Fase 7)" |
| 15 | `docs/liberacion.md` 8.4 | "Node.js 24 o superior (verificado con 24.21 y 25.7)" | El equipo local usa hoy `node -v` = v25.7.0 y Vercel, 24.x. Coherente; solo para que la sección 8 no diga una sola versión |

### 9.11 Revisión del .docx con la sección 9 aplicada (05/10/2026, archivo de las 18:32)

**Método:** se extrajo el texto, con estilos y tablas, del .docx versionado (`HEAD`) y del
modificado, y se compararon con `diff`. Los dos archivos abren como ZIP válido (`testzip` sin
errores) y conservan sus 17 imágenes.

**Aplicado correctamente:** 9.2.1 (fila 4.1), 9.2.2 (el índice ya lista 4.1, 4.9 y 5.1; 4.9 tiene
el estilo Título 2), 9.3.1, 9.3.2, 9.3.3 (punto final), 9.3.4, 9.3.6 (RSG-01, RSG-06 y RSG-07),
9.3.8 (incluida la eliminación de la nota), 9.3.9, 9.3.10, 9.3.11 (tabla CA-14 a CA-25 entre CA-13
y CA-26, y el párrafo de CA-10), 9.4.1 a 9.4.5, 9.6.1 a 9.6.3, 9.6.5 a 9.6.8, 9.7.1 a 9.7.5
(5.3 se redactó con "catorce problemas", coherente con los dos nuevos) y 9.8. No se copió ningún
texto de esta bitácora (búsqueda de "SUPUESTO", "Texto nuevo", "Evidencia:" y numeraciones 9.x.x:
0 resultados).

**Pendiente o nuevo:**

| # | Sección | Qué falta | Estado |
|---|---|---|---|
| 1 | 1.8.7, RSG-03 | Texto de 9.3.6, ahora que se confirmó que el docente no revisó | Pendiente |
| 2 | 4.4, observación de comentarios en línea | Depende de que envíes las revisiones pendientes | Condicionado |
| 3 | 5.2, I-02 | **Nuevo hallazgo.** Dice "Pruebas unitarias del orquestador (27 casos)". Hoy `pnpm exec vitest list src/app/api/planes/orquestador.test.ts` da **9** casos (7 bloques `it`, dos de ellos `it.each`); `degradacion.test.ts` tiene 7 y `[id]/route.test.ts`, 4. Ninguna combinación da 27. Texto nuevo propuesto: "Pruebas unitarias del orquestador (9 casos) y de degradación (7 casos)". **No verificado:** de dónde salió el 27 | Pendiente |
| 4 | 1.8.2 | Fila opcional de la fase de validación (9.3.3) | Opcional, no aplicada |

---

## 10. Fase 7: validación y cierre (versión 4.4 del documento)

**Estado:** pendiente. Preparada el 22/10/2026, después de fusionar el pull request #57 (informe de
validación y acta). El responsable la aplica a mano en `docs/ACS-U1-APP-AvilaNeriAbdiel.docx`.
Los textos actuales se extrajeron del .docx versionado (versión 4.3).

**Regla de esta entrada.** Las filas que registran un hecho de su fecha **no se reescriben**: el
acta de liberación de 8.7 y la tabla de 8.2 dicen "CA-20 pendiente" porque lo estaba el 04 y el
05/10. Solo cambia lo que describe el estado vigente.

### 10.1 Historial de versiones, fila nueva

> 4.4 | 22/10/2026 | Cierre de la Fase 7: sección 7 con los resultados de la validación (OBJ-05
> cumple; CA-20 y OBJ-02, 2 de 3 demostrados; aceptado con concesión del cliente); CA-20 en 4.1.3 y
> en la sección 6; RSG-03 y revisión retroactiva de requisitos (Parte 0) en 1.8.7 y 2.4; pull
> requests #45 a #57 en 4.4; defectos retroactivos #50 a #54 en 4.6; corrección de I-02 en 5.2;
> versión final v1.1.0 en la sección 8 | Abdiel Avila Neri

### 10.2 Sección 1.8.7, RSG-03 (pendiente desde 9.3.6 y 9.11)

- **Texto actual (acción de mitigación):** "Someter los requisitos a revisión con STK-04 antes de su
  aprobación. Redactar los criterios de aceptación antes de iniciar la construcción."
- **Texto nuevo:** agregar al final:

  > Materializado: la revisión con STK-04 no se realizó y la contingencia (revisión del docente)
  > tampoco se ejecutó. Se compensó en parte con los criterios de aceptación redactados antes de
  > construir y con una revisión retroactiva de los requisitos por los tres evaluadores al inicio
  > de la validación (21 y 22/10/2026, sección 2.4). En la validación, el sesgo sigue vigente porque
  > los evaluadores conocen al autor (sección 7.3).

- **Evidencia:** `docs/informe-de-validacion.md`, secciones 5, 7 y 9.

### 10.3 Sección 2.4, revisión de los requisitos

**Párrafo nuevo**, al final de "Revisión externa no realizada":

> Revisión retroactiva (21 y 22/10/2026). Al inicio de la validación, antes de usar la aplicación,
> los tres evaluadores leyeron los requisitos y respondieron qué falta y qué no se entiende (Parte 0
> del protocolo de validación). Dejaron cinco observaciones: ingresos recurrentes e irregulares,
> pagos semanales, recordatorios, una aplicación móvil y el término "huevo de Pascua", que uno de
> ellos no entendió. Ninguna es un defecto; se registran como posibles solicitudes de cambio
> (docs/informe-de-validacion.md, sección 7). La revisión es retroactiva: la línea base ya estaba
> aprobada y el sistema construido.

**Contradicción 11 de 9.10** (los evaluadores aparecen como consultados en 1.7.1 y 2.4): queda
resuelta por la revisión retroactiva. Si 1.7.1 dice que fueron consultados en el análisis, se
añade "(de forma retroactiva, en la validación)".

### 10.4 Sección 4.1.3, filas de RNF-02 y RNF-07

| Requisito | Texto actual | Texto nuevo |
|---|---|---|
| RNF-02 Facilidad de aprendizaje | Pendiente · CA-20, Fase 7 | **En parte** · CA-20: 2 de 3 evaluadores demostrados (2 min 49 s y 3 min 42 s); el tercero quedó pendiente por una grabación cortada. Aceptado con concesión del cliente (sección 7) |
| RNF-07 Compatibilidad | En parte · CA-23: … sin Safari | En parte · CA-23: … una versión de cada uno. En la validación, el guion pasó 11 de 11 en Safari 18.7.8 sobre iPadOS; Safari en macOS sin evidencia |

### 10.5 Sección 4.4, revisiones de código

**Fila nueva** de la tabla:

> 7 | — | #45 y #46 (protocolo), #47 (secciones 6 a 8), #48 (operación, mantenimiento y retiro), #49
> (scripts de validación), #55 (mediana de CA-08), #56 (respaldo y evaluación preliminar), #57
> (informe y acta) y el cierre | Pull request de cierre de dev hacia main (sin etiqueta nueva)

**Párrafo nuevo, después de la tabla de no conformidades:**

> Al cierre de la Fase 7 se fusionaron 36 pull requests (#2 a #57). Tienen comentario de revisión en
> línea 11: #35, #38, #39, #45 a #49 y #55 a #57 (API pública de GitHub, 22/10/2026). La mediana
> entre la creación y la fusión es de 0.7 minutos; autor y revisor son la misma persona. En la Fase
> 7, cada pull request llevó un comentario en línea antes de fusionarse. El comentario de cierre de
> la incidencia #53 se publicó después de fusionar el pull request #55 que la corrigió, y se
> declara.

- **Evidencia:** `GET /repos/abdideev/ahorrito/pulls?state=closed` y `/pulls/{n}/comments`,
  22/10/2026; `docs/evaluacion-final.md`, sección 3.
- **[SUPUESTO]** Que el comentario tardío de #53 ya está publicado; no lo verifiqué.

### 10.6 Sección 4.6, registro y control de defectos

- **Texto actual:** "Al cierre de la Fase 6 existen dieciséis incidencias, todas cerradas: diez de
  tipo cambio (…) y seis de tipo defecto."
- **Texto nuevo:** "Al cierre de la Fase 7 existen veintiuna incidencias, todas cerradas: diez de
  tipo cambio (…) y once de tipo defecto." Se conserva la lista de los seis primeros y se agrega:

  > El 21/10/2026 se registraron de forma retroactiva cinco defectos más, que se habían corregido o
  > resuelto sin incidencia:
  >
  > - #50, severidad cosmética, prioridad baja: el apellido del autor aparecía con acento en los
  >   créditos y en el aviso de privacidad.
  > - #51, severidad menor, prioridad media: con sesión, "Volver al inicio" del aviso de privacidad
  >   llevaba a la portada y parecía un cierre de sesión.
  > - #52, severidad menor, prioridad media: el aviso simplificado alargaba la tarjeta del registro y
  >   obligaba a desplazar.
  > - #53, severidad menor: el script de CA-08 informaba como mediana el 11.º valor de 20; corregido en
  >   el pull request #55 (303 ms en local y 358.5 ms en producción, antes 310 y 360). No cambia el
  >   resultado de CA-08.
  > - #54, severidad mayor en producción, prioridad media: el proyecto de Supabase se pausó por
  >   inactividad el 28/09/2026 y dejó la aplicación sin base de datos; se reanudó sin pérdida de
  >   datos. Es el único incidente de operación (docs/operacion.md, 9.4).
  >
  > Las sesiones de validación no reportaron defectos.

- **Párrafo "Además, tres hallazgos…":** cambiar el final por "Esos tres hallazgos son los defectos
  #50 a #52, registrados de forma retroactiva."
- **Evidencia:** API pública de GitHub, 22/10/2026: 21 incidencias, 0 abiertas; severidades del
  cuerpo de cada incidencia.
- **Acción tuya en GitHub:** **#53 no tiene etiquetas.** Ponle `defecto` y su prioridad, para que
  la API la cuente como las demás.

### 10.7 Sección 5.2, I-02 (pendiente desde 9.11)

- **Texto actual:** "Pruebas unitarias del orquestador (27 casos)"
- **Texto nuevo:** "Pruebas unitarias del orquestador (9 casos) y de degradación (7 casos)"
- **Evidencia:** `pnpm exec vitest list src/app/api/planes/orquestador.test.ts` (9) y
  `degradacion.test.ts` (7), según 9.11. **No verificado:** de dónde salió el 27.

### 10.8 Sección 6, CA-20

| Lugar | Texto actual | Texto nuevo |
|---|---|---|
| 6.3, fila RNF-02 / CA-20 | Medición con usuarios · Pendiente · Fase 7 | Medición con usuarios · 2 de 3, con concesión · docs/informe-de-validacion.md |
| 6.6, fila CA-20 | Pendiente · Fase 7: tres usuarios y perfiles P1 a P3 | 2 de 3 demostrados · E1, 2 min 49 s; E3, 3 min 42 s; E2 pendiente (grabación cortada); aceptado con concesión del cliente (sección 7) |
| 6.10, resumen "Pendientes por diseño" | 1: CA-20 (Fase 7) | 0. CA-20 se midió en la Fase 7: 2 de 3 demostrados, con concesión (sección 7) |
| 6.10, limitación sobre CA-20 | "CA-20 (RNF-02) no puede cerrarse sin usuarios y se mide en la Fase 7." | "CA-20 (RNF-02) se midió con usuarios en la Fase 7 y quedó demostrado para 2 de 3 evaluadores (sección 7)." |
| 6.10, "Estado de avance y siguiente actualización" | "…Esta sección se actualizará al cerrar la Fase 7 con el resultado de CA-20, y antes si se amplía la cobertura de navegadores de CA-23." | "…Con el cierre de la Fase 7 se incorporó el resultado de CA-20. CA-23 no se amplió; la validación añadió evidencia de Safari en iPadOS (sección 7)." |

### 10.9 Sección 7, validación (resultados)

**7 (introducción), alcance.**

- **Texto actual:** "Alcance de esta versión (corte al 20/10/2026). Las sesiones de validación se
  acordaron… Ningún resultado de sesión se registra antes de que ocurra…"
- **Texto nuevo:**

  > Alcance de esta versión (corte al 22/10/2026). Las sesiones se realizaron del 21/10/2026 a las
  > 23:57 al 22/10/2026 a las 01:06 (horas de la base de datos), sobre la versión v1.1.0 (commit 4d14004) en producción, con la
  > conducción autoadministrada de cada evaluador y el protocolo de validación 1.2, aprobado antes de
  > la primera sesión. Los resultados de esta sección provienen del informe de validación
  > (docs/informe-de-validacion.md) y llevan la fecha y la hora reales de cada sesión.

**7.1, párrafo final.**

- **Texto actual:** "…24 cumplen, uno cumple en parte (CA-23) y uno está pendiente (CA-20, que esta
  sección cierra). La decisión de aceptación (aceptado, aceptado con observaciones o no aceptado) se
  define en el protocolo de validación, que se aprueba antes de la primera sesión."
- **Texto nuevo:** "…24 cumplen, uno cumple en parte (CA-23) y CA-20 se mide en esta sección. La
  decisión de aceptación (aceptado, aceptado con observaciones, no aceptado o decisión aplazada) se
  definió en el protocolo de validación, aprobado el 20/10/2026 y corregido antes de cualquier
  sesión (versiones 1.1 y 1.2 del 21/10/2026)."

**7.2.**

- **Texto actual:** "…Falta la evaluación por usuarios en ese mismo entorno, que son las sesiones de
  esta fase. Hasta entonces el punto es parcial."
- **Texto nuevo:** "…Los tres evaluadores usaron la aplicación en ese mismo entorno de producción,
  con sus propias cuentas y sus propios correos, el 21 y el 22/10/2026."

**7.3, las tres frases que no coincidían con el protocolo aprobado** (pendientes desde la 4.3):

| # | Texto actual | Texto nuevo |
|---|---|---|
| 1 | "…sin experiencia previa con Ahorrito, uno por cada perfil…" | "…que declararon al inicio de su sesión no haber usado la aplicación ni visto su código o sus documentos antes de ese día, uno por cada perfil…" |
| 2 | Fila Dispositivos: "Dos de los tres evaluadores usan equipos Apple, lo que permite probar Safari (CA-23) como tarea aparte de la medición" | "Previstos: Windows, Mac con Safari e iPhone con Safari. Usados: Fedora Linux con Firefox, Mac con el navegador Dia e iPad con Safari (desviaciones declaradas en el informe). El guion de CA-23 en Safari se ejecutó como Parte B, sin medir tiempo; es evidencia adicional de RNF-07 y no modifica el texto de CA-23" |
| 3 | Fila Versión probada: "v1.1.0 (4d14004). Se propone congelarla durante la fase: cualquier cambio exige una solicitud de cambio previa (sección 4.4, fila 3)" | "v1.1.0 (4d14004), congelada durante toda la fase: no hubo cambios en src/ (git diff 4d14004 -- src, vacío el 22/10/2026)" |

**7.3, fila nueva:**

> Sesiones realizadas, en orden y con la hora de creación de la cuenta en la base de datos | E3 (P3):
> 21/10/2026, 23:57 · E1 (P1): 22/10/2026, 00:47 · E2 (P2): 22/10/2026, 01:01. Los tres dieron su
> consentimiento; ninguno quedó excluido por experiencia previa

**7.3, "Limitaciones declaradas", agregar al final:** "En la práctica hubo dos tiempos completos y
no tres, y cada combinación de dispositivo se probó con una sola persona."

**7.4.**

- **Texto actual:** "Pendiente. Las necesidades NEC-05… El cierre de este punto es el informe de
  validación (7.5)."
- **Texto nuevo:**

  > NEC-05 (un plan comprensible) se contrastó con OBJ-05, que **se cumple**: claridad y
  > accionabilidad de 4 y 4, 5 y 5, y 5 y 5, cada evaluador y cada pregunta por separado. NEC-06
  > (reducir el esfuerzo de captura) se contrastó con OBJ-02 y CA-20: **2 de 3 evaluadores
  > demostrados** (2 min 49 s con P1 y 3 min 42 s con P3, frente a un umbral de 8 minutos). El
  > tercero (P2) quedó pendiente porque su grabación empieza después del registro. La base de datos
  > registra 4 min 36 s desde que creó su cuenta, pero el protocolo no permite completar un tiempo
  > con otras fuentes. Los planes obtenidos coinciden con el resultado esperado del motor, salvo el
  > de P3, por dos errores de captura del evaluador (una fecha y una meta), que no son defectos de la
  > aplicación.

**7.5.**

- **Texto actual:** "Pendiente. El informe de validación (docs/informe-de-validacion.md) registrará…"
- **Texto nuevo:**

  > El informe de validación (docs/informe-de-validacion.md) registra, por evaluador, la fecha y la
  > hora reales, el dispositivo y el navegador, el tiempo del registro al primer plan con su
  > desglose, las dos calificaciones y las observaciones, y, por criterio, el resultado de CA-20,
  > OBJ-02 y OBJ-05. Se basa en un registro anonimizado (docs/validacion/registros/) procesado con
  > un script cuyas reglas tienen 28 pruebas. Declara ocho desviaciones del protocolo: dispositivos
  > distintos de los previstos, la grabación cortada, la consulta de tiempos ejecutada después de la
  > Parte B en dos evaluadores, el horario, la decisión de cierre y las horas anotadas de un
  > evaluador, que no coinciden con la base de datos. Las sesiones no reportaron
  > defectos. La Parte B pasó 11 de 11 en Safari sobre iPadOS. La Parte 0 dejó cinco observaciones
  > para el mantenimiento (sección 2.4).

**7.6.**

- **Texto actual:** "Pendiente. El acta de aceptación la firmará el cliente (STK-01) una vez cerradas
  las sesiones…"
- **Texto nuevo:**

  > El cliente (STK-01) decidió el 22/10/2026 **aceptar el sistema con concesión**
  > (docs/validacion/acta-de-aceptacion.md). Con un resultado pendiente, el protocolo preveía aplazar
  > la decisión hasta contar con un evaluador sustituto. El cliente optó por cerrar sin sustituto,
  > aceptó el riesgo de que CA-20 no quede demostrado para el tercer evaluador y lo registró como
  > desviación del protocolo, tomada después de conocer los resultados. Ningún resultado se modificó.
  > La concesión se levanta con un sustituto sin experiencia previa, en Mac con Safari, con el perfil
  > P2. Los evaluadores participaron como consultados, sin autoridad de aprobación (sección 1.3); sus
  > nombres figuran solo en la copia firmada del acta, fuera del repositorio.

**Estado de avance y siguiente actualización.**

- **Texto actual:** "Los puntos 7.1 y 7.2 tienen evidencia; el 7.2 es parcial… Los puntos 7.3 a 7.6
  están pendientes de las sesiones…"
- **Texto nuevo:** "Los seis puntos de esta sección tienen evidencia. El 7.4 se cumple en parte:
  CA-20 y OBJ-02 quedaron demostrados para 2 de 3 evaluadores, con la concesión del cliente de 7.6."

### 10.10 Sección 8, versión final

- **Agregar al final del primer párrafo de la sección 8:** "La versión final del sistema es v1.1.0
  (4d14004): la Fase 7 validó esa versión sin cambiarla y solo agregó documentación, que llega a
  main con el pull request de cierre."
- **No cambian** 8.2 ni el acta de 8.7: registran la liberación del 04 y el 05/10/2026.
- **Contradicción 7 de 9.10** (congelamiento de dev en 8.1, paso 1): agregar a ese paso "Terminó con
  la liberación de v1.0.0; v1.1.0 (#41) entró después, sin solicitud de cambio (4.4, fila 3)".

### 10.11 Lo que no cambia

- **Secciones 1 a 3:** salvo 1.8.7 y 2.4, nada de lo validado contradice el análisis ni el diseño.
  Las observaciones de la Parte 0 son necesidades nuevas, no errores de los requisitos.
- **Secciones 4.3 y 5.4:** no hay etiquetas nuevas. La versión final sigue siendo v1.1.0.
- **Anexo B:** las capturas de los evaluadores contienen datos personales y no entran al documento.

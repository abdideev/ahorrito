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

**Estado:** condicionado al cierre de la #27, que necesita la ejecución de
`pnpm test:integracion` con el usuario C.

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

**Nota.** Si se registra la incidencia de RES-08 (sección 2 de esta bitácora), este párrafo
cambia también su conteo de incidencias. Conviene redactarlo una sola vez al cerrar el bloque.

---

## 2. RES-08 · aviso de privacidad (SC-09, RF-15, CA-26)

**Estado:** condicionado a la decisión del cliente sobre SC-09.

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
| SC-09 | 03/10/2026 | Aviso de privacidad (simplificado en el registro, con consentimiento; integral sin sesión) | Nuevo RF-15; 1.5.1; CA-26 | Sin migración ni cambio de interfaces; unas 5 h, absorbidas por el adelanto del cronograma. Corrige el defecto #[N] (RES-08 sin requisito) | [Decisión de STK-01, fecha, incidencia #M] |

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

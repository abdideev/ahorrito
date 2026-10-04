# Plan de pruebas de Ahorrito

| Dato | Valor |
|---|---|
| Versión del plan | 1.0, **aprobada por el responsable el 03/10/2026** (decisiones en la sección 10.4) |
| Fecha | 03/10/2026 |
| Elaboró | Abdiel Avila Neri, como tester (STK-02), con asistencia de Claude |
| Aprueba | Abdiel Avila Neri, como líder y cliente (STK-01) |
| Base de prueba | Rama `feature/verificacion`, derivada de `dev` en `4366398` (PR #29) |
| Puntos de la lista de verificación | 6.1 a 6.10 |
| Norma | ISO/IEC/IEEE 12207:2026, proceso de verificación; ISO/IEC 25010 para las características de calidad |

---

## 0. Qué se midió antes de escribir este plan

Este plan **no se escribió antes de toda prueba**. Las pruebas unitarias y de integración nacieron
con el código, en las Fases 1 a 4, y varios criterios ya se midieron. Se declaran aquí con su
fecha para no aparentar que todo se planeó primero. Esas mediciones previas se aceptan como
**evidencia preliminar**; un criterio solo se declara cumplido cuando se ejecuta conforme a este
plan y su evidencia queda en `docs/verificacion/`.

| Criterio | Medido antes del plan | Fecha | Dónde consta | Qué le falta según este plan |
|---|---|---|---|---|
| CA-02 a CA-06 (parte unitaria) | En verde en cada ejecución de `pnpm test` | Desde el 12/09/2026; última del 03/10/2026 | JSON en `docs/verificacion/2026-10-03-unitarias-*.json` | La parte funcional de CA-02, CA-03 y CA-05 |
| CA-07 | Descargo a 16 px (panel) y 80 px (historial), en escritorio | 30/09/2026 | `docs/interfaz.md` §7 | Registro reproducible y **la primera medición en móvil** |
| CA-09 | 10 de 10 en el servidor; 1 ejecución en la interfaz | 18/09 y 29/09/2026 | `docs/explicacion.md` §5 | 5 ejecuciones en la interfaz |
| CA-10 | 13 de 13 intentos con 0 filas | 30/09/2026 | `docs/persistencia.md` §6 | Repetirlo tras corregir el defecto #30 (la ejecución del 03/10 falla por él) |
| CA-11 | 0 datos identificables en las solicitudes registradas | 18/09/2026 | `docs/explicacion.md` §5 | El 100 % de las solicitudes de una sesión capturada |
| CA-12 | Contraste mínimo de 4.79:1 en claro y 5.81:1 en oscuro, con un script propio; recorrido con teclado | 30/09/2026 | `docs/interfaz.md` §7 | Herramienta de accesibilidad reconocida (el método lo exige) |
| CA-13 | Pasos 1 a 4 | 30/09/2026 | `docs/interfaz.md` §7 | Paso 5, con "reducir movimiento" |
| CA-26 | Verificación de la implementación | 03/10/2026 | `docs/verificacion/2026-10-03-sc09.md` | El caso formal, incluida la constancia en los metadatos |
| RNF-09 (local) | Clon limpio en 151 s | 03/10/2026 | Evidencia del punto 6 (fuera del repositorio) | La medición real en Vercel (CA-25) |

---

## 1. Objetivo y alcance

**Objetivo.** Demostrar, con evidencia reproducible, que la versión candidata a `v1.0.0`:

- cumple los requisitos RF-01 a RF-15 y RNF-01 a RNF-11 mediante sus criterios de aceptación
  CA-01 a CA-26;
- registrar los defectos encontrados, corregirlos y protegerlos con pruebas de regresión.

**Dentro del alcance:**

- Los componentes C-01 a C-07.
- Las interfaces I-01 a I-07.
- Los quince requisitos funcionales y los once no funcionales.
- El entorno local y, después del despliegue, el entorno de producción en Vercel.

**Fuera del alcance:**

| Excluido | Motivo |
|---|---|
| La calidad redactora de la explicación más allá de CA-17 | Depende del modelo externo |
| Safari | No se puede ejecutar en Windows; ver la sección 12 |
| Pruebas de carga y de concurrencia masiva | No hay requisito que las pida (sección 3.7.3 del documento maestro) |
| RNF-02 con usuarios reales | Pertenece a la Fase 7 (validación); aquí solo se prepara |

---

## 2. Estrategia por nivel

| Nivel | Qué verifica | Herramienta | Automatizada | Cuándo se ejecuta |
|---|---|---|---|---|
| **Unitaria** | Motor (`src/core`), adaptadores, validación, rutas, flujo NDJSON, utilidades | Vitest 5 (`pnpm test`) | Sí | En cada cambio y antes de cada commit |
| **Integración** | Repositorio contra la base real con la clave pública y seguridad por fila (CA-10, captura) | Vitest con `vitest.integracion.mts` (`pnpm test:integracion`) y los usuarios A, B y C | Sí, con credenciales locales | Antes de cada pull request que toque C-05, C-07 o las pruebas |
| **Sistema (HTTP)** | `POST`, `GET` y `DELETE /api/planes` con y sin sesión, inyección de fallo de la IA, cronometraje del flujo | `pnpm build` + `pnpm start` y peticiones con sesión, más scripts de medición versionados | Parcial: los scripts automatizan la medición | En el Bloque 3 y, para CA-08 y CA-21b, en producción |
| **Interfaz y funcional** | Recorridos de la persona usuaria en el navegador: captura, plan, historial, créditos, aviso | Navegador integrado (Chromium 152), Chrome 154 y Edge 154 | **Manual.** Su automatización requiere una solicitud de cambio (sección 10.3) | En el Bloque 3, con el guion de la sección 7 |
| **Accesibilidad** | Contraste, teclado, nombres accesibles y estructura | Lighthouse de Chrome DevTools, más el script de contraste **versionado** en `docs/verificacion/scripts/`. axe-core solo si el responsable lo autoriza | Semiautomatizada | En el Bloque 3, en 6 pantallas × 2 temas |
| **Aceptación** | Cada criterio CA, con su evidencia | Los niveles anteriores | — | Bloques 3 y 6 |

**Orden de ejecución.** Primero lo bloqueante para la liberación (sección 6.3), después lo que
depende del despliegue y al final lo cosmético.

---

## 3. Escala de severidad

La severidad mide el **efecto del defecto en el producto**. La prioridad, que es la etiqueta
`prioridad:*` de GitHub, mide la **urgencia de corregirlo**. Se registran por separado: un
defecto cosmético puede tener prioridad alta (por ejemplo, un nombre mal escrito en los
créditos antes de una presentación) y uno mayor puede esperar si tiene rodeo.

| Severidad | Definición | Ejemplo | Efecto en la liberación |
|---|---|---|---|
| **Bloqueante** | Impide usar una función principal, pierde o expone datos, o incumple una obligación legal o de seguridad sin rodeo | Un usuario lee datos de otro; el plan no se genera | Impide liberar |
| **Mayor** | Una función no se comporta según su requisito, pero existe un rodeo, o se incumple un criterio de aceptación | El descargo queda fuera de la vista en móvil; falta el aviso de privacidad (#31) | Impide liberar salvo excepción documentada por el cliente |
| **Menor** | Comportamiento incorrecto de bajo impacto que no incumple ningún criterio | Las pruebas borran datos del entorno de pruebas (#27); un falso positivo de una prueba (#30) | Se libera con el defecto registrado |
| **Cosmética** | Presentación o redacción, sin efecto funcional | Un acento mal puesto; una alineación | Se libera con el defecto registrado |

Cada incidencia de defecto lleva su severidad en el cuerpo (sección "Impacto"), porque GitHub no
tiene etiqueta para ella. **No se crean etiquetas nuevas** sin una solicitud de cambio.

---

## 4. Entorno de prueba

Versiones medidas el 03/10/2026 (`docs/verificacion/2026-10-03-bloque-1.md`):

| Elemento | Versión o valor |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Node.js | 25.7.0 instalado. Comparación con 24.21.0 temporal: sin diferencias |
| pnpm | 12.3.4 |
| Next.js / React | 16.3.4 (Turbopack) / 19.2.8 |
| Vitest | 5.0.0, con `@vitest/coverage-v8` 5.0.0 |
| TypeScript / ESLint | 5.9.3 / 9.39.5 |
| Navegadores | Chrome 154.0.8037.93, Edge 154.0.4258.53 y el navegador integrado de Claude (Chromium 152.0.7977.130). Firefox no está instalado |
| Supabase | Proyecto `bnvuvcsrjvupzhrbwcmc`, us-east-2, PostgreSQL 17.6.1. **El mismo proyecto para el desarrollo, las pruebas y la producción**: no hay un proyecto de pruebas aparte |
| IA | API de Gemini, modelo por omisión de `src/adapters/ia/gemini.ts`, plan gratuito |
| Producción (Bloque 6) | Vercel, subdominio de la plataforma, Node 24 [SUPUESTO hasta configurarlo] |

**Cuentas**, todas con correo de dominio reservado `.test` y creadas por el responsable con
autoconfirmación:

| Cuenta | Uso | Puede borrarse su captura |
|---|---|---|
| A | Propietario del plan de CA-10 y verificación manual en el navegador | No |
| B | Intenta el acceso cruzado en la integración. **No debe usarse para demostraciones**: el defecto #30 nació así | No; se vacía al corregir #30 si la corrección lo requiere |
| C | Exclusiva de `captura.integracion.test.ts` | Sí, la prueba la borra en cada ejecución |
| Capturas | Juego de capturas de pantalla con los perfiles P1 a P3. Correo neutro (por ejemplo `capturas@ahorrito.test`), porque la barra muestra el correo desde 1024 px | Sí, se recaptura por perfil |

**La cuenta de capturas aún no existe: la crea el responsable.**

**Precondiciones de cada sesión de prueba:**

1. El proyecto de Supabase está activo. La capa gratuita lo pausa tras unos 7 días sin
   actividad; se comprueba con `pnpm exec supabase projects list`.
2. `.env.local` tiene las variables de `.env.example`. Nadie más que el responsable lo lee.
3. La compilación de producción está al día (`pnpm build`).

---

## 5. Criterios de entrada y salida

### 5.1 Entrada (para empezar el Bloque 3)

- [x] Plan de pruebas aprobado por el responsable (03/10/2026).
- [x] `pnpm lint`, `tsc` y `pnpm test` en verde sobre la base de prueba: 354 de 354 el
  03/10/2026.
- [x] Defecto #27 corregido (usuario C).
- [ ] Defecto #30 corregido. **Es condición para ejecutar CA-10**, no para el resto.
- [ ] Cuenta de capturas creada.
- [ ] Proyecto de Supabase activo el día de la ejecución.

### 5.2 Suspensión y reanudación

Se suspende la ejecución si Supabase está pausado o caído, si se agota la cuota de Gemini (salvo
en CA-09, que la simula), o si aparece un defecto bloqueante que invalida los casos siguientes.
Se reanuda al resolver la causa y **se repiten completos** los casos interrumpidos, no solo la
parte que faltaba.

### 5.3 Salida (para cerrar la Fase 5 con el informe)

- Todos los criterios ejecutables antes del despliegue tienen resultado y evidencia.
- 0 defectos bloqueantes y 0 mayores abiertos. Un defecto mayor puede quedar abierto solo con
  una excepción escrita del cliente.
- Cada defecto corregido tiene una prueba que lo protege y el resultado de la suite antes y
  después guardado en `docs/verificacion/`.
- Cobertura de `src/core` de 80 % o más (RNF-08).
- Los criterios que dependen del despliegue o de usuarios quedan **declarados como pendientes**,
  no como cumplidos.

---

## 6. Matriz de verificación

**Estado al 03/10/2026:**

- **Pendiente:** se ejecuta en el Bloque 3.
- **Preliminar:** hay una medición previa al plan (sección 0).
- **Bloqueado:** espera una corrección.
- **Despliegue:** se ejecuta en el Bloque 6.
- **Fase 7:** requiere usuarios.

### 6.1 Criterios de la línea base, CA-01 a CA-13

| CA | Requisito | Caso | Método | Tipo | Estado |
|---|---|---|---|---|---|
| CA-01 | RF-01 | CP-01: registro, entrada y rechazo de contraseña incorrecta | Prueba funcional | Manual | Pendiente. El registro requiere confirmar por correo y el SMTP por omisión solo entrega a miembros del proyecto (RES-16); ver la sección 12 |
| CA-02 | RF-02 | CP-02: presupuesto de 500 con inicio en lunes → semanas que inician en lunes | Unitaria y funcional | Auto (`calendario.test.ts`) + manual | Preliminar (unitaria) |
| CA-03 | RF-03 | CP-03: compromiso de 600, día 20, 3 ocurrencias → tres fechas límite | Unitaria y funcional | Auto (`vencimientos.test.ts`) + manual | Preliminar (unitaria) |
| CA-04 | RF-07 | CP-04: 500 semanales y 600 en la semana 3 → al menos 200 por semana | Unitaria | Auto (`distribucion.test.ts`) | Preliminar |
| CA-05 | RF-08 | CP-05: 700 de vencimientos con 500 de presupuesto → "Carga alta" | Unitaria y funcional | Auto (`evaluacion.test.ts`) + manual | Preliminar (unitaria) |
| CA-06 | RF-09 | CP-06: meta de 1,000 en dos meses con 300 mensuales → no alcanzable, con el faltante | Unitaria | Auto (`evaluacion.test.ts`) | Preliminar |
| CA-07 | RF-11 | CP-07: descargo visible sin desplazar, en escritorio (1280 × 800) y **en móvil (375 × 812)** | Inspección con medición | Manual, con script de medición versionado | Preliminar (escritorio); **móvil nunca medido** |
| CA-08 | RNF-01 | CP-08: 20 solicitudes cronometradas, al menos 18 en 30 s o menos | Medición | Script versionado | Pendiente (local) y Despliegue (producción) |
| CA-09 | RNF-03 | CP-09: clave de la IA inválida → 5 de 5 planes numéricos con el aviso, **desde la interfaz** | Inyección de fallo | Manual en la interfaz; auto en `degradacion.test.ts` | Preliminar |
| CA-10 | RNF-04 | CP-10: diez o más intentos de acceso cruzado | Prueba de seguridad | Auto (integración) | **Bloqueado por #30** |
| CA-11 | RNF-10 | CP-11: inspección del 100 % de las solicitudes a la IA de una sesión capturada | Inspección de registros | Manual sobre el registro guardado | Preliminar |
| CA-12 | RNF-11 | CP-12: contraste de 4.5:1 o más y el 100 % de los controles operables con teclado | Medición con herramienta | Lighthouse + script + recorrido con teclado | Preliminar (sin herramienta) |
| CA-13 | RF-14 | CP-13: secuencia de créditos; un plan que no cuadra no la muestra; solo con teclado; **paso 5 con "reducir movimiento"** | Unitaria y funcional | Auto (`secuencia.test.ts`) + manual | Preliminar (pasos 1 a 4) |

**Redacción de CA-10 (decisión del 03/10/2026).** El criterio conserva su texto: "devuelven
error de autorización". El sistema deniega la autorización sin decir que el recurso existe, como
exige el control AM-01 (sección 3.6.1):

- la seguridad por fila devuelve **0 filas** en las consultas directas;
- la API responde **404**;
- los intentos de escritura se rechazan con el error **`42501`** de PostgreSQL ("insufficient
  privilege") o no afectan ninguna fila.

El informe registra, por cada intento, la forma concreta de la denegación, y declara el criterio
cumplido si **ninguno** alcanza datos ajenos. No se cambia el sistema para responder 403: eso
revelaría qué identificadores existen. No se requiere solicitud de cambio.

### 6.2 Criterios nuevos, CA-14 a CA-26

La sección 2.10 del documento maestro prevé que los requisitos sin criterio individual reciban
el suyo "en el plan de pruebas" (punto 6.2). CA-14 a CA-25 son esos criterios; CA-26 nació con
SC-09. Se agregan al documento maestro según `docs/verificacion/cambios-al-documento.md`.

| CA | Requisito | Criterio de aceptación | Caso | Método | Tipo | Estado |
|---|---|---|---|---|---|---|
| CA-14 | RF-04 | Al cambiar un compromiso de 600 a 900 y eliminar otro, el plan regenerado aparta según 900 y no incluye el eliminado; un plan guardado antes del cambio sigue mostrando 600 | CP-14 | Integración y funcional | Auto (captura) + manual | Pendiente |
| CA-15 | RF-05 | Un ingreso extraordinario de 1,000 en la semana 3 eleva el disponible de esa semana a presupuesto + 1,000 y no el de ninguna otra | CP-15 | Unitaria y funcional | Auto (`plan.test.ts`) + manual | Pendiente |
| CA-16 | RF-06 | Una meta con fecha de hoy o anterior se rechaza con un mensaje en el campo; una meta válida aparece evaluada en el plan siguiente | CP-16 | Unitaria, integración y funcional | Auto + manual | Pendiente |
| CA-17 | RF-10 | Con el servicio disponible, 5 de 5 planes reciben una explicación no nula que menciona al menos una advertencia del plan y cuyas cifras coinciden al centavo con las del motor | CP-17 | Funcional e inspección | Manual (consume cuota de Gemini) | Pendiente |
| CA-18 | RF-12 | Tras generar 3 planes, `GET /api/planes` los lista en orden descendente; el detalle es idéntico al generado; `DELETE` responde 204, el plan desaparece y un segundo `DELETE` responde 404 | CP-18 | Sistema HTTP | Script versionado | Pendiente |
| CA-19 | RF-13 | Al modificar un dato y pulsar "Recalcular con mis datos", el plan se actualiza sin pedir explicación en **2 s o menos**, 5 de 5 veces | CP-19 | Funcional y medición | Manual con medición | Pendiente. Umbral aprobado el 03/10/2026 |
| CA-20 | RNF-02 | 3 de 3 usuarios sin experiencia previa pasan del registro al primer plan en 8 min o menos, con los perfiles P1 a P3 | CP-20 | Medición con usuarios | Manual | Fase 7 |
| CA-21 | RNF-05 | (a) El 100 % de las contraseñas almacenadas tiene formato bcrypt. (b) En producción, una petición `http://` se redirige con 308 o 301 a `https://`, la respuesta lleva HSTS y el HAR de un recorrido completo tiene 0 peticiones `http://` | CP-21a, CP-21b | (a) Consulta SQL; (b) inspección en el despliegue | (a) Manual con `supabase/verificacion/autenticacion.sql`; (b) manual | (a) Pendiente; (b) Despliegue |
| CA-22 | RNF-06 | `pnpm test` ejecuta los casos de `src/core` con 100 % de resultado satisfactorio y 15 casos o más | CP-22 | Unitaria | Auto | Preliminar: 94 casos del núcleo, todos en verde el 03/10/2026 |
| CA-23 | RNF-07 | Un guion de humo (registro, captura, plan, historial, borrado, créditos, tema, aviso) da 0 defectos bloqueantes en las dos versiones más recientes de Chrome, Edge y Firefox | CP-23 | Prueba funcional por navegador | Manual | Pendiente. **Parcial:** ver la sección 12 |
| CA-24 | RNF-08 | 0 importaciones de `next`, `react` o `@/` en `src/core` y cobertura del motor de 80 % o más | CP-24 | Inspección automatizada | Auto (`pnpm lint`, `pnpm test:cov`) | Preliminar: 99.19 % en líneas |
| CA-25 | RNF-09 | Partiendo del repositorio y de `.env.example`, un despliegue nuevo en Vercel queda sirviendo `/` con HTTP 200 en 15 min o menos, cronometrado | CP-25 | Medición en el despliegue | Manual cronometrado | Despliegue |
| CA-26 | RF-15 | Sin sesión, el aviso integral se abre en un clic desde la portada y desde las pantallas de acceso, con su versión y su fecha; con sesión, desde la barra. Sin la casilla de consentimiento no se crea la cuenta, aunque la petición omita la interfaz | CP-26 | Unitaria y funcional | Auto (`validacion.test.ts`, `rutas.test.ts`) + manual | Preliminar |

### 6.3 Qué bloquea la liberación

Se ejecutan primero, en este orden: **CA-10** (tras #30), **CA-26**, **CA-07** en móvil,
**CA-12**, **CA-09**, **CA-11** y **CA-01**. Son los que, si fallan, producen un defecto
bloqueante o mayor según la sección 3: seguridad, obligación legal, descargo y accesibilidad.

---

## 7. Datos de prueba

### 7.1 Perfiles P1 a P3

Ficticios y contrastantes, como prevén RES-14 y la contingencia de riesgos del documento
maestro. Ningún perfil usa nombres de personas, instituciones financieras, cuentas ni correos
reales. Los resultados esperados se calcularon con el motor real (`calcularPlan`) con fecha de
referencia **lunes 05/10/2026** (evidencia del punto 6, parte H).

| Perfil | Qué ejercita | Presupuesto | Compromisos (denominación · monto · fecha límite · meses) | Opcionales | Resultado esperado del motor |
|---|---|---|---|---|---|
| **P1 · Ingreso muy ajustado** | Déficit repetido y sobrecarga | 700 semanales, inicio lunes | Renta · 1,800 · 05/11/2026 · 3. Transporte · 600 · 15/10/2026 · 3. Servicio de internet · 350 · 20/10/2026 · 3. Teléfono · 250 · 28/10/2026 · 3 | Ninguno | 14 semanas. Sobrecargadas: 5, 9, 11 y 14. En déficit: 1, 2, 6, 7, 8 y 9. Remanente mínimo: −139.17 |
| **P2 · Vencimiento grande a corto plazo** | Déficit concentrado al inicio | 1,500 semanales, inicio jueves | Inscripción escolar · 6,000 · 16/10/2026 · 1. Renta · 2,000 · 01/11/2026 · 3. Gimnasio · 300 · 25/10/2026 · 3 | Ninguno | 14 semanas. En déficit: 1, 2 y 3 (remanente mínimo −975; apartado máximo 2,475). Sobrecargadas: 3, 5, 9 y 14 |
| **P3 · Meta poco realista** | Meta no viable con ingreso extra | 2,000 semanales, inicio domingo | Renta · 2,500 · 03/11/2026 · 2. Servicios del hogar · 600 · 22/10/2026 · 2 | Ingreso extra de 1,000 el 23/10/2026; meta de 25,000 al 04/12/2026 | 9 semanas, sin déficit. Meta no alcanzable: ahorro posible 12,800 y faltante 12,200 |

**Si se capturan otro día.** Las semanas y los remanentes dependen de la fecha de referencia.
Antes de ejecutar, el resultado esperado se recalcula con el script de perfiles que se versiona
en el Bloque 3 (`docs/verificacion/scripts/perfiles.sim.ts`), y el registro anota la fecha de
referencia usada. **No se compara contra la tabla anterior si la fecha no coincide.**

### 7.2 Guion de captura (cuenta de capturas)

Se repite por perfil. Antes de cambiar de perfil se eliminan los pagos, los ingresos y la meta
del perfil anterior.

1. Iniciar sesión con la cuenta de capturas y abrir `/panel`.
2. **Tu presupuesto:**
   - En "¿Cuánto dinero recibes cada semana?", escribir el presupuesto del perfil (sin signo ni
     comas: `700`).
   - En "¿Qué día inicia tu semana?", elegir el día del perfil.
   - Pulsar **Guardar presupuesto**.
   - *Esperado:* la tarjeta muestra el resumen con el monto y el día.
3. **Tus pagos con fecha límite.** Por cada compromiso, en orden:
   - En "¿Qué pago es?", escribir la denominación.
   - En "Monto de cada pago", el monto (`1800`).
   - En "Fecha límite", la fecha (`05/11/2026`).
   - En "¿Cuántos meses?", el número (1 = "Una sola vez").
   - Pulsar **Agregar pago**.
   - *Esperado:* el pago aparece en la lista y el total se actualiza.
4. Pulsar **Generar mi plan**.
   - *Esperado:* el foco salta al resultado con el descargo visible y las semanas señaladas del
     perfil.
   - Anotar la hora de la pulsación y la de la llegada del plan.
5. **Solo P3**, en la sección opcional:
   - Ingreso extra: en "¿De cuánto?" escribir `1000`; en "¿Qué día lo recibes?", `23/10/2026`.
     Pulsar **Agregar ingreso**.
   - Meta: en "¿Cuánto quieres ahorrar?" escribir `25000`; en "¿Para cuándo?", `04/12/2026`.
     Pulsar **Guardar meta**.
   - Pulsar **Recalcular con mis datos**.
   - *Esperado:* la tarjeta "Tu meta de ahorro" la declara no alcanzable, con el faltante.
6. Comparar las semanas sobrecargadas, las semanas en déficit y la meta con el resultado
   esperado recalculado (7.1). Cualquier diferencia es un defecto **mayor** hasta que se
   demuestre lo contrario.

### 7.3 Entradas inválidas y hostiles

| Entrada | Dónde | Esperado |
|---|---|---|
| `-500`, `0`, `500.005`, `1e3`, texto | Monto del presupuesto o de un pago | Mensaje en el campo con `aria-invalid`; nada se guarda |
| `31/02/2026`, mes 13, fecha vacía | Fecha límite | Mensaje en el campo |
| Meta con fecha de hoy o anterior | "¿Para cuándo?" | Rechazo (CA-16) |
| Denominación `<script>alert(1)</script>`, emojis, 81 caracteres o más (el máximo es 80) | "¿Qué pago es?" | Texto escapado, sin ejecución; rechazo por longitud |
| `POST /api/planes` con JSON mal formado, con sesión | API | 400 |
| `/iniciar-sesion?siguiente=//sitio.example` | Inicio de sesión | Tras entrar, permanece en la aplicación (CWE-601) |
| Registro sin la casilla, con la casilla quitada del DOM | `/registro` | Rechazo en el servidor (CA-26) |

---

## 8. Antes y después del despliegue

| Momento | Qué se ejecuta |
|---|---|
| **Antes del despliegue** (Bloque 3, entorno local con `pnpm build` + `pnpm start`) | CA-01 a CA-07, CA-08 (local), CA-09 a CA-19, CA-21a, CA-22 a CA-24 y CA-26 |
| **Durante el despliegue** (Bloque 6) | CA-25: cronómetro desde el repositorio hasta HTTP 200 |
| **Después del despliegue**, sobre la URL de producción | **CA-21b** (redirección, HSTS y HAR); **CA-08 en producción** (20 solicitudes); prueba de humo (guion de CA-23 en un navegador); juego final de capturas con la cuenta de capturas y P1 a P3, **desde un commit etiquetado** |
| **Fase 7** | CA-20 con usuarios |

Supabase es el **mismo proyecto** antes y después del despliegue. Lo que cambia es el servidor
de la aplicación, la red y el arranque en frío de Vercel. Por eso CA-08 se mide en los dos
entornos y solo la medición en producción cuenta para RNF-01 en el informe.

---

## 9. Política de regresión

1. **Todo defecto corregido recibe una prueba que falla antes de la corrección y pasa después.**
   Si no puede automatizarse, se documenta el caso manual que lo protege y el motivo.
2. Antes y después de cada corrección se guarda el JSON de Vitest en `docs/verificacion/`, con
   el nombre `AAAA-MM-DD-<nivel>-<motivo>.json`. Si la corrección toca C-05 o C-07, también la
   integración.
3. **Suite mínima antes de cada commit:** `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm test`.
   **Antes de cada pull request**, además: `pnpm build` y `pnpm test:integracion` si el cambio
   toca la persistencia o las pruebas.
4. **Defectos ya corregidos sin protección automática**, identificados en la evidencia del punto
   6:
   - las dos regresiones de CA-07;
   - las capas de CSS que mostraban "Crear cuenta" en móvil;
   - el panel en blanco hasta hidratar.

   Hoy solo los protege una prueba manual: CP-07 en escritorio y móvil, y la inspección de
   `/` a 375 px. Su protección automática depende de la solicitud de cambio de la sección 10.3.
5. Ningún resultado de `pnpm test:integracion` se cita sin leer **cuántas** pruebas corrieron. Sin
   `.env.local`, termina en verde con solo los 2 marcadores.

---

## 10. Herramientas, artefactos y decisiones pendientes

### 10.1 Artefactos que este plan obliga a versionar (Bloque 3)

| Artefacto | Destino | Para qué |
|---|---|---|
| Script de contraste (hoy solo en una carpeta temporal) | `docs/verificacion/scripts/contraste.js` | CA-12 |
| Script de medición de la posición del descargo | `docs/verificacion/scripts/descargo.js` | CA-07 |
| Script de cronometraje del flujo NDJSON | `docs/verificacion/scripts/cronometro-plan.mjs` | CA-08 y CA-19 |
| Script de perfiles | `docs/verificacion/scripts/perfiles.sim.ts` | Resultados esperados de P1 a P3 (7.1) |
| Registros y JSON de cada ejecución | `docs/verificacion/` | Evidencia |

Los scripts no se importan desde `src/` ni entran en la compilación.

### 10.2 Lighthouse y axe

Lighthouse viene incluido en Chrome 154 y no requiere instalar nada. axe-core requiere
descargar un paquete: **el responsable lo autorizó el 03/10/2026**. Se ejecuta con
`pnpm dlx @axe-core/cli`, sin agregarlo a `package.json`, como segunda opinión de Lighthouse.

### 10.3 Pruebas de interfaz automatizadas

**No se instalan sin una solicitud de cambio.** En el Bloque 3 se propondrá una SC con la
herramienta, la licencia, el costo, el alcance y los tres defectos de interfaz que protegería
(9.4). Este plan no depende de ella: todos sus casos tienen ejecución manual.

### 10.4 Decisiones del responsable (03/10/2026)

| # | Decisión pedida | Respuesta |
|---|---|---|
| 1 | Umbral de 2 s para CA-19 | Aprobado |
| 2 | Redacción de CA-10 | Se conserva "error de autorización". El resultado se informa como denegación sin revelar la existencia: 0 filas, 404 o `42501` (sección 6.1). Sin solicitud de cambio |
| 3 | Texto de CA-14 a CA-25 | Aprobado |
| 4 | Uso de axe-core | Autorizado, con `pnpm dlx` y sin dependencia nueva |

---

## 11. Defectos conocidos al iniciar la ejecución

| # | Título | Severidad | Prioridad | Estado | Efecto en el plan |
|---|---|---|---|---|---|
| 27 | Las pruebas de integración borran la captura del usuario A | Menor | Media | Corregido y verificado el 03/10/2026; se cierra con el pull request | Ninguno |
| 30 | La prueba de CA-10 cuenta las filas propias de B como acceso cruzado | Menor | Media | Abierto | **Bloquea CP-10** |
| 31 | La aplicación no publica el aviso de privacidad que exige RES-08 | Mayor | Alta | Corregido por SC-09 (#32); se cierra con el pull request | CP-26 lo verifica |

---

## 12. Limitaciones declaradas

| Limitación | Consecuencia | Tratamiento |
|---|---|---|
| **Safari** no se puede ejecutar en Windows, y el WebKit de Playwright no es Safari | RNF-07 no se verifica en Safari | Se declara. CA-23 se mide en Chrome, Edge y Firefox. Si se consigue un dispositivo Apple antes de la Fase 7, se agrega |
| **"Dos últimas versiones"** de cada navegador | Hoy solo hay una versión de Chrome y una de Edge, y Firefox no está instalado | Instalar Firefox y su versión ESR y usar Chrome for Testing para la versión anterior requiere descargas: se pedirá autorización en el Bloque 3. Si no se autorizan, CA-23 se declara parcial |
| **RNF-02 con usuarios** | No se puede verificar en la Fase 5 | CA-20 pasa a la Fase 7 |
| **CA-01 y el SMTP** | Sin SMTP propio (RES-16), el registro solo confirma correos de miembros del proyecto, a 2 por hora | CA-01 se ejecuta con una cuenta autoconfirmada creada en el panel, más el registro real de una cuenta con el correo de un miembro. Se repite tras configurar el SMTP propio en la Fase 6 |
| **Un solo proyecto de Supabase** para el desarrollo, las pruebas y la producción | Las pruebas de integración escriben en la base de producción | Usuarios de prueba con dominio `.test` y borrado propio. Se declara como riesgo en el informe |
| **Node 25 en desarrollo y Node 24 en producción** | Diferencia de entorno | La comparación del 03/10/2026 no mostró diferencias; se vuelve a comprobar en el despliegue |
| **Cuota del plan gratuito de Gemini** | CA-17 y CA-11 consumen cuota | Se ejecutan una vez cada uno, con la sesión registrada |
| **Los puntos legales del aviso** | No se verificaron contra el texto vigente de la ley | Se declararon como supuestos en SC-09 (#32) |
| **Cambios de fecha** | Los resultados de P1 a P3 dependen del día | Se recalculan con el script de perfiles (7.1) |

# PLAN.md — Ahorrito

> Documento de trabajo para el desarrollo. Vive en `docs/` y es la
> referencia que debe leerse al inicio de cualquier sesión de trabajo sobre el código.
> La documentación normativa completa vive en el documento maestro
> (`docs/ACS-U1-APP-AvilaNeriAbdiel.docx`); aquí solo está lo necesario para construir.

---

## 1. Contexto del proyecto

### 1.1 Qué es Ahorrito

Sistema web que calcula un **plan semanal de asignación de dinero** a partir de tres entradas
declaradas por el usuario: su presupuesto periódico, sus compromisos de pago con fecha límite
y su meta de ahorro. Devuelve cuánto debe apartar cada semana para que ningún pago llegue
tarde, señala las semanas sobrecargadas y acompaña el resultado con una explicación en
lenguaje natural generada por un modelo de inteligencia artificial.

El plan es una **sugerencia de organización personal, no asesoría financiera profesional**.
Ese descargo debe estar visible en la pantalla del plan (RF-11).

### 1.2 Contexto académico

| Dato | Valor |
|---|---|
| Asignatura | Administración de la Calidad del Software |
| Norma de referencia | ISO/IEC/IEEE 12207:2026, complementada con 29148 e ISO/IEC 25010 |
| Alumno | Abdiel Ávila Neri, grupo 702, UAEH Escuela Superior de Tlahuelilpan |
| Periodo | 10 de agosto – 13 de noviembre de 2026 (14 semanas) |
| Construcción | Semanas 8 a 12 |
| Equipo | Una persona, que asume los roles de cliente, analista, diseñador, programador, tester y líder |

Cada punto de la lista de verificación de la norma exige evidencia. Por eso el repositorio no
es solo un lugar donde guardar código: **el historial de commits, los pull requests y las
incidencias son la evidencia auditable** de los puntos 4.2, 4.3, 4.4, 4.6, 4.7 y 4.8.

### 1.3 Arquitectura

Arquitectura por capas con **núcleo de dominio aislado**, versión simplificada del patrón de
puertos y adaptadores.

| ID | Componente | Ubicación | Responsabilidad |
|---|---|---|---|
| C-01 | Interfaz web | `src/app`, `src/components` | Captura de datos y presentación del plan |
| C-02 | Orquestador de planes | `src/app/api/planes` | Valida, invoca el núcleo, pide la explicación, persiste |
| C-03 | Motor de cálculo determinista | `src/core` | Genera vencimientos, reparte el presupuesto, evalúa la meta |
| C-04 | Adaptador de IA | `src/adapters/ia` | Construye la solicitud anonimizada y aplica el tiempo límite |
| C-05 | Adaptador de persistencia | `src/adapters/persistencia` | Traduce entre dominio y base de datos |
| C-06 | Autenticación | Supabase Auth | Registro, inicio de sesión y sesión |
| C-07 | Base de datos | Supabase (PostgreSQL) | Almacenamiento con aislamiento por fila |

**Regla estructural no negociable:** ningún archivo de `src/core` puede importar Next.js,
React, Supabase ni nada de `src/app`. Es el requisito RNF-08 expresado como estructura de
carpetas y está verificado por una regla de ESLint. Si esa regla falla, el problema es el
código, no la regla.

### 1.4 Estructura de carpetas

```
ahorrito/
├── README.md
├── .env.example
├── .env.local              ← nunca versionado
├── eslint.config.mjs
├── vitest.config.mts       ← extensión .mts: módulo ESM (import.meta.dirname)
├── pnpm-lock.yaml
├── docs/
│   ├── Ahorrito-PLAN.md
│   ├── GITFLOW.md
│   ├── ACS-U1-APP-AvilaNeriAbdiel.docx
│   └── diagramas/          ← archivos .mmd versionados
└── src/
    ├── app/
    │   ├── (auth)/         ← registro e inicio de sesión
    │   ├── (app)/          ← pantallas autenticadas
    │   ├── api/
    │   │   └── planes/
    │   │       └── route.ts
    │   ├── layout.tsx
    │   └── page.tsx
    ├── core/               ← C-03. Sin dependencias externas
    │   ├── tipos.ts
    │   ├── calendario.ts       (M-01)
    │   ├── vencimientos.ts     (M-02)
    │   ├── distribucion.ts     (M-03)
    │   ├── evaluacion.ts       (M-04)
    │   ├── plan.ts             ← función de entrada calcularPlan()
    │   └── *.test.ts
    ├── ports/              ← contratos I-02, I-03, I-04
    │   ├── explicacion.ts
    │   └── repositorio.ts
    ├── adapters/
    │   ├── ia/             ← C-04
    │   └── persistencia/   ← C-05
    ├── components/         ← C-01
    └── lib/                ← utilidades compartidas
```

### 1.5 Requisitos por implementar

**Funcionales**

| ID | Requisito | Prioridad | Fase |
|---|---|---|---|
| RF-01 | Registro y autenticación con correo y contraseña | Alta | F2 |
| RF-02 | Capturar presupuesto periódico con día de inicio de semana | Alta | F4 |
| RF-03 | Registrar compromisos con denominación, monto, fecha límite y ocurrencias | Alta | F4 |
| RF-04 | Modificar y eliminar compromisos | Media | F4 |
| RF-05 | Registrar ingresos extraordinarios | Media | F4 |
| RF-06 | Establecer meta de ahorro con monto y fecha objetivo | Alta | F4 |
| RF-07 | Calcular la distribución semanal | Alta | **F1** |
| RF-08 | Identificar y señalar semanas sobrecargadas | Alta | **F1** |
| RF-09 | Evaluar la viabilidad de la meta de ahorro | Alta | **F1** |
| RF-10 | Generar la explicación en lenguaje natural | Alta | F3 |
| RF-11 | Mostrar el descargo de responsabilidad | Alta | F4 |
| RF-12 | Almacenar y consultar los planes generados | Media | F2 |
| RF-13 | Regenerar el plan ante cambios en los datos | Media | F4 |

**No funcionales**

| ID | Característica ISO/IEC 25010 | Indicador |
|---|---|---|
| RNF-01 | Eficiencia de desempeño | Plan entregado en 30 s o menos en el 90 % de las solicitudes |
| RNF-02 | Usabilidad | Primer plan en 8 minutos o menos desde el registro |
| RNF-03 | Fiabilidad | Plan numérico entregado en el 100 % de las ejecuciones sin servicio de IA |
| RNF-04 | Seguridad, confidencialidad | 0 registros ajenos accesibles en 10 intentos de acceso cruzado |
| RNF-05 | Seguridad, autenticidad | Contraseñas con derivación de clave; 100 % del tráfico cifrado |
| RNF-06 | Adecuación funcional | 100 % de las pruebas unitarias del motor en verde, mínimo 15 casos |
| RNF-07 | Compatibilidad | 0 defectos bloqueantes en las dos últimas versiones de los navegadores mayoritarios |
| RNF-08 | Mantenibilidad | `src/core` sin importaciones del marco; cobertura del motor 80 % o más |
| RNF-09 | Portabilidad | Despliegue reproducible en 15 minutos o menos desde el repositorio |
| RNF-10 | Seguridad, privacidad | 0 datos identificables enviados al proveedor de IA |
| RNF-11 | Usabilidad, accesibilidad | Contraste 4.5:1 o mayor; 100 % de los controles operables por teclado |

### 1.6 Reglas de negocio

1. La semana presupuestal inicia el día configurado por el usuario, no necesariamente el lunes.
2. Un compromiso recurrente se registra una sola vez con su número de ocurrencias, entre 1 y 6;
   las fechas de vencimiento se derivan en tiempo de cálculo y **no se almacenan**.
3. El horizonte de planificación es de 6 meses como máximo, o hasta la fecha más lejana entre la última fecha límite registrada y la fecha objetivo de la meta de ahorro, lo que ocurra primero (SC-01).
4. Los importes se manejan en pesos mexicanos con dos decimales. **Nunca en punto flotante**:
   aritmética de enteros en centavos dentro del motor y `numeric(12,2)` en la base de datos.
5. La explicación del modelo de lenguaje es opcional. Un plan sin explicación es un estado válido.
6. Solo el presupuesto y al menos un compromiso son obligatorios. La meta de ahorro y los
   ingresos extraordinarios se piden después de mostrar el primer plan.

---

## 2. Reglas de desarrollo

### 2.1 Gestor de paquetes

**Se usa pnpm exclusivamente.** No debe existir `package-lock.json` ni `yarn.lock` en el
repositorio; si aparece alguno, se elimina. El único archivo de bloqueo válido es
`pnpm-lock.yaml` y va versionado.

| Acción | Comando |
|---|---|
| Instalar dependencias | `pnpm install` |
| Agregar dependencia | `pnpm add <paquete>` |
| Agregar dependencia de desarrollo | `pnpm add -D <paquete>` |
| Ejecutar en desarrollo | `pnpm dev` |
| Compilar | `pnpm build` |
| Pruebas | `pnpm test` |
| Pruebas con cobertura | `pnpm test:cov` |
| Análisis estático | `pnpm lint` |

### 2.2 Ramas

Git Flow reducido a tres tipos de rama. El detalle operativo está en `GITFLOW.md`.

| Rama | Propósito | Reglas |
|---|---|---|
| `main` | Versiones liberadas | Protegida. Solo recibe cambios por pull request desde `dev`. Cada fusión lleva etiqueta de versión |
| `dev` | Integración | Rama base de todas las funcionalidades |
| `feature/*` | Una implementación | Nace de `dev` y regresa a `dev` por pull request |

### 2.3 Cada implementación es un feature

Ninguna funcionalidad se escribe directamente sobre `dev`. Toda unidad de trabajo:

1. Nace como rama `feature/<nombre-corto>` a partir de `dev` actualizada.
2. Corresponde a uno o varios requisitos identificados; el identificador aparece en la
   descripción del pull request.
3. Se integra a `dev` mediante pull request, aunque el revisor sea la misma persona que
   escribió el código.

Esa última condición parece un formalismo y no lo es: el pull request es la única evidencia
que existe del punto 4.4 de la lista de verificación. Sin él, ese punto se califica en cero.

### 2.4 Convención de commits

Formato: `<tipo>(<alcance>): <descripción en imperativo>`

| Tipo | Uso |
|---|---|
| `feat` | Funcionalidad nueva |
| `fix` | Corrección de un defecto |
| `test` | Pruebas nuevas o modificadas |
| `docs` | Documentación |
| `refactor` | Cambio interno sin alterar el comportamiento |
| `chore` | Configuración, dependencias, tareas de mantenimiento |
| `style` | Formato, sin cambio funcional |

Descripción en minúscula, sin punto final, en imperativo. Cuando el commit implementa un
requisito, se cita en el cuerpo:

```
feat(core): calcula la distribucion semanal del presupuesto

Implementa RF-07. El reparto cubre cada vencimiento antes de su fecha
limite y aparta el remanente hacia la meta de ahorro.
```

**Un commit es un cambio coherente y completo.** No se acumulan tres funcionalidades en un
commit ni se parte una función a la mitad. Si al describir el commit hace falta la palabra
"y", probablemente son dos commits.

### 2.5 Reglas de código

1. `src/core` no importa Next.js, React, Supabase ni nada de `src/app`. Verificado por ESLint.
2. TypeScript en modo estricto. Ningún `any` sin un comentario que lo justifique.
3. Toda función exportada del núcleo tiene al menos una prueba unitaria.
4. Ninguna clave, token o credencial se escribe en un archivo versionado. Las variables van en
   `.env.local` y se declaran vacías en `.env.example`.
5. Las llamadas al servicio de IA se ejecutan solo en el servidor.
6. La validación de la entrada se hace en el servidor aunque también exista en el cliente.
7. Los importes se calculan en centavos enteros y solo se formatean a decimales al presentarlos.

### 2.6 Registro de defectos y cambios

| Situación | Acción |
|---|---|
| Se encuentra un error | Incidencia con etiqueta `defecto` y su prioridad |
| Se solicita un cambio de alcance | Incidencia `cambio` con identificador `SC-nn`, evaluada contra la matriz de trazabilidad |
| Se termina una funcionalidad | El pull request cierra la incidencia correspondiente |

### 2.7 Definición de terminado

- [ ] El código implementa el requisito citado.
- [ ] `pnpm lint` pasa sin errores.
- [ ] `pnpm test` pasa sin fallos.
- [ ] Si es del núcleo, tiene pruebas unitarias propias.
- [ ] El pull request está fusionado a `dev`.
- [ ] La documentación afectada quedó actualizada.

---

## 3. Plan de desarrollo por fases

### Fase 0 — Preparación del entorno *(manual, previa)*

```bash
pnpm create next-app@latest ahorrito --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
cd ahorrito
pnpm add -D vitest @vitest/coverage-v8
```

Configurar: `.gitignore` con `.env*.local`; `.env.example` con las cuatro variables vacías;
regla de ESLint que restringe las importaciones dentro de `src/core`; `vitest.config.ts`; y los
scripts `test` y `test:cov` en `package.json`. En GitHub: proteger `main` exigiendo pull
request, y crear las etiquetas `defecto`, `cambio`, `requisito` y las tres de prioridad.

**Commits**

| # | Mensaje |
|---|---|
| 1 | `chore: inicializa el proyecto con next.js, typescript y tailwind` |
| 2 | `chore: adopta pnpm como gestor unico de paquetes` |
| 3 | `chore(lint): restringe importaciones del marco dentro de src/core` |
| 4 | `chore(test): configura vitest y los scripts de prueba` |
| 5 | `docs: agrega PLAN.md y GITFLOW.md` |
| 6 | `chore: agrega .env.example y excluye los archivos de entorno` |

**Salida:** repositorio con `main` y `dev`, proyecto compilando, `pnpm test` ejecutándose.

---

### Fase 1 — Motor de cálculo determinista (C-03)

**Semana 8 · Rama:** `feature/motor-calculo` · **Requisitos:** RF-07, RF-08, RF-09, RNF-06, RNF-08

Es la fase más importante del proyecto y se construye primero por decisión de diseño: todo lo
demás se apoya en ella y es el único componente cuyo error tiene consecuencias financieras
para el usuario.

| Paso | Módulo | Contenido |
|---|---|---|
| 1.1 | `tipos.ts` | Tipos del dominio: `EntradaPlan`, `Compromiso`, `Vencimiento`, `Plan`, `AsignacionSemanal` |
| 1.2 | `calendario.ts` (M-01) | Genera las semanas del horizonte a partir del día de inicio configurado |
| 1.3 | `vencimientos.ts` (M-02) | Deriva las fechas de vencimiento de los compromisos recurrentes |
| 1.4 | `distribucion.ts` (M-03) | Reparte el presupuesto cubriendo cada vencimiento antes de su fecha |
| 1.5 | `evaluacion.ts` (M-04) | Detecta semanas sobrecargadas y evalúa la viabilidad de la meta |
| 1.6 | `plan.ts` | Compone los cuatro módulos en `calcularPlan(entrada): Plan` |

**Casos de prueba obligatorios (mínimo 15, exigidos por OBJ-03 y RNF-06)**

Holgura amplia · déficit total · vencimiento coincidente con el inicio de semana · compromiso
de 6 ocurrencias · día de inicio distinto de lunes · meta alcanzable · meta no alcanzable ·
ingreso extraordinario que rescata una semana · dos vencimientos en la misma semana ·
compromiso que vence el primer día del horizonte · compromiso que vence el último día ·
presupuesto exactamente igual al total de compromisos · redondeo de centavos · horizonte
truncado a 6 meses · entrada sin meta de ahorro.

**Commits**

| # | Mensaje |
|---|---|
| 1 | `feat(core): define los tipos del dominio del plan` |
| 2 | `feat(core): genera las semanas del horizonte de planificacion` |
| 3 | `test(core): cubre la generacion de semanas con dia de inicio configurable` |
| 4 | `feat(core): deriva los vencimientos de los compromisos recurrentes` |
| 5 | `test(core): cubre la derivacion de vencimientos multimensuales` |
| 6 | `feat(core): reparte el presupuesto entre las semanas del horizonte` |
| 7 | `test(core): cubre el reparto en escenarios de holgura y deficit` |
| 8 | `feat(core): detecta semanas sobrecargadas y evalua la meta de ahorro` |
| 9 | `test(core): cubre la deteccion de sobrecarga y la viabilidad de la meta` |
| 10 | `feat(core): compone el motor en la funcion calcularPlan` |
| 11 | `test(core): agrega pruebas de integracion del motor completo` |
| 12 | `docs: documenta el contrato de entrada y salida del motor` |

**Criterio de salida:** 15 o más pruebas en verde, cobertura del núcleo del 80 % o más,
ninguna importación del marco dentro de `src/core`. Al fusionar a `dev`, etiquetar `v0.1.0`.

---

### Fase 2 — Persistencia y autenticación (C-05, C-06, C-07)

**Semana 9 · Rama:** `feature/persistencia-auth` · **Requisitos:** RF-01, RF-12, RNF-04, RNF-05

| Paso | Contenido |
|---|---|
| 2.1 | Esquema SQL de las siete tablas del modelo entidad-relación |
| 2.2 | Políticas de seguridad por fila en todas las tablas |
| 2.3 | Cliente de Supabase para servidor y para navegador |
| 2.4 | Registro, inicio de sesión, cierre de sesión y protección de rutas |
| 2.5 | Puerto `repositorio.ts` y su adaptador |
| 2.6 | Guardado y consulta de planes |

**Commits**

| # | Mensaje |
|---|---|
| 1 | `feat(db): define el esquema relacional de las siete tablas` |
| 2 | `feat(db): habilita seguridad por fila con politicas por usuario` |
| 3 | `feat(auth): integra el registro y el inicio de sesion` |
| 4 | `feat(auth): protege las rutas autenticadas` |
| 5 | `feat(ports): define el contrato del repositorio de planes` |
| 6 | `feat(adapters): implementa el adaptador de persistencia sobre supabase` |
| 7 | `test(adapters): verifica el aislamiento entre usuarios` |

**Criterio de salida:** diez intentos de acceso cruzado devuelven conjunto vacío (CA-10).

---

### Fase 3 — Integración con la inteligencia artificial (C-04)

**Semana 10 · Rama:** `feature/adaptador-ia` · **Requisitos:** RF-10, RNF-03, RNF-10

| Paso | Contenido |
|---|---|
| 3.1 | Puerto `explicacion.ts` que admite valor nulo como resultado válido |
| 3.2 | Construcción de la carga anonimizada: montos, fechas y etiquetas genéricas |
| 3.3 | Cliente de Gemini con tiempo límite de 20 segundos |
| 3.4 | Orquestador `POST /api/planes` que responde el plan antes de pedir la explicación |
| 3.5 | Manejo del fallo: el plan se entrega con aviso de explicación no disponible |

**Commits**

| # | Mensaje |
|---|---|
| 1 | `feat(ports): define el contrato de explicacion con resultado opcional` |
| 2 | `feat(adapters): construye la carga anonimizada para el modelo` |
| 3 | `test(adapters): verifica que la carga no contiene datos identificables` |
| 4 | `feat(adapters): integra la api de gemini con limite de tiempo` |
| 5 | `feat(api): orquesta la generacion del plan en el route handler` |
| 6 | `feat(api): entrega el plan numerico antes de solicitar la explicacion` |
| 7 | `test(api): verifica la degradacion cuando el servicio de ia falla` |

**Criterio de salida:** cinco ejecuciones con el servicio deshabilitado entregan el plan
numérico completo (CA-09).

---

### Fase 4 — Interfaz de usuario (C-01)

**Semanas 10 y 11 · Rama:** `feature/interfaz` · **Requisitos:** RF-02 a RF-06, RF-11, RF-13, RNF-02, RNF-11

| Paso | Contenido |
|---|---|
| 4.1 | Captura del presupuesto con selector de día de inicio de semana |
| 4.2 | Alta, edición y baja de compromisos |
| 4.3 | Captura opcional de ingresos extraordinarios y meta de ahorro, posterior al primer plan |
| 4.4 | Vista del plan con las asignaciones semanales y las semanas marcadas |
| 4.5 | Descargo de responsabilidad visible sin desplazamiento |
| 4.6 | Regeneración del plan al modificar los datos |
| 4.7 | Contraste, foco visible y navegación por teclado |

**Commits**

| # | Mensaje |
|---|---|
| 1 | `feat(ui): agrega el formulario de captura del presupuesto` |
| 2 | `feat(ui): agrega la gestion de compromisos de pago` |
| 3 | `feat(ui): agrega la captura opcional de ingresos y meta de ahorro` |
| 4 | `feat(ui): presenta el plan semanal con las semanas sobrecargadas` |
| 5 | `feat(ui): muestra el descargo de responsabilidad en la vista del plan` |
| 6 | `feat(ui): regenera el plan al modificar los datos de entrada` |
| 7 | `style(ui): ajusta contraste y foco conforme al nivel AA` |
| 8 | `test(ui): verifica la operabilidad por teclado de los controles` |

**Criterio de salida:** el flujo completo se recorre en menos de 8 minutos con un usuario sin
experiencia previa. Al fusionar, etiquetar `v0.9.0`.

---

### Fase 5 — Verificación

**Semanas 11 y 12 · Rama:** `feature/verificacion` · **Requisitos:** puntos 6.1 a 6.10

Plan de pruebas, ejecución de los criterios de aceptación CA-01 a CA-12, medición de RNF-01
sobre 20 solicitudes, pruebas de acceso cruzado, verificación de contraste, registro de
defectos como incidencias, corrección y pruebas de regresión.

**Commits**

| # | Mensaje |
|---|---|
| 1 | `docs(test): agrega el plan de pruebas y los casos definidos` |
| 2 | `test: ejecuta y registra los criterios de aceptacion CA-01 a CA-12` |
| 3 | `fix: corrige los defectos detectados en verificacion` |
| 4 | `test: agrega pruebas de regresion sobre los defectos corregidos` |
| 5 | `docs(test): registra el informe de resultados de pruebas` |

---

### Fase 6 — Despliegue y liberación

**Semana 12 · Rama:** `feature/despliegue` · **Requisitos:** puntos 8.1 a 8.7

Variables de entorno en Vercel, despliegue, verificación del entorno productivo, manual de
instalación, procedimiento de reversión y acta de liberación.

**Commits**

| # | Mensaje |
|---|---|
| 1 | `chore(deploy): configura el despliegue en vercel` |
| 2 | `docs: agrega el manual de instalacion y configuracion` |
| 3 | `docs: agrega el procedimiento de reversion de version` |

**Criterio de salida:** aplicación accesible en la URL de producción. Fusión a `main` con
etiqueta `v1.0.0` y acta de liberación firmada.

---

### Fase 7 — Validación y cierre

**Semanas 13 y 14.**

Validación con los tres usuarios representativos usando perfiles ficticios contrastantes,
medición de OBJ-02 y OBJ-05, informe de validación, documentación de operación, mantenimiento
y retiro, y evaluación final contra la lista de verificación.

---

## 4. Trazabilidad de código a requisitos

Al cerrar cada fase se actualizan las columnas de implementación y prueba de la matriz de
trazabilidad del documento maestro (sección 2.7).

| Requisito | Componente | Archivo principal | Prueba |
|---|---|---|---|
| RF-07 | C-03 | `src/core/distribucion.ts` | `distribucion.test.ts` |
| RF-08 | C-03 | `src/core/evaluacion.ts` | `evaluacion.test.ts` |
| RF-09 | C-03 | `src/core/evaluacion.ts` | `evaluacion.test.ts` |
| RF-01 | C-06 | `src/app/(auth)` | CA-01 |
| RF-10 | C-04 | `src/adapters/ia` | CA-09 |
| RF-11 | C-01 | `src/components` | CA-07 |

---

## 5. Riesgos vigentes durante la construcción

| ID | Riesgo | Disparador | Contingencia |
|---|---|---|---|
| RSG-08 | Complejidad subestimada del motor | Al quinto de los ocho días de la Fase 1, `distribucion.ts` no pasa sus pruebas | Reducir el horizonte de 6 meses a 1 y registrarlo como cambio de alcance |
| RSG-04 | Dedicación semanal insuficiente | Un entregable semanal queda incompleto al cierre de la semana | Recortar RF-12 y RF-13, identificados como prescindibles en el acta de alcance |
| RSG-01 | Cuota gratuita del servicio de IA agotada | Error de cuota en la API | Sustituir el proveedor o entregar el plan sin explicación conforme a RNF-03 |
| RSG-05 | Credencial expuesta en el repositorio | Una clave aparece en un commit | Revocar y regenerar de inmediato en el panel del proveedor |

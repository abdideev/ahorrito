# Liberación de Ahorrito v1.0.0

Puntos 8.1 a 8.7 de la lista de verificación. Este documento describe cómo se libera la
versión, qué contiene, cómo se instala y configura, cómo se revierte y deja el acta de liberación.

| Dato | Valor |
|---|---|
| Versión | **v1.0.0** |
| Fecha prevista | 04/10/2026 |
| Responsable de la liberación | Abdiel Avila Neri (líder y cliente, STK-01) |
| URL de producción | https://ahorrito-nine.vercel.app |
| Repositorio | `abdideev/ahorrito` (público) |
| Base | `dev` en `1e3e1dc` (pull request #38), equivalente a `v1.0.0-rc.1` más la corrección del defecto #37 |

---

## 8.1 Procedimiento de liberación

Sigue `docs/GITFLOW.md`, sección 4, ampliado con la verificación posterior y el acta.

| # | Paso | Quién | Evidencia |
|---|---|---|---|
| 1 | Congelar `dev`: ninguna funcionalidad nueva después de la Fase 5. Solo correcciones con incidencia (#37) | Responsable | Historial de `dev` |
| 2 | Suites en verde sobre `dev`: unitarias, integración e interfaz | Claude | `docs/verificacion/regresion/` y la ejecución del paso 7 |
| 3 | Informe de pruebas aprobado y defectos cerrados | Responsable | `docs/informe-de-pruebas.md` (aprobado el 04/10/2026); #27, #30, #31, #34 y #37 cerradas |
| 4 | Versión candidata `v1.0.0-rc.1` desplegada y verificada en producción: CA-01, CA-08, CA-21 (b), CA-25 y prueba de humo | Responsable y Claude | `docs/verificacion/2026-10-04-produccion.md` |
| 5 | Pull request de `dev` hacia `main` con el título `release: v1.0.0 ahorrito liberado y desplegado` y al menos un comentario de revisión en línea; fusionarlo | Responsable | Pull request en GitHub |
| 6 | Etiqueta anotada `v1.0.0` sobre el commit de fusión en `main` y publicarla | Responsable | `git tag -n1` |
| 7 | Vercel despliega `main` en producción (rama de producción: `main`). Verificar: HTTP 200, compilación correcta, prueba de humo E2E-04 contra producción y el texto del defecto #37 | Claude | Agregado en la sección 8.7 |
| 8 | Firmar el acta de liberación (8.7) | Responsable | Este documento |

**Antes de liberar:** `main` no tiene el trabajo de `dev` desde `v0.9.0`.

- **`dev` va 85 commits por delante de `main`.**
- **`main` tiene 4 commits que `dev` no tiene:** son las fusiones de las versiones `v0.1.0`,
  `v0.2.0`, `v0.3.0` y `v0.9.0` (`c619b2d`, `4012f08`, `0b13e87` y `623fe1a`). Nunca se fusionó `main`
  de vuelta en `dev`.
- **No hay pérdida de trabajo:** esos 4 commits no traen contenido propio, solo registran la
  fusión. El pull request del paso 5 los integra sin conflictos.

**Después de liberar:** para que `dev` y `main` no vuelvan a divergir, se recomienda fusionar
`main` en `dev` (`git checkout dev && git merge main`) en la siguiente rama de documentación.

---

## 8.2 Identificación de la versión

**Esquema:** versionado semántico (`MAYOR.MENOR.PARCHE`). `1.0.0` es la primera versión liberada
y desplegada para personas usuarias reales, con los quince requisitos funcionales implementados.

| Etiqueta | Rama | Commit | Fecha | Contenido |
|---|---|---|---|---|
| `v0.1.0` | `main` | `c619b2d` | 12/09/2026 | Motor de cálculo determinista |
| `v0.2.0` | `main` | `4012f08` | 17/09/2026 | Persistencia y autenticación |
| `v0.3.0` | `main` | `0b13e87` | 19/09/2026 | Integración con la inteligencia artificial |
| `v0.9.0` | `main` | `623fe1a` | 29/09/2026 | Aplicación completa, sin verificar |
| `v1.0.0-rc.1` | `dev` | `888c06c` | 04/10/2026 | Versión candidata: cierre de la Fase 5, base del despliegue inicial y de las capturas |
| **`v1.0.0`** | `main` | `b072b45` | 04/10/2026 | **Versión liberada** |

**Desviación declarada:** GITFLOW solo prevé etiquetas en `main`. La etiqueta candidata
`v1.0.0-rc.1` se creó en `dev` por decisión del responsable (04/10/2026), para fijar el código de
las capturas finales antes de `v1.0.0`.

**Contenido de v1.0.0:**

| Ámbito | Contenido |
|---|---|
| Requisitos | RF-01 a RF-15 (RF-15, aviso de privacidad, por SC-09) y RNF-01 a RNF-11 |
| Solicitudes de cambio aplicadas | SC-01 a SC-10 |
| Defectos corregidos desde `v0.9.0` | #27, #30, #31, #34 y #37 |
| Verificación | 24 de 26 criterios cumplidos: los 21 del informe, más CA-08, CA-21 y CA-25 en producción (CA-01 se repitió en producción con el SMTP propio). CA-23 en parte (una versión de cada navegador, sin Safari) y CA-20 pendiente (Fase 7) |
| Pruebas | 356 unitarias, 20 de integración y 6 de interfaz |
| Esquema de la base de datos | **Sin cambios desde `v0.9.0`**: tres migraciones, la última del 17/09/2026 |

---

## 8.3 Lista de liberación

| # | Comprobación | Estado |
|---|---|---|
| 1 | `pnpm lint` y `pnpm exec tsc --noEmit` sin errores | ✅ 04/10/2026 |
| 2 | `pnpm test`: 356 de 356 | ✅ 04/10/2026 (tras #37) |
| 3 | `pnpm test:integracion`: 20 de 20 | ✅ 04/10/2026 |
| 4 | `pnpm test:e2e`: 6 de 6 | ✅ 04/10/2026 |
| 5 | `pnpm build` correcto | ✅ local y en Vercel (37 s) |
| 6 | Informe de pruebas aprobado | ✅ 04/10/2026 |
| 7 | 0 defectos abiertos de severidad bloqueante o mayor | ✅ |
| 8 | Incidencias de la versión cerradas (#27, #30 a #34 y #37) | ✅ |
| 9 | Documento maestro actualizado con la Fase 5 | ✅ (pull request #36). La Fase 6 se aplica tras la liberación |
| 10 | Variables de entorno de producción en Vercel, sin valores en el repositorio | ✅ |
| 11 | `SUPABASE_SERVICE_ROLE_KEY` **no** está en Vercel | ✅ |
| 12 | SMTP propio en Supabase y plantilla de confirmación en español | ✅ |
| 13 | Supabase: *Site URL* y *Redirect URLs* con la URL de producción | ✅ |
| 14 | Aviso de privacidad publicado (`/privacidad`, versión 1.0) | ✅ |
| 15 | Juego final de capturas | ✅ 28 capturas de `v1.0.0-rc.1` (`docs/capturas/`) |
| 16 | Pull request `dev` → `main` fusionado y etiqueta `v1.0.0` publicada | ✅ 04/10/2026: `b072b45` y etiqueta `v1.0.0` |
| 17 | Producción sirviendo `v1.0.0` y prueba de humo en verde | ✅ 05/10/2026 03:18 UTC: 1 de 1 |

---

## 8.4 Instalación y despliegue

### Instalación local, para desarrollo o revisión

Requisitos: Node.js 24 o superior (verificado con 24.21 y 25.7), pnpm 12, Git y una cuenta de
Supabase.

```bash
git clone https://github.com/abdideev/ahorrito.git
cd ahorrito
pnpm install
```

1. Copiar `.env.example` como `.env.local` y llenar los valores (sección 8.5). `.env.local`
   **nunca** se versiona.
2. **Base de datos** (solo con un proyecto de Supabase nuevo; el actual ya tiene el esquema):

   ```bash
   pnpm exec supabase link --project-ref <ref-del-proyecto>
   pnpm exec supabase db push
   ```

   Aplica las tres migraciones de `supabase/migrations/`: el esquema, la seguridad por fila y el
   guardado atómico.
3. **Compilar y ejecutar:**

   ```bash
   pnpm build
   pnpm start
   ```

   La aplicación queda en `http://localhost:3000`.

Medido el 03/10/2026 desde un clon limpio, con caché vacía: **151 s** desde la descarga hasta
servir la portada (`pnpm install` 82 s, `pnpm test` 11 s, `pnpm build` 53 s). No incluye escribir
`.env.local`.

### Despliegue en Vercel

Medido el 04/10/2026 (CA-25): unos **4 min** desde la importación hasta la portada, con **37 s**
de compilación.

1. En vercel.com, entrar con GitHub (plan Hobby) y autorizar solo el repositorio `abdideev/ahorrito`.
2. **Add New → Project → Import** del repositorio. Vercel detecta Next.js y pnpm. No se cambia el
   comando de compilación ni la carpeta raíz.
3. **Environment Variables:** las de producción de la sección 8.5.
4. **Deploy.**
5. **Settings → Build and Deployment → Node.js Version:** 24.x.
6. **Settings → Environments → Production → Branch Tracking:** `main`.
7. En Supabase, **Authentication → URL Configuration:** *Site URL* con la URL de Vercel, y en
   *Redirect URLs* la URL de Vercel más `/confirmar`.

**Comportamiento observado:** la importación inicial publica en producción el último commit de la
rama predeterminada del repositorio (`dev`; así salió `v1.0.0-rc.1`). Después, **solo la rama de
producción (`main`) se publica en producción**. Las fusiones en `dev` y las ramas de trabajo
generan despliegues de vista previa (*Preview*).

---

## 8.5 Configuración

### Variables de entorno

| Variable | Producción (Vercel) | Local (`.env.local`) | Secreta | Uso |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | Sí | No (va al navegador) | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Sí | No (protegida por la seguridad por fila) | Clave pública |
| `GEMINI_API_KEY` | Sí | Sí | **Sí** | Explicación del plan (RF-10). Sin ella el plan se entrega igual (RNF-03) |
| `GEMINI_MODELO` | Opcional | Opcional | No | Modelo de Gemini. Vacío = el valor por omisión de `src/adapters/ia/gemini.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Solo para la CLI | **Sí** | La aplicación no la usa. No debe subirse a Vercel |
| `PRUEBA_USUARIO_A_*`, `_B_*`, `_C_*` | **No** | Solo para pruebas | **Sí** | Cuentas de prueba de la integración y de Playwright |

### Supabase (proyecto `bnvuvcsrjvupzhrbwcmc`, us-east-2)

**El mismo proyecto atiende el desarrollo, las pruebas y la producción.** Limitación declarada en
el plan de pruebas, sección 12.

| Ajuste | Valor |
|---|---|
| Authentication → URL Configuration | *Site URL*: la URL de producción. *Redirect URLs*: la URL de producción + `/confirmar`, y las de `localhost` |
| Authentication → Emails → SMTP Settings | Custom SMTP: `smtp.gmail.com:587`, remitente `ahorrito.app.uaeh@gmail.com` (nombre "Ahorrito"), contraseña de aplicación de Google. **La contraseña solo vive en Supabase y en el gestor de contraseñas del responsable** |
| Authentication → Emails → Templates → Confirm signup | Asunto "Confirma tu cuenta de Ahorrito"; cuerpo en español con `{{ .ConfirmationURL }}` |
| Esquema | Las tres migraciones de `supabase/migrations/` |
| Capa gratuita | El proyecto se **pausa tras unos 7 días sin actividad**. Se reanuda desde el panel con *Resume project*, sin pérdida de datos |

### Vercel

| Ajuste | Valor |
|---|---|
| Plan | Hobby (gratuito, uso no comercial) |
| Dominio | `ahorrito-nine.vercel.app`, sin dominio propio por la restricción del documento maestro |
| Rama de producción | `main` |
| Node.js | 24.x |
| Región de las funciones | `iad1` (Washington D. C.) |
| HTTPS | Automático: redirección 308 y HSTS de 2 años con `preload` (CA-21 b) |

### Correo (SMTP propio)

Cuenta de Gmail dedicada con verificación en dos pasos y contraseña de aplicación. Se eligió
porque no requiere dominio propio (comparación de opciones del 04/10/2026).

**Limitación:** los primeros correos llegan a spam, porque es un remitente nuevo sin dominio propio
que firme SPF ni DKIM. Límite aproximado de unos 500 correos diarios **[SUPUESTO: límite
publicado por Google para cuentas personales]**.

---

## 8.6 Procedimiento de reversión

La base de datos **no cambia** entre `v0.9.0` y `v1.0.0`, así que revertir el código no exige
revertir el esquema. Los datos de las personas usuarias no se tocan en ninguna de las opciones.

### Opción A · Volver al despliegue anterior en Vercel (la más rápida, sin tocar Git)

1. Vercel → tu proyecto → **Deployments**.
2. Elegir el último despliegue de producción correcto (antes de `v1.0.0` es el de `v1.0.0-rc.1`,
   `888c06c`).
3. **⋯ → Instant Rollback** (o **Promote to Production**). Vercel vuelve a servir ese despliegue sin
   recompilar **[SUPUESTO: en el plan Hobby se permite volver al despliegue de producción
   inmediatamente anterior]**.
4. Verificar: `curl -I https://ahorrito-nine.vercel.app/` responde 200 y se ve la versión esperada.

### Opción B · Revertir la fusión en `main` (deja constancia en el historial)

```bash
git checkout main
git pull origin main
git revert -m 1 <commit-de-fusion-de-v1.0.0>
git push origin main
```

Vercel publica en producción el nuevo commit de `main`, que es el código de la versión anterior. La
etiqueta `v1.0.0` **no se borra ni se mueve**: identifica lo que se liberó. La versión corregida
se publicaría después como `v1.0.1`.

### Opción C · Redesplegar una etiqueta anterior

Desde Vercel, **Deployments → Create Deployment** con la rama o el commit de la etiqueta (por
ejemplo `v1.0.0-rc.1`, `888c06c`), y después **Promote to Production**.

### Después de cualquier reversión

1. Incidencia con la etiqueta `defecto` que explique la causa.
2. Prueba de humo contra producción:

   ```bash
   E2E_URL_BASE=https://ahorrito-nine.vercel.app pnpm test:e2e e2e/humo.spec.ts
   ```

3. Anotarlo en la sección 8.7.

---

## 8.7 Acta de liberación

| Concepto | Valor |
|---|---|
| Sistema | Ahorrito, planificador semanal de pagos y ahorro para estudiantes |
| Versión | v1.0.0 |
| Commit liberado | `b072b45` (fusión de `dev` en `main`), etiqueta anotada `v1.0.0` (`4882334`) |
| URL | https://ahorrito-nine.vercel.app |
| Fecha y hora de la liberación | 04/10/2026, 21:13 (hora del centro de México); despliegue de producción de Vercel del 05/10/2026 03:13:57 UTC |
| Criterios de aceptación | **24 cumplidos** (21 en local, más CA-08, CA-21 y CA-25 en producción), **CA-23 en parte** y **CA-20 pendiente** de la Fase 7 (usuarios reales) |
| Defectos abiertos | 0 |
| Limitaciones aceptadas | Safari sin probar y una versión por navegador (CA-23); quien tenga la aplicación abierta durante un despliegue puede ver un error hasta recargar; correos de confirmación que pueden llegar a spam; límite por minuto del plan gratuito de Gemini (la explicación puede faltar en ráfagas, el plan no); un solo proyecto de Supabase para el desarrollo, las pruebas y la producción; puntos legales del aviso aceptados como supuestos |
| Verificación posterior (paso 7) | Vercel publicó `b072b45` en **Production** (la compilación servida cambió de `tIyIKpCz…` a `veLzngZ…`). `/` responde **200**; `http://` → **308** a `https://`; HSTS presente. **Prueba de humo E2E-04 contra producción: 1 de 1** (22.2 s, `docs/verificacion/produccion/2026-10-05-humo-v1.0.0.json`). **#37:** con un plan, el enlace dice "Ver mi plan guardado". Pestaña limpia sin mensajes en la consola en `/`, `/panel`, `/planes` y `/privacidad` |

**Observación de la verificación posterior:** una pestaña que ya tenía abierta la versión anterior
mostró en la consola un error 500 y el error #441 de React al navegar después del despliegue. Es el
desfase de despliegue: el JavaScript viejo en el navegador habla con el servidor nuevo, y se
resuelve recargando la página. La protección contra ese desfase (*Skew Protection*) es del plan
Pro de Vercel. Se agrega a las limitaciones.

**Recomendación de Claude:** liberada con observaciones (las limitaciones de esta acta).

**Decisión:** *[Liberada / Liberada con observaciones / No liberada]* (la marca el responsable)

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Líder del proyecto y cliente (STK-01) | Abdiel Avila Neri | | |
| Desarrollador y tester (STK-02) | Abdiel Avila Neri | | |

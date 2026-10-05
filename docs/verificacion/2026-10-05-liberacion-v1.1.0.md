# Liberación de v1.1.0 · 05/10/2026

**Versión:** `v1.1.0`, versión MENOR de versionado semántico: agrega una funcionalidad compatible
con lo anterior (botón "Mostrar contraseña" en `/registro` y `/iniciar-sesion`, #41). Sin cambios en
la base de datos ni en las variables de entorno.

## Suites sobre `dev` antes de liberar (`7916120`)

| Comando | Salida |
|---|---|
| `pnpm exec tsc --noEmit` | sin errores |
| `pnpm lint` | sin errores |
| `pnpm test` | `Test Files 29 passed (29)` · `Tests 356 passed (356)` |
| `pnpm test:integracion` | `Test Files 2 passed (2)` · `Tests 20 passed \| 2 skipped (22)` |
| `pnpm test:e2e` | `6 passed (1.3m)` |

## Ramas y etiqueta

```text
$ git rev-list --left-right --count origin/main...origin/dev   (antes del PR #43)
0	8
$ git log --oneline -1 origin/main
4d14004 Merge pull request #43 from abdideev/dev
$ git rev-parse v1.1.0^{}
4d1400499ca3192a20cb968c6d7d5e1603f526f0
$ git tag -n1 v1.1.0
v1.1.0   Ahorrito 1.1.0: boton para mostrar la contrasena en el registro y el inicio de sesion
```

Fusión en `main`: 05/10/2026 14:17:32 (−06:00). Etiqueta anotada: 05/10/2026 14:18:43 (−06:00),
publicada en `origin`.

## Verificación posterior en producción

```text
$ curl -sI https://ahorrito-nine.vercel.app/
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
$ curl -sI http://ahorrito-nine.vercel.app/
HTTP/1.0 308 Permanent Redirect
Location: https://ahorrito-nine.vercel.app/
$ curl -s https://ahorrito-nine.vercel.app/registro | grep -c 'aria-label="Mostrar contraseña"'
1
```

- **Prueba de humo E2E-04 contra producción:** 1 de 1, 27.2 s
  (`E2E_URL_BASE=https://ahorrito-nine.vercel.app pnpm exec playwright test e2e/humo.spec.ts --reporter=json`,
  salida en `produccion/2026-10-05-humo-v1.1.0.json`; sin credenciales, comprobado contra `.env.local`).
- **Botón en `/iniciar-sesion` de producción:** `type` pasa de `password` a `text` y `aria-pressed`
  de `false` a `true`; el valor escrito se conserva; al pulsar de nuevo vuelve a `password` y `false`.
- **Consola:** sin errores en una pestaña limpia.

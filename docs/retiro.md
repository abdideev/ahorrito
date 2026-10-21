# Plan de retiro de Ahorrito (lista de verificación, puntos 11.1 a 11.5)

| Campo | Valor |
|---|---|
| Versión del documento | 1.0, 21/10/2026 |
| Fecha del retiro | **Pendiente:** se fija cuando se conozca la calificación del proyecto. La aplicación se mantiene en producción hasta entonces (decisión de STK-01) |
| Estado | **Documentado pero no ejecutado.** El acta de la sección 11.5 queda sin ejecutar hasta que ocurra |

---

## 11.1 Procedimiento para retirar el software

Se ejecuta **después** de la calificación, en este orden:

| # | Paso | Responsable |
|---|---|---|
| 1 | Avisar a los evaluadores (E1 a E3) que su cuenta y sus datos se borrarán, con al menos 7 días de anticipación, en la misma vía en que se les escribió | STK-01 |
| 2 | Respaldo final de los datos (11.4) | STK-01 |
| 3 | Borrar las cuentas y sus datos (11.3) | STK-01 |
| 4 | Revocar las claves (tabla de abajo) | STK-01 |
| 5 | Retirar el despliegue de Vercel (11.2, "La URL") | STK-01 |
| 6 | Pausar o borrar el proyecto de Supabase | STK-01 |
| 7 | Copia final del repositorio y archivado (abajo) | STK-01 |
| 8 | Borrar la evidencia privada de la validación: la carpeta `C:\evidencia-validacion` completa, y vaciar la papelera de reciclaje de Windows después | STK-01 |
| 9 | Llenar y firmar el acta de retiro (11.5) | STK-01 |

### Claves a revocar

| Clave | Dónde vive | Cómo se revoca |
|---|---|---|
| `GEMINI_API_KEY` | Vercel y `.env.local` | Google AI Studio → API keys → eliminar la clave |
| Claves de Supabase (`anon` y, si existe, `service_role`) | Vercel y `.env.local` | Quedan sin efecto al borrar el proyecto. Si solo se pausa, rotar las claves desde Project Settings → API |
| Contraseña de aplicación de Gmail (SMTP) | Panel de Supabase y gestor de contraseñas del responsable | Cuenta de Google `ahorrito.app.uaeh@gmail.com` → Seguridad → Contraseñas de aplicaciones → revocar. Decidir si la cuenta se cierra |
| Contraseña de la base de datos | Panel de Supabase | Queda sin efecto al borrar el proyecto |
| Cuentas de prueba A, B y C | `.env.local` | Se borran con las cuentas (11.3); después se eliminan sus líneas de `.env.local` |

### Copia final del repositorio

- **Respaldo:** `git bundle create ahorrito-final.bundle --all` guardado fuera del repositorio, o un
  ZIP de la versión etiquetada.
- **Archivado:** en GitHub, el repositorio se archiva (Settings → Archive) y queda de solo lectura.
  [SUPUESTO] Se mantiene público como evidencia académica; lo decide STK-01.

## 11.2 Sistemas y usuarios afectados

| Afectado | Efecto del retiro |
|---|---|
| E1, E2 y E3 (cuentas reales creadas en la validación) | Pierden su cuenta y sus planes. Se les avisa (paso 1) |
| Cuentas de prueba A, B y C y la cuenta de capturas | Se borran |
| Cuentas del responsable | Se borran |
| Integración con Gemini | Se revoca la clave |
| SMTP de Gmail | Se revoca la contraseña de aplicación |
| Personas con un enlace a la aplicación (el documento maestro, el informe, el docente) | La URL deja de responder |
| Repositorio y documentación | Se conservan como evidencia |

[SUPUESTO] No hay más usuarios: la aplicación no se difundió fuera del proyecto. Se comprueba antes
del retiro contando las cuentas en `auth.users`.

### La URL

- Al borrar el proyecto de Vercel, `ahorrito-nine.vercel.app` deja de responder.
- [SUPUESTO] El subdominio puede quedar disponible para otros proyectos de Vercel. Para evitar que
  alguien lo tome, se puede conservar el proyecto con una página estática que diga "Proyecto
  académico retirado" en lugar de borrarlo.

## 11.3 Qué ocurre con los datos

- **Exportación previa:** el respaldo final (11.4).
- **Borrado:**
  - Cada cuenta se borra desde el panel de Supabase (Authentication → Users → Delete user).
  - El borrado en cascada elimina sus perfiles, presupuestos, pagos, ingresos, metas, planes y
    semanas (`on delete cascade` en `supabase/migrations/20260916120000_esquema_relacional.sql`).
  - Al final se borra el proyecto completo.
- **Plazo:** el aviso de privacidad compromete eliminar los datos a más tardar **30 días** después
  del retiro del consentimiento (`src/lib/privacidad/aviso.ts`, `DIAS_ELIMINACION_TRAS_RETIRO = 30`).
  El retiro del sistema equivale a terminar el tratamiento, así que el borrado se hace dentro de
  ese plazo.
- **Destino del respaldo final:** se conserva solo hasta cerrar el acta de retiro y después se
  borra. [SUPUESTO] No hay obligación académica de conservar datos personales de los evaluadores.

## 11.4 Respaldo antes del retiro

- **Cómo:** con la opción C de `docs/operacion.md`, 9.5 (`supabase/verificacion/respaldo-datos.sql`),
  ya ejercitada el 21/10/2026 (`docs/verificacion/2026-10-21-respaldo.md`).
- **Dónde:** en `C:\evidencia-validacion\respaldos\`; en el acta se anotan el conteo por tabla
  y la huella SHA-256.
- **Estado:** el mecanismo está ejercitado; el respaldo **final**, el del retiro, queda pendiente
  hasta que el retiro ocurra.

## 11.5 Acta de retiro (sin ejecutar)

| Campo | Valor |
|---|---|
| Fecha de la calificación | Pendiente |
| Fecha del retiro | Pendiente |
| Aviso a los evaluadores (fecha y medio) | Pendiente |
| Respaldo final (opción usada y conteo por tabla) | Pendiente |
| Cuentas borradas (cantidad; sin correos) | Pendiente |
| Claves revocadas (Gemini, Supabase, Gmail) | Pendiente |
| Vercel (borrado o página de retiro) | Pendiente |
| Supabase (pausado o borrado) | Pendiente |
| Copia final del repositorio y archivado | Pendiente |
| Evidencia privada borrada (`C:\evidencia-validacion` y papelera de reciclaje) | Pendiente |
| Respaldo final borrado | Pendiente |

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Líder del proyecto y cliente (STK-01) | Abdiel Avila Neri | Pendiente | Pendiente |

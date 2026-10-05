# Verificación en producción (Bloque 6) · 04/10/2026

| Dato | Valor |
|---|---|
| URL | https://ahorrito-nine.vercel.app |
| Plataforma | Vercel, plan Hobby, subdominio de la plataforma (sin dominio propio, como fija el documento maestro) |
| Rama desplegada | `dev` (la rama predeterminada del repositorio en GitHub), en `888c06c` = etiqueta `v1.0.0-rc.1` |
| Node.js | 24.x (ajuste del proyecto en Vercel; sin `engines` en `package.json`) |
| Región de las funciones | `iad1`, Washington D. C., Estados Unidos (cabecera `X-Vercel-Id`) |
| Base de datos | **El mismo proyecto de Supabase** (`bnvuvcsrjvupzhrbwcmc`, us-east-2) que el desarrollo y las pruebas |
| Variables en Vercel | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY` y, si tiene valor, `GEMINI_MODELO`. Las capturó el responsable; **no** se subieron `SUPABASE_SERVICE_ROLE_KEY` (la aplicación no la usa) ni las `PRUEBA_USUARIO_*` |
| Correo (SMTP propio) | Gmail con contraseña de aplicación, remitente `ahorrito.app.uaeh@gmail.com` (`smtp.gmail.com:587`); plantilla "Confirm signup" en español |

## CA-25 (RNF-09): despliegue reproducible en 15 min o menos

| Fuente | Dato |
|---|---|
| Reloj del responsable, desde "Import" hasta ver la portada (incluye capturar las variables) | 18:00 a 18:04: **≈ 4 min**, con resolución de un minuto (no se inició un cronómetro) |
| Vercel, detalle del despliegue `BJ6McfSSQ` | Estado **Ready**, entorno **Production**, origen `dev` en `888c06c` ("Merge pull request #36"), duración **37 s** (compilación de 37 s) |

Captura: `produccion/2026-10-04-ca25-despliegue-vercel.png`.

**Resultado: CA-25 cumplido.** Con unos 4 min de punta a punta, frente a un límite de 15, y
37 s de compilación registrados por la plataforma. El tiempo total es una lectura de reloj y no
un cronómetro: se declara así.

**No incluye** crear la cuenta de Vercel ni el SMTP. Se hicieron antes y son de una sola vez por
proyecto. Tampoco incluye el esquema de la base, que ya existía: es el mismo proyecto de Supabase.

## CA-01 (RF-01) en producción, con el SMTP propio

Registro en `https://ahorrito-nine.vercel.app/registro` con un correo de Gmail que **no es
miembro** del proyecto de Supabase (no se transcribe: es un dato de un tercero). Lo hizo el
responsable en Chrome.

| Paso | Resultado |
|---|---|
| Envío del formulario con la casilla del aviso | "Si el correo puede registrarse, recibirás un enlace para confirmar la cuenta…" |
| Correo recibido | Asunto "Confirma tu cuenta de Ahorrito", remitente `Ahorrito <ahorrito.app.uaeh@gmail.com>`, plantilla en español con el enlace "Confirmar mi correo". Captura: `produccion/2026-10-04-ca01-correo-confirmacion.png` |
| Enlace abierto en el mismo navegador | Llegó a `/panel` con la sesión de la cuenta nueva, que estaba vacía ("Todavía no registras ningún pago") |

**Resultado: CA-01 cumplido en producción.** Con el SMTP propio, una persona fuera del proyecto
completa el registro, confirma su correo y accede. Esto resuelve la limitación de RES-16.

**Observación: el correo llegó a la carpeta de spam.** Es lo esperado en un remitente de Gmail
nuevo y sin historial. Mitigaciones sin dominio propio:

- marcar el correo como "No es spam" en las primeras cuentas;
- mantener el texto de la plantilla simple, sin enlaces externos.

Se declara como limitación en la liberación. Un dominio propio con SPF y DKIM la resolvería, pero
el documento maestro lo excluye.

## CA-21 (b) (RNF-05): tráfico cifrado

```text
$ curl -s -o /dev/null -D - http://ahorrito-nine.vercel.app/
HTTP/1.0 308 Permanent Redirect
Location: https://ahorrito-nine.vercel.app/

$ curl -s -o /dev/null -D - https://ahorrito-nine.vercel.app/
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

- `http://` de `/privacidad`, `/registro`, `/panel` y `/api/planes`: **308** a su equivalente
  `https://`.
- **HSTS:** dos años, con `includeSubDomains` y `preload`.
- **Peticiones del navegador** (registro de recursos de la página, equivalente al HAR):

| Página | Peticiones | Peticiones `http://` | Orígenes | Protocolo |
|---|---|---|---|---|
| `/` | 13 | **0** | Solo `https://ahorrito-nine.vercel.app` | h2 |
| `/privacidad` | 13 | **0** | Ídem | h2 |
| `/registro` | 13 | **0** | Ídem | h2 |
| `/iniciar-sesion` | 13 | **0** | Ídem | h2 |

**Recorrido con sesión** (cuenta de prueba C, navegador integrado):

| Paso | Peticiones | Peticiones `http://` | Orígenes |
|---|---|---|---|
| `/panel` y "Generar mi plan" (incluye `POST /api/planes` por h2) | 39 | **0** | Solo `https://ahorrito-nine.vercel.app` |
| `/planes` | 14 | **0** | Ídem |

La consola, sin mensajes en todo el recorrido. Las llamadas a Supabase y a Gemini salen del
servidor, no del navegador, y viajan por HTTPS desde Vercel.

**Resultado: CA-21 (b) cumplido**, con redirección 308 en todas las rutas, HSTS y 0 peticiones
`http://` en un recorrido completo, con y sin sesión. Junto con la parte (a) (bcrypt, 6 de 6),
**CA-21 queda cumplido completo**.

## CA-08 (RNF-01): 20 solicitudes en producción

Script `docs/verificacion/scripts/cronometro-plan.js`, ejecutado en el navegador con la sesión de
la cuenta de prueba C: 20 `POST /api/planes` seguidos con explicación. Los 20 planes se borraron
al terminar. Resultado completo: `produccion/2026-10-04-ca08-produccion.json`.

| | Producción (05/10/2026 00:27 UTC) | Local (04/10, como referencia) |
|---|---|---|
| Dentro de 30 s | **20 de 20** | 20 de 20 |
| Plan: mínimo / mediana / máximo | 284 / **360** / 1,189 ms | 245 / 310 / 804 ms |
| HTTP | 200 en las 20 | 200 en las 20 |

**Resultado: CA-08 cumplido en producción** (se exigían al menos 18 de 20). La primera solicitud
es la más lenta (1,189 ms), consistente con el arranque en frío de la función.

**Observación: explicaciones nulas en las solicitudes 15 a 20.** Las solicitudes 1 a 14 recibieron
explicación (de 1.7 a 2.6 s). Las seis últimas recibieron `explicacion: null` en menos de 0.5 s, sin
que el plan se viera afectado. La causa más probable es el límite por minuto del plan gratuito de
Gemini: hubo 20 solicitudes en menos de un minuto. **Confirmado en los registros de Vercel**
(captura `produccion/2026-10-04-ca08-registros-ia-vercel.png`, filtro `[ia]`): las solicitudes de
18:26:36 a 18:27:02 tienen `"resultado":"exito","estadoHttp":200`, y las seis de 18:27:04 a
18:27:06, `"resultado":"error-http","estadoHttp":429`, con duraciones de 90 a 113 ms. Es el riesgo RSG-01 materializado bajo una ráfaga artificial,
y la aplicación lo manejó como exige RNF-03: plan completo y aviso de explicación no disponible. No
afecta a CA-08, que mide la entrega del plan.

## Prueba de humo en producción

E2E-04 (Playwright, SC-10) contra el despliegue, sin servidor local:

```text
$ E2E_URL_BASE=https://ahorrito-nine.vercel.app pnpm test:e2e e2e/humo.spec.ts
  1 passed (18.1s)
```

Recorrió entrar con la cuenta C, capturar, generar, abrir el historial, borrar el plan (con el
aviso "Plan eliminado." y el foco en "Ir al panel", #34) y abrir el aviso de privacidad desde la
barra con "Volver al panel".

- **1 de 1**: 0 inesperadas y 0 inestables.
- La configuración del reporte no arrancó ningún servidor (`webServer` vacío) ni menciona
  `localhost:3100`.
- Sin credenciales en el JSON.
- Evidencia: `produccion/2026-10-04-humo-produccion.json`.

Para esto se agregó a `playwright.config.ts` la variable opcional `E2E_URL_BASE`. Sin ella, todo
sigue igual que antes.

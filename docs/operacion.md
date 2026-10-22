# Operación de Ahorrito (lista de verificación, puntos 9.1 a 9.7)

| Campo | Valor |
|---|---|
| Versión del documento | 1.1, 22/10/2026: la pausa del 28/09 ya está registrada como #54 (9.1, 9.4 y resumen) y la recuperación de datos ya tiene respaldo que restaurar (9.6). La 1.0 es del 21/10/2026 |
| Sistema | Ahorrito v1.1.0 (`4d14004`), https://ahorrito-nine.vercel.app |
| Periodo de operación | Desde la liberación de `v1.0.0` (04/10/2026) hasta la calificación del proyecto. Después, plan de retiro (`docs/retiro.md`) |
| Restricción | RES-15: el proyecto no contempla operación posterior a la entrega académica. Este documento define la operación del periodo de validación y calificación |

**Leyenda de estado:**

- **Ejercitado:** existe evidencia de ejecución.
- **Documentado pero no ejercitado:** el procedimiento está escrito y nunca se ejecutó.
- **N/A:** no aplica, con justificación.

---

## 9.1 Procedimiento de operación (manual)

### Arranque y redespliegue

| Situación | Procedimiento | Estado |
|---|---|---|
| Despliegue normal | Fusionar en `main` por pull request; Vercel compila y publica solo (rama de producción `main`). Verificar con la prueba de humo (abajo) | **Ejercitado** (`v1.0.0` y `v1.1.0`; `docs/liberacion.md` 8.1) |
| Instalación desde cero | `docs/liberacion.md` 8.4 | **Ejercitado** en el despliegue inicial (CA-25, 04/10/2026) |
| Volver a una versión anterior | `docs/liberacion.md` 8.6, opciones A, B y C | **Documentado pero no ejercitado** |

**Prueba de humo**, para comprobar que todo funciona:

```bash
E2E_URL_BASE=https://ahorrito-nine.vercel.app pnpm test:e2e e2e/humo.spec.ts
```

- **Ejercitada:** 1 de 1 el 05/10/2026 (`v1.0.0` y `v1.1.0`) y el 20/10/2026, en 20.4 s.
- **Qué no cubre:** la explicación de la inteligencia artificial.

### Si Supabase se pausa

El plan gratuito pausa el proyecto tras **1 semana sin actividad**. Hay **1 año** para restaurarlo
con un clic desde Studio, y después solo se puede descargar su respaldo. Fuentes:
https://supabase.com/pricing y https://supabase.com/docs/guides/platform/upgrading, consultadas el
21/10/2026.

| Paso | Acción |
|---|---|
| 1 | **Síntoma:** la aplicación no inicia sesión ni carga datos; las pruebas dan `fetch failed`, o el dominio del proyecto no resuelve |
| 2 | Panel de Supabase → proyecto → **Restore project** (o *Resume project*) |
| 3 | Esperar a que el proyecto quede activo y ejecutar la prueba de humo |
| 4 | Registrar el incidente (9.4) |

**Estado: ejercitado una vez**, el 28/09/2026, sin pérdida de datos. Registrado de forma
retroactiva como la incidencia #54 (21/10/2026).

### Si se agota la cuota de Gemini (respuesta 429)

- **Efecto:** el plan se entrega igual, con el aviso "La explicación no está disponible en este
  momento" (RNF-03, CA-09).
- **Si es el límite por minuto:** esperar 1 o 2 minutos y usar "Recalcular y explicar".
- **Si es el límite diario:** esperar al día siguiente. La cuota no se consulta por API: se ve en
  Google AI Studio.
- **Si la clave se revoca o se agota de forma permanente:** generar otra en Google AI Studio,
  actualizar `GEMINI_API_KEY` en Vercel (Settings → Environment Variables) y **redesplegar**. Las
  variables solo se aplican a despliegues nuevos.
- **Estado:** el 429 se observó el 04/10/2026 (6 de 20 solicitudes en ráfaga;
  `docs/verificacion/2026-10-04-produccion.md`). **El cambio de clave está documentado pero no
  ejercitado.**

### Rutina de actividad hasta la calificación (sin instalar nada)

**Objetivo:** que nunca pasen 7 días sin actividad real en la base de datos.

| Elemento | Definición |
|---|---|
| Frecuencia | Al menos **cada 5 días**, para dejar 2 días de margen sobre el límite de 7 |
| Acción | Ejecutar la prueba de humo contra producción (comando de arriba). Inicia sesión con la cuenta C, guarda y borra un pago y un plan: es actividad real de lectura y escritura |
| Alternativa sin terminal | Entrar a la aplicación con la cuenta de capturas y generar un plan |
| Registro | Una línea por ejecución en `docs/verificacion/actividad.md`: fecha, comando y resultado |
| Fin | Hasta la calificación; después rige el plan de retiro |

- **Por qué no basta con abrir la portada:** [SUPUESTO] la portada no consulta la base de datos,
  así que puede no contar como actividad. La prueba de humo sí la usa.
- **Programarla:** se puede usar el Programador de tareas de Windows, que viene con el sistema.
  Exige dejar el equipo encendido y conserva la cuenta C en `.env.local`. Se recomienda la
  ejecución manual con su registro.
- **Estado:** **documentado pero no ejercitado** como rutina. La prueba de humo del 20/10/2026 ya
  generó actividad ese día.

## 9.2 Responsables de operación

| Rol | Persona | Responsabilidad |
|---|---|---|
| Operador, desarrollador y líder (STK-01, STK-02) | Abdiel Avila Neri | Despliegues, rutina de actividad, respuesta a incidentes, claves y retiro |
| Proveedores (STK-05, STK-06) | Google, Vercel, Supabase | Disponibilidad de sus servicios; sin acuerdo de nivel de servicio en sus planes gratuitos |

**Estado: documentado.** Coincide con la matriz RACI del documento maestro (1.7.1): liberación y
despliegue, R y A del desarrollador.

## 9.3 Monitoreo

| Fuente | Qué muestra | Retención en el plan actual | Fuente de la retención | Estado |
|---|---|---|---|---|
| Registros de ejecución de Vercel | Errores del servidor y las líneas `[ia]` del adaptador de Gemini | **1 hora** (Hobby) | https://vercel.com/docs/logs/runtime | **Ejercitado:** sirvió para confirmar los 429 el 04/10 (`docs/verificacion/produccion/…-ca08-registros-ia-vercel.png`) |
| Registros de Supabase (API y base de datos) | Peticiones, errores de autenticación | **1 día** (Free) | https://supabase.com/pricing | No consultados |
| Prueba de humo | Que el flujo completo funciona | Sus JSON en `docs/verificacion/produccion/` | — | **Ejercitado** |
| Correo de confirmación | Que el SMTP propio entrega | — | — | Ejercitado en CA-01 |

**Limitación:** con 1 hora de registros en Vercel y 1 día en Supabase, un fallo se diagnostica solo
si se revisa casi enseguida. No hay alertas automáticas.

## 9.4 Registro de incidentes

- **Dónde:** en GitHub Issues, con la etiqueta `defecto` y su prioridad, igual que los defectos. Es
  la decisión del responsable del 20/10/2026 para la pausa de Supabase.
- **Qué lleva cada incidente:**
  - fecha y hora del hecho;
  - síntoma;
  - efecto sobre las personas usuarias;
  - acción de recuperación;
  - prueba de humo posterior;
  - causa.
- **Estado: ejercitado.** Los defectos del producto tienen incidencias (#3, #27, #30, #31, #34,
  #37 y, de forma retroactiva, #50 a #53). El único incidente de operación, la pausa del 28/09, se
  registró de forma retroactiva como #54 (21/10/2026), con la etiqueta `defecto`.

## 9.5 Mecanismos de respaldo

**Primer respaldo de los datos ejecutado el 21/10/2026 a las 16:58**, con la opción C (evidencia: `docs/verificacion/2026-10-21-respaldo.md`; 7 tablas, conteos idénticos a la base, SHA-256 registrado). Antes de esa fecha no existía ninguno.

- El plan gratuito de Supabase **no incluye respaldos automáticos**: "Automatic backups: Free = Not
  included"; los planes de pago guardan 7 días o más (https://supabase.com/pricing).
- La documentación recomienda a los proyectos gratuitos exportar con `supabase db dump`
  (https://supabase.com/docs/guides/platform/backups).
- **Lo que sí está versionado es el esquema:** las tres migraciones de `supabase/migrations/`.

### Procedimiento propuesto (lo ejecuta el responsable; necesita la contraseña de la base de datos, que nunca se escribe en el repositorio)

| Opción | Cómo | Requisito | Estado |
|---|---|---|---|
| A · CLI de Supabase | `pnpm exec supabase db dump --linked --data-only -f <carpeta privada>/datos-AAAA-MM-DD.sql` (y sin `--data-only` para el esquema) | La CLI ya está vinculada al proyecto (`supabase/.temp/project-ref`). [SUPUESTO] El volcado remoto usa `pg_dump` dentro de Docker, y **este equipo no tiene Docker** (`docker: command not found`); instalarlo queda fuera de esta fase | **No ejecutable hoy** |
| B · DataGrip (ya instalado) | Conectar al proyecto con la cadena de conexión del panel (Database → Connect) y exportar cada tabla de `public` como SQL `INSERT` o CSV a la carpeta privada | DataGrip 2025.3.5 está en este equipo | **Documentado pero no ejercitado** |
| C · Panel de Supabase | En el editor SQL, la consulta B de `supabase/verificacion/respaldo-datos.sql` (todo el esquema `public` en un JSON) y la consulta A para el conteo | Solo el navegador | **Ejercitado el 21/10/2026** |

- **Dónde se guarda:** fuera del repositorio, en `C:\evidencia-validacion\respaldos\`. Contiene
  datos personales (correos en `public.perfiles`). `auth.users` no se respalda; solo se cuenta.
- **Cuándo:** antes del retiro (11.4) y, si se quiere, después de las sesiones de validación.

## 9.6 Recuperación

| Escenario | Procedimiento | Estado |
|---|---|---|
| Proyecto pausado | 9.1, "Si Supabase se pausa" | Ejercitado (28/09) |
| Versión defectuosa en producción | `docs/liberacion.md` 8.6 | Documentado pero no ejercitado |
| Clave expuesta o revocada | Revocar y generar otra en el proveedor; actualizar Vercel; redesplegar (RSG-05) | Documentado pero no ejercitado |
| Pérdida de datos | Restaurar el esquema con `supabase db push` desde `supabase/migrations/` y los datos desde el respaldo de 9.5 | **Documentado pero no ejercitado.** Desde el 21/10/2026 existe un respaldo que restaurar (`docs/verificacion/2026-10-21-respaldo.md`); la restauración no se ha probado |

**Prueba de restauración propuesta:**

1. Crear un segundo proyecto gratuito. El plan admite 2 proyectos activos.
2. Aplicar las migraciones.
3. Cargar el respaldo de la opción B o C.
4. Comparar el conteo de filas por tabla con el de producción.
5. Borrar el proyecto de prueba.

**Estado: no ejecutada.**

## 9.7 Niveles de servicio

**N/A.** No hay acuerdo de nivel de servicio con nadie:

- el sistema es académico y no tiene operación comprometida después de la entrega (RES-15);
- los proveedores se usan en planes gratuitos, sin garantía de disponibilidad.

Lo único que se mide es el desempeño del plan (CA-08, RNF-01), y es un requisito, no un nivel de
servicio.

---

## Resumen

| Punto | Evidencia | Falta | Estado |
|---|---|---|---|
| 9.1 | Este manual; despliegues de `v1.0.0` y `v1.1.0`; pausa del 28/09 resuelta | Ejecutar la rutina de actividad con su registro | Ejercitado en parte |
| 9.2 | 9.2 y RACI 1.7.1 | — | Documentado |
| 9.3 | Registros de Vercel usados el 04/10; pruebas de humo | Alertas automáticas (fuera de alcance) | Ejercitado en parte |
| 9.4 | Issues de defectos; pausa del 28/09 en #54 | — | Ejercitado |
| 9.5 | Esquema versionado; respaldo de datos del 21/10/2026 (`docs/verificacion/2026-10-21-respaldo.md`) | Repetirlo después de las sesiones y antes del retiro | Ejercitado |
| 9.6 | Restauración del 28/09 | Prueba de restauración de datos y de reversión | Documentado pero no ejercitado en parte |
| 9.7 | Justificación | — | N/A |

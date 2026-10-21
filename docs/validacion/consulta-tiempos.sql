-- Consulta de tiempos de la validación (Fase 7, protocolo, sección 7: fuente 2 de contraste).
--
-- CUÁNDO: para cada evaluador, DESPUÉS de recibir su evidencia de la Parte A y ANTES de enviarle el
-- mensaje 3 (Parte B). La Parte B borra y vuelve a crear pagos e inicia sesión otra vez, y altera
-- primer_pago y ultimo_acceso. Anota la hora de ejecución en su hoja de registro (protocolo,
-- sección 7 y anexo A). Se puede ejecutar con solo la fila de ese evaluador.
--
-- SOLO LECTURA: un único SELECT, sin INSERT, UPDATE ni DELETE.
-- Dónde: editor SQL del panel de Supabase, proyecto de producción.
-- Antes de ejecutarla, sustituye CORREO_E1, CORREO_E2 y CORREO_E3 por los correos reales, solo en
-- el editor. NO guardes la consulta con correos en el panel ni en el repositorio.
-- La salida no incluye correos: solo E1, E2 y E3.
--
-- Columnas (horas en America/Mexico_City):
--   cuenta_creada      auth.users.created_at: el evaluador envió el formulario de registro
--   correo_confirmado  auth.users.email_confirmed_at: abrió el enlace de confirmación
--   ultimo_acceso      auth.users.last_sign_in_at: si es posterior a la confirmación, hubo un
--                      inicio de sesión a mano (protocolo, sección 9)
--   primer_pago        primer compromisos.creado_en: empezó la captura de pagos
--   primer_plan        primer planes.generado_en: fin del tiempo de CA-20 en la base de datos
--   s_*                diferencias en segundos

with evaluadores (etiqueta, correo) as (
  values
    ('E1', 'CORREO_E1'),
    ('E2', 'CORREO_E2'),
    ('E3', 'CORREO_E3')
),
cuentas as (
  select e.etiqueta, u.id, u.created_at, u.email_confirmed_at, u.last_sign_in_at
  from evaluadores e
  left join auth.users u on lower(u.email) = lower(e.correo)
),
tiempos as (
  select
    c.etiqueta,
    c.created_at,
    c.email_confirmed_at,
    c.last_sign_in_at,
    (select min(k.creado_en) from public.compromisos k where k.usuario_id = c.id) as primer_pago,
    (select min(p.generado_en) from public.planes p where p.usuario_id = c.id) as primer_plan
  from cuentas c
)
select
  etiqueta,
  created_at at time zone 'America/Mexico_City'          as cuenta_creada,
  email_confirmed_at at time zone 'America/Mexico_City'  as correo_confirmado,
  last_sign_in_at at time zone 'America/Mexico_City'     as ultimo_acceso,
  primer_pago at time zone 'America/Mexico_City'         as primer_pago,
  primer_plan at time zone 'America/Mexico_City'         as primer_plan,
  round(extract(epoch from (email_confirmed_at - created_at)))   as s_creacion_a_confirmacion,
  round(extract(epoch from (primer_pago - email_confirmed_at)))  as s_confirmacion_a_primer_pago,
  round(extract(epoch from (primer_plan - primer_pago)))         as s_primer_pago_a_primer_plan,
  round(extract(epoch from (primer_plan - created_at)))          as s_creacion_a_primer_plan
from tiempos
order by etiqueta;
-- Si una fila sale vacía, el correo no coincide con ninguna cuenta: revisa la sustitución.
-- s_creacion_a_primer_plan es una COTA INFERIOR del tiempo de CA-20: no incluye el llenado del
-- formulario de registro previo al envío (protocolo, sección 7).

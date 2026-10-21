-- Respaldo de los datos de la aplicación sin instalar nada (docs/operacion.md, 9.5, opción C).
--
-- SOLO LECTURA: dos SELECT independientes. Se ejecutan por separado en el editor SQL del panel de
-- Supabase (proyecto de producción), porque el editor muestra solo el resultado de la última
-- sentencia.
--
-- CONSULTA A, conteo por tabla: no contiene datos personales. Su salida se anota en
-- docs/verificacion/ como evidencia del respaldo.
--
-- CONSULTA B, respaldo completo del esquema public en un solo valor JSON: SÍ contiene datos
-- personales (public.perfiles.correo). Su resultado se guarda FUERA del repositorio, en
-- C:\evidencia-validacion\respaldos\, y nunca se pega en ningún archivo del proyecto.
--
-- Qué no incluye: auth.users (contraseñas derivadas y sesiones). Las cuentas no se pueden
-- restaurar desde aquí: en una restauración se vuelven a crear, y sus filas se reasocian por id
-- de usuario. El esquema se restaura desde supabase/migrations/.

-- ===================== CONSULTA A · conteo por tabla =====================
select 'perfiles' as tabla, count(*) as filas from public.perfiles
union all select 'presupuestos', count(*) from public.presupuestos
union all select 'compromisos', count(*) from public.compromisos
union all select 'ingresos_extra', count(*) from public.ingresos_extra
union all select 'metas_ahorro', count(*) from public.metas_ahorro
union all select 'planes', count(*) from public.planes
union all select 'asignaciones_semanales', count(*) from public.asignaciones_semanales
union all select 'auth.users (solo conteo)', count(*) from auth.users
order by 1;

-- ===================== CONSULTA B · respaldo completo (datos personales) =====================
select json_build_object(
  'generado_en', now(),
  'perfiles', (select coalesce(json_agg(t), '[]'::json) from public.perfiles t),
  'presupuestos', (select coalesce(json_agg(t), '[]'::json) from public.presupuestos t),
  'compromisos', (select coalesce(json_agg(t), '[]'::json) from public.compromisos t),
  'ingresos_extra', (select coalesce(json_agg(t), '[]'::json) from public.ingresos_extra t),
  'metas_ahorro', (select coalesce(json_agg(t), '[]'::json) from public.metas_ahorro t),
  'planes', (select coalesce(json_agg(t), '[]'::json) from public.planes t),
  'asignaciones_semanales', (select coalesce(json_agg(t), '[]'::json) from public.asignaciones_semanales t)
) as respaldo;

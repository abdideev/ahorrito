-- ============================================================================
-- Verificación de la seguridad por fila (RNF-04)
-- ----------------------------------------------------------------------------
-- Consultas de solo lectura. No es una migración: se ejecuta manualmente en el
-- editor SQL de Supabase después de aplicar las migraciones, y su resultado se
-- conserva como evidencia. Cada consulta indica el resultado esperado.
-- ============================================================================

-- 1. Tablas del esquema public sin seguridad por fila.
--    Esperado: ninguna fila.
select c.relname as tabla_sin_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and not c.relrowsecurity;

-- 2. Resumen por tabla.
--    Esperado:
--    tabla                  | rls  | politicas | privilegios_authenticated         | privilegios_anon
--    asignaciones_semanales | true | 2         | INSERT, SELECT                    | (nulo)
--    compromisos            | true | 4         | DELETE, INSERT, SELECT, UPDATE    | (nulo)
--    ingresos_extra         | true | 4         | DELETE, INSERT, SELECT, UPDATE    | (nulo)
--    metas_ahorro           | true | 4         | DELETE, INSERT, SELECT, UPDATE    | (nulo)
--    perfiles               | true | 1         | SELECT                            | (nulo)
--    planes                 | true | 4         | DELETE, INSERT, SELECT            | (nulo)
--    presupuestos           | true | 4         | DELETE, INSERT, SELECT, UPDATE    | (nulo)
--    En planes, UPDATE no aparece porque se concede solo sobre una columna (consulta 3).
select
  c.relname as tabla,
  c.relrowsecurity as rls,
  (select count(*)
     from pg_policies p
    where p.schemaname = 'public' and p.tablename = c.relname) as politicas,
  (select string_agg(g.privilege_type, ', ' order by g.privilege_type)
     from information_schema.role_table_grants g
    where g.table_schema = 'public' and g.table_name = c.relname
      and g.grantee = 'authenticated') as privilegios_authenticated,
  (select string_agg(g.privilege_type, ', ' order by g.privilege_type)
     from information_schema.role_table_grants g
    where g.table_schema = 'public' and g.table_name = c.relname
      and g.grantee = 'anon') as privilegios_anon
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;

-- 3. Columnas de planes que el usuario puede actualizar.
--    Esperado: una sola fila, "explicacion". Las cifras de un plan son inmutables.
select column_name
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'planes'
  and grantee = 'authenticated'
  and privilege_type = 'UPDATE';

-- 4. La función del disparador no es invocable desde la API.
--    Esperado: false y false.
select
  has_function_privilege('anon', 'public.sincronizar_perfil()', 'execute') as anon_puede_ejecutar,
  has_function_privilege('authenticated', 'public.sincronizar_perfil()', 'execute') as authenticated_puede_ejecutar;

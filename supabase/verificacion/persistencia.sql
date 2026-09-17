-- ============================================================================
-- Verificación de las funciones de persistencia (RNF-04)
-- ----------------------------------------------------------------------------
-- Una función con security definer o con permiso para el rol anónimo sería la vía
-- más directa para saltarse la seguridad por fila. Consultas de solo lectura.
-- ============================================================================

-- Esperado:
--   esquema  | funcion             | security_definer | anon  | authenticated
--   privado  | importe             | false            | false | true
--   public   | guardar_plan        | false            | false | true
--   public   | sincronizar_perfil  | true             | false | false
--
-- guardar_plan debe ser "invoker" (security_definer falso) para que las políticas se
-- apliquen con la identidad de quien la llama. sincronizar_perfil es "definer" porque
-- escribe en public.perfiles desde un disparador de auth.users, y por eso mismo nadie
-- puede invocarla desde la API.
select
  n.nspname as esquema,
  p.proname as funcion,
  p.prosecdef as security_definer,
  has_function_privilege('anon', p.oid, 'execute') as anon,
  has_function_privilege('authenticated', p.oid, 'execute') as authenticated
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'privado')
  and p.proname in ('guardar_plan', 'importe', 'sincronizar_perfil')
order by n.nspname, p.proname;

-- El esquema "privado" no debe estar expuesto en la API de datos.
-- Esperado: usage para authenticated en true, y para anon en false.
select
  has_schema_privilege('authenticated', 'privado', 'usage') as authenticated_usa_privado,
  has_schema_privilege('anon', 'privado', 'usage') as anon_usa_privado;

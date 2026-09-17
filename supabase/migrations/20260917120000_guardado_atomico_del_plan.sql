-- ============================================================================
-- Fase 2, paso 2.6 · Guardado atómico del plan (RF-12)
-- ----------------------------------------------------------------------------
-- La sección 3.7.1 exige insertar el plan y sus asignaciones en una sola
-- transacción. Dos inserciones independientes desde el cliente podrían dejar un
-- plan sin semanas si la segunda falla. Una función PL/pgSQL se ejecuta dentro de
-- una única transacción: se guarda todo o nada.
--
-- Decisiones:
--   * security invoker: la función corre con los privilegios del usuario, así
--     que la seguridad por fila sigue aplicándose. security definer la saltaría.
--   * El propietario se toma de auth.uid(), nunca de un parámetro enviado por el
--     cliente.
--   * Los importes llegan como texto con dos decimales exactos. privado.importe
--     rechaza cualquier otro formato en lugar de dejar que Postgres redondee en
--     silencio (regla de negocio 4).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Esquema privado: funciones auxiliares que la API de datos no expone.
-- ---------------------------------------------------------------------------
create schema if not exists privado;

revoke all on schema privado from public;
grant usage on schema privado to authenticated;

create function privado.importe(texto text)
returns numeric(12,2)
language plpgsql
immutable
set search_path = ''
as $$
begin
  if texto is null then
    return null;
  end if;
  if texto !~ '^-?[0-9]{1,10}\.[0-9]{2}$' then
    raise exception 'Importe con formato invalido: %', texto using errcode = '22P02';
  end if;
  return texto::numeric(12,2);
end;
$$;

comment on function privado.importe(text) is
  'Convierte texto con dos decimales exactos a numeric(12,2). Rechaza cualquier otro formato.';

revoke execute on function privado.importe(text) from public, anon;
grant execute on function privado.importe(text) to authenticated;

-- ---------------------------------------------------------------------------
-- guardar_plan · inserta el plan y todas sus asignaciones de forma atómica
-- ---------------------------------------------------------------------------
create function public.guardar_plan(plan jsonb, asignaciones jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  nuevo_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Se requiere una sesion iniciada' using errcode = '42501';
  end if;

  if jsonb_typeof(asignaciones) is distinct from 'array' then
    raise exception 'Las asignaciones deben ser una lista' using errcode = '22023';
  end if;
  if jsonb_array_length(asignaciones) = 0 then
    raise exception 'El plan requiere al menos una asignacion semanal' using errcode = '22023';
  end if;

  insert into public.planes (
    usuario_id,
    fecha_referencia,
    inicio_horizonte,
    fin_horizonte,
    meta_monto_objetivo,
    meta_fecha_objetivo,
    meta_viable,
    ahorro_posible,
    faltante_meta,
    advertencias
  )
  values (
    (select auth.uid()),
    (plan ->> 'fecha_referencia')::date,
    (plan ->> 'inicio_horizonte')::date,
    (plan ->> 'fin_horizonte')::date,
    privado.importe(plan ->> 'meta_monto_objetivo'),
    (plan ->> 'meta_fecha_objetivo')::date,
    (plan ->> 'meta_viable')::boolean,
    privado.importe(plan ->> 'ahorro_posible'),
    privado.importe(plan ->> 'faltante_meta'),
    coalesce(plan -> 'advertencias', '[]'::jsonb)
  )
  returning id into nuevo_id;

  insert into public.asignaciones_semanales (
    plan_id,
    numero_semana,
    fecha_inicio,
    fecha_fin,
    ingresos_extra,
    monto_disponible,
    monto_apartado,
    monto_vencimientos,
    remanente,
    aporte_meta,
    sobrecargada,
    en_deficit,
    detalle
  )
  select
    nuevo_id,
    (a ->> 'numero_semana')::smallint,
    (a ->> 'fecha_inicio')::date,
    (a ->> 'fecha_fin')::date,
    privado.importe(a ->> 'ingresos_extra'),
    privado.importe(a ->> 'monto_disponible'),
    privado.importe(a ->> 'monto_apartado'),
    privado.importe(a ->> 'monto_vencimientos'),
    privado.importe(a ->> 'remanente'),
    privado.importe(a ->> 'aporte_meta'),
    (a ->> 'sobrecargada')::boolean,
    (a ->> 'en_deficit')::boolean,
    a -> 'detalle'
  from jsonb_array_elements(asignaciones) as a;

  return nuevo_id;
end;
$$;

comment on function public.guardar_plan(jsonb, jsonb) is
  'Guarda un plan y sus asignaciones semanales en una sola transacción (RF-12, sección 3.7.1).';

-- Postgres concede EXECUTE a PUBLIC en toda función nueva; solo el usuario con
-- sesión debe poder guardar planes.
revoke execute on function public.guardar_plan(jsonb, jsonb) from public, anon;
grant execute on function public.guardar_plan(jsonb, jsonb) to authenticated;

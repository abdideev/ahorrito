-- ============================================================================
-- Fase 2, paso 2.1 · Esquema relacional de Ahorrito
-- ----------------------------------------------------------------------------
-- Modelo entidad-relación de la sección 3.4 del documento maestro, ajustado por
-- la solicitud de cambio SC-03 (incidencia #10) para almacenar el plan tal como
-- lo produce el motor de cálculo (C-03).
--
-- Convenciones:
--   * Todos los importes usan numeric(12,2) (decisión de diseño 3.4.3). El motor
--     calcula en centavos enteros; la conversión ocurre en el adaptador (C-05).
--   * Los vencimientos no se almacenan: se derivan en cada cálculo (SUP-04).
--   * Ninguna tabla queda accesible al crearse. Esta migración revoca todos los
--     privilegios de los roles de la API; la siguiente activa la seguridad por
--     fila y concede solo lo necesario. Así no existe un instante en que una tabla
--     esté expuesta sin políticas, sea cual sea la configuración del proyecto.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- perfiles · uno por usuario de Supabase Auth
-- ---------------------------------------------------------------------------
create table public.perfiles (
  id        uuid        primary key references auth.users (id) on delete cascade,
  correo    text        not null,
  creado_en timestamptz not null default now()
);

comment on table public.perfiles is
  'Perfil del usuario. Se crea automáticamente al registrarse en Supabase Auth.';

-- ---------------------------------------------------------------------------
-- presupuestos · como máximo uno por usuario (RF-02)
-- SC-03: se elimina "periodicidad" (el presupuesto es semanal) y "monto" pasa a
-- "monto_semanal".
-- ---------------------------------------------------------------------------
create table public.presupuestos (
  id                uuid          primary key default gen_random_uuid(),
  usuario_id        uuid          not null unique references public.perfiles (id) on delete cascade,
  monto_semanal     numeric(12,2) not null check (monto_semanal > 0),
  dia_inicio_semana smallint      not null check (dia_inicio_semana between 0 and 6)
);

comment on column public.presupuestos.dia_inicio_semana is '0 corresponde a domingo (contrato de I-01).';

-- ---------------------------------------------------------------------------
-- compromisos · pagos con fecha límite (RF-03, RF-04)
-- ---------------------------------------------------------------------------
create table public.compromisos (
  id           uuid          primary key default gen_random_uuid(),
  usuario_id   uuid          not null references public.perfiles (id) on delete cascade,
  denominacion text          not null check (length(btrim(denominacion)) > 0),
  monto        numeric(12,2) not null check (monto > 0),
  fecha_limite date          not null,
  ocurrencias  smallint      not null check (ocurrencias between 1 and 6),
  creado_en    timestamptz   not null default now()
);

comment on column public.compromisos.fecha_limite is 'Vencimiento de la primera ocurrencia.';
comment on column public.compromisos.ocurrencias is
  'Repeticiones mensuales. El límite de 6 implementa SUP-01 como restricción de la base de datos.';

create index compromisos_usuario_id_idx on public.compromisos (usuario_id);

-- ---------------------------------------------------------------------------
-- ingresos_extra · ingresos extraordinarios (RF-05)
-- ---------------------------------------------------------------------------
create table public.ingresos_extra (
  id         uuid          primary key default gen_random_uuid(),
  usuario_id uuid          not null references public.perfiles (id) on delete cascade,
  monto      numeric(12,2) not null check (monto > 0),
  fecha      date          not null,
  creado_en  timestamptz   not null default now()
);

create index ingresos_extra_usuario_id_idx on public.ingresos_extra (usuario_id);

-- ---------------------------------------------------------------------------
-- metas_ahorro · como máximo una por usuario (RF-06)
-- ---------------------------------------------------------------------------
create table public.metas_ahorro (
  id             uuid          primary key default gen_random_uuid(),
  usuario_id     uuid          not null unique references public.perfiles (id) on delete cascade,
  monto_objetivo numeric(12,2) not null check (monto_objetivo > 0),
  fecha_objetivo date          not null
);

-- ---------------------------------------------------------------------------
-- planes · planes generados (RF-12)
-- SC-03: "horizonte_meses" se sustituye por las fechas del horizonte; se agregan
-- la evaluación de la meta y las advertencias. La meta evaluada se guarda como
-- instantánea (meta_monto_objetivo, meta_fecha_objetivo) porque el usuario puede
-- modificar su meta después de generar el plan.
-- ---------------------------------------------------------------------------
create table public.planes (
  id                  uuid          primary key default gen_random_uuid(),
  usuario_id          uuid          not null references public.perfiles (id) on delete cascade,
  generado_en         timestamptz   not null default now(),
  fecha_referencia    date          not null,
  inicio_horizonte    date          not null,
  fin_horizonte       date          not null,
  meta_monto_objetivo numeric(12,2) check (meta_monto_objetivo > 0),
  meta_fecha_objetivo date,
  meta_viable         boolean,
  ahorro_posible      numeric(12,2) check (ahorro_posible >= 0),
  faltante_meta       numeric(12,2) check (faltante_meta >= 0),
  advertencias        jsonb         not null default '[]'::jsonb,
  explicacion         text,

  constraint planes_horizonte_valido
    check (inicio_horizonte <= fecha_referencia and fecha_referencia <= fin_horizonte),

  -- Un plan sin meta no es "no viable": es "sin evaluar". Los cinco campos de la
  -- evaluación existen todos o no existe ninguno.
  constraint planes_evaluacion_completa check (
    num_nulls(meta_monto_objetivo, meta_fecha_objetivo, meta_viable, ahorro_posible, faltante_meta)
      in (0, 5)
  ),

  constraint planes_advertencias_es_lista check (jsonb_typeof(advertencias) = 'array')
);

comment on column public.planes.explicacion is
  'Explicación en lenguaje natural. Admite nulo: un plan sin explicación es un estado válido (RNF-03).';

create index planes_usuario_generado_idx on public.planes (usuario_id, generado_en desc);

-- ---------------------------------------------------------------------------
-- asignaciones_semanales · una fila por semana del plan (RF-07, RF-08)
-- SC-03: se agregan los campos que produce el motor. "detalle" es una
-- instantánea de apartados y vencimientos, no una llave foránea a compromisos,
-- porque RF-04 permite modificar y eliminar compromisos después de generar el plan.
-- ---------------------------------------------------------------------------
create table public.asignaciones_semanales (
  id                 uuid          primary key default gen_random_uuid(),
  plan_id            uuid          not null references public.planes (id) on delete cascade,
  numero_semana      smallint      not null check (numero_semana >= 1),
  fecha_inicio       date          not null,
  fecha_fin          date          not null,
  ingresos_extra     numeric(12,2) not null default 0 check (ingresos_extra >= 0),
  monto_disponible   numeric(12,2) not null check (monto_disponible > 0),
  monto_apartado     numeric(12,2) not null check (monto_apartado >= 0),
  monto_vencimientos numeric(12,2) not null check (monto_vencimientos >= 0),
  remanente          numeric(12,2) not null,
  aporte_meta        numeric(12,2) not null default 0 check (aporte_meta >= 0),
  sobrecargada       boolean       not null default false,
  en_deficit         boolean       not null default false,
  detalle            jsonb         not null default '{"apartados": [], "vencimientos": []}'::jsonb,

  constraint asignaciones_semana_unica unique (plan_id, numero_semana),

  -- Identidades aritméticas del motor. Solo se replican las que son definiciones
  -- exactas; los criterios de negocio (sobrecarga, déficit) pertenecen a M-04.
  constraint asignaciones_semana_de_siete_dias check (fecha_fin = fecha_inicio + 6),
  constraint asignaciones_remanente_coherente check (remanente = monto_disponible - monto_apartado),
  constraint asignaciones_aporte_dentro_del_remanente check (aporte_meta <= greatest(remanente, 0)),
  constraint asignaciones_detalle_es_objeto check (jsonb_typeof(detalle) = 'object')
);

-- La restricción única (plan_id, numero_semana) ya indexa plan_id como primera columna.

-- ---------------------------------------------------------------------------
-- Creación y sincronización automática del perfil
-- ---------------------------------------------------------------------------
create function public.sincronizar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.perfiles (id, correo) values (new.id, new.email);
  elsif new.email is distinct from old.email then
    update public.perfiles set correo = new.email where id = new.id;
  end if;
  return new;
end;
$$;

comment on function public.sincronizar_perfil() is
  'Crea el perfil al registrarse y mantiene el correo sincronizado con Supabase Auth.';

create trigger al_registrar_usuario
  after insert on auth.users
  for each row execute function public.sincronizar_perfil();

create trigger al_cambiar_correo
  after update of email on auth.users
  for each row execute function public.sincronizar_perfil();

-- Postgres concede EXECUTE a PUBLIC en toda función nueva. Esta solo debe ejecutarla
-- el disparador, nunca un cliente a través de la API.
revoke execute on function public.sincronizar_perfil() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Ninguna tabla es accesible hasta que la migración de seguridad por fila
-- conceda privilegios explícitos.
-- ---------------------------------------------------------------------------
revoke all on table
  public.perfiles,
  public.presupuestos,
  public.compromisos,
  public.ingresos_extra,
  public.metas_ahorro,
  public.planes,
  public.asignaciones_semanales
from anon, authenticated;

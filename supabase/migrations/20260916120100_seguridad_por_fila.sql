-- ============================================================================
-- Fase 2, paso 2.2 · Seguridad por fila
-- ----------------------------------------------------------------------------
-- Implementa RNF-04 y el control del análisis de amenazas AM-01 (sección 3.6.1):
-- ningún usuario puede leer ni modificar los registros de otro. Se verifica con
-- CA-10: diez intentos de acceso cruzado deben devolver un conjunto vacío.
--
-- Principios aplicados:
--   1. Cada tabla activa RLS de forma explícita. No se depende de la opción
--      automática del panel, que no forma parte del repositorio (RNF-09).
--   2. Privilegios mínimos: solo el rol "authenticated" recibe permisos, y solo
--      los que cada tabla necesita. El rol "anon" no recibe ninguno.
--   3. Una política por operación, con el rol declarado en "to" y auth.uid()
--      envuelto en select para evaluarlo una vez por consulta y no por fila.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- perfiles · el usuario solo consulta el suyo; lo crea y actualiza el disparador
-- ---------------------------------------------------------------------------
alter table public.perfiles enable row level security;

grant select on table public.perfiles to authenticated;

create policy "perfiles: consultar el propio"
  on public.perfiles for select to authenticated
  using ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- presupuestos · CRUD sobre los registros propios
-- ---------------------------------------------------------------------------
alter table public.presupuestos enable row level security;

grant select, insert, update, delete on table public.presupuestos to authenticated;

create policy "presupuestos: consultar los propios"
  on public.presupuestos for select to authenticated
  using ((select auth.uid()) = usuario_id);

create policy "presupuestos: crear para si mismo"
  on public.presupuestos for insert to authenticated
  with check ((select auth.uid()) = usuario_id);

create policy "presupuestos: modificar los propios"
  on public.presupuestos for update to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

create policy "presupuestos: eliminar los propios"
  on public.presupuestos for delete to authenticated
  using ((select auth.uid()) = usuario_id);

-- ---------------------------------------------------------------------------
-- compromisos · CRUD sobre los registros propios
-- ---------------------------------------------------------------------------
alter table public.compromisos enable row level security;

grant select, insert, update, delete on table public.compromisos to authenticated;

create policy "compromisos: consultar los propios"
  on public.compromisos for select to authenticated
  using ((select auth.uid()) = usuario_id);

create policy "compromisos: crear para si mismo"
  on public.compromisos for insert to authenticated
  with check ((select auth.uid()) = usuario_id);

create policy "compromisos: modificar los propios"
  on public.compromisos for update to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

create policy "compromisos: eliminar los propios"
  on public.compromisos for delete to authenticated
  using ((select auth.uid()) = usuario_id);

-- ---------------------------------------------------------------------------
-- ingresos_extra · CRUD sobre los registros propios
-- ---------------------------------------------------------------------------
alter table public.ingresos_extra enable row level security;

grant select, insert, update, delete on table public.ingresos_extra to authenticated;

create policy "ingresos_extra: consultar los propios"
  on public.ingresos_extra for select to authenticated
  using ((select auth.uid()) = usuario_id);

create policy "ingresos_extra: crear para si mismo"
  on public.ingresos_extra for insert to authenticated
  with check ((select auth.uid()) = usuario_id);

create policy "ingresos_extra: modificar los propios"
  on public.ingresos_extra for update to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

create policy "ingresos_extra: eliminar los propios"
  on public.ingresos_extra for delete to authenticated
  using ((select auth.uid()) = usuario_id);

-- ---------------------------------------------------------------------------
-- metas_ahorro · CRUD sobre los registros propios
-- ---------------------------------------------------------------------------
alter table public.metas_ahorro enable row level security;

grant select, insert, update, delete on table public.metas_ahorro to authenticated;

create policy "metas_ahorro: consultar las propias"
  on public.metas_ahorro for select to authenticated
  using ((select auth.uid()) = usuario_id);

create policy "metas_ahorro: crear para si mismo"
  on public.metas_ahorro for insert to authenticated
  with check ((select auth.uid()) = usuario_id);

create policy "metas_ahorro: modificar las propias"
  on public.metas_ahorro for update to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

create policy "metas_ahorro: eliminar las propias"
  on public.metas_ahorro for delete to authenticated
  using ((select auth.uid()) = usuario_id);

-- ---------------------------------------------------------------------------
-- planes · un plan generado es un hecho histórico.
-- Se puede consultar, crear y eliminar, pero sus cifras no se modifican: el
-- privilegio de actualización se concede solo sobre la columna "explicacion",
-- que el orquestador completa después de responder el plan (RNF-01, RNF-03).
-- ---------------------------------------------------------------------------
alter table public.planes enable row level security;

grant select, insert, delete on table public.planes to authenticated;
grant update (explicacion) on table public.planes to authenticated;

create policy "planes: consultar los propios"
  on public.planes for select to authenticated
  using ((select auth.uid()) = usuario_id);

create policy "planes: crear para si mismo"
  on public.planes for insert to authenticated
  with check ((select auth.uid()) = usuario_id);

create policy "planes: agregar explicacion a los propios"
  on public.planes for update to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

create policy "planes: eliminar los propios"
  on public.planes for delete to authenticated
  using ((select auth.uid()) = usuario_id);

-- ---------------------------------------------------------------------------
-- asignaciones_semanales · no tienen columna de propietario: la propiedad se
-- resuelve a través del plan al que pertenecen. Son inmutables; se eliminan en
-- cascada junto con su plan.
-- ---------------------------------------------------------------------------
alter table public.asignaciones_semanales enable row level security;

grant select, insert on table public.asignaciones_semanales to authenticated;

create policy "asignaciones_semanales: consultar las de planes propios"
  on public.asignaciones_semanales for select to authenticated
  using (
    exists (
      select 1 from public.planes p
      where p.id = plan_id and p.usuario_id = (select auth.uid())
    )
  );

create policy "asignaciones_semanales: crear en planes propios"
  on public.asignaciones_semanales for insert to authenticated
  with check (
    exists (
      select 1 from public.planes p
      where p.id = plan_id and p.usuario_id = (select auth.uid())
    )
  );

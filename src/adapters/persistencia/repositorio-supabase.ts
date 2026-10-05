/**
 * Adaptador de persistencia (C-05): implementa el puerto I-04 sobre Supabase.
 *
 * Recibe el cliente ya creado con la sesión del usuario, en lugar de construirlo: así
 * la identidad la decide quien llama y la seguridad por fila la aplica la base de datos.
 * Los importes se leen como texto (`::text`) para convertirlos a centavos sin pasar por
 * punto flotante.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FechaIso, MetaAhorro, Presupuesto } from "@/core/tipos";
import type { DatosCompromiso, DatosIngreso, RepositorioPlanes } from "@/ports/repositorio";
import {
  compromisoAFila,
  esUuid,
  filaACompromiso,
  filaAIngreso,
  filaAMeta,
  filaAPresupuesto,
  filaAResumen,
  filasAEntrada,
  filasAPlan,
  ingresoAFila,
  metaAFila,
  planAFilas,
  presupuestoAFila,
  type FilaCompromiso,
  type FilaCompromisoGuardado,
  type FilaIngresoExtra,
  type FilaMetaAhorro,
  type FilaPlanLeida,
  type FilaPresupuesto,
  type FilaResumenPlan,
} from "./filas";

/** Error de la capa de persistencia. No expone el mensaje original de la base de datos. */
export class ErrorPersistencia extends Error {
  constructor(
    mensaje: string,
    readonly codigo: string | undefined,
  ) {
    super(mensaje);
    this.name = "ErrorPersistencia";
  }
}

const SELECCION_PLAN = [
  "id",
  "generado_en",
  "explicacion",
  "fecha_referencia",
  "inicio_horizonte",
  "fin_horizonte",
  "meta_monto_objetivo::text",
  "meta_fecha_objetivo",
  "meta_viable",
  "ahorro_posible::text",
  "faltante_meta::text",
  "advertencias",
  `asignaciones_semanales(${[
    "numero_semana",
    "fecha_inicio",
    "fecha_fin",
    "ingresos_extra::text",
    "monto_disponible::text",
    "monto_apartado::text",
    "monto_vencimientos::text",
    "remanente::text",
    "aporte_meta::text",
    "sobrecargada",
    "en_deficit",
    "detalle",
  ].join(", ")})`,
].join(", ");

export function crearRepositorioSupabase(cliente: SupabaseClient): RepositorioPlanes {
  return {
    async guardarPlan(plan) {
      const filas = planAFilas(plan);
      const { data, error } = await cliente.rpc("guardar_plan", {
        plan: filas.plan,
        asignaciones: filas.asignaciones,
      });
      if (error) {
        throw new ErrorPersistencia("No se pudo guardar el plan.", error.code);
      }
      if (typeof data !== "string") {
        throw new ErrorPersistencia("La base de datos no devolvio el identificador del plan.", undefined);
      }
      return data;
    },

    async guardarExplicacion(id, explicacion) {
      if (!esUuid(id)) {
        return false;
      }
      // El privilegio de actualizacion se limita a esta columna y la politica a los
      // planes propios: con un id ajeno la consulta no actualiza ninguna fila.
      const { data, error } = await cliente.from("planes").update({ explicacion }).eq("id", id).select("id");
      if (error) {
        throw new ErrorPersistencia("No se pudo guardar la explicacion del plan.", error.code);
      }
      return (data ?? []).length > 0;
    },

    async listarPlanes() {
      const { data, error } = await cliente
        .from("planes")
        .select(
          "id, generado_en, fecha_referencia, inicio_horizonte, fin_horizonte, meta_viable, asignaciones_semanales(count)",
        )
        .order("generado_en", { ascending: false });
      if (error) {
        throw new ErrorPersistencia("No se pudieron consultar los planes.", error.code);
      }
      // Sin tipos generados de la base de datos, la forma se valida al convertir.
      return (data as unknown as FilaResumenPlan[]).map(filaAResumen);
    },

    async obtenerPlan(id) {
      if (!esUuid(id)) {
        return null;
      }
      const { data, error } = await cliente.from("planes").select(SELECCION_PLAN).eq("id", id).maybeSingle();
      if (error) {
        throw new ErrorPersistencia("No se pudo consultar el plan.", error.code);
      }
      if (data === null) {
        // Inexistente o de otro usuario: la seguridad por fila no distingue ambos casos.
        return null;
      }
      const fila = data as unknown as FilaPlanLeida;
      return {
        id: fila.id,
        generadoEn: fila.generado_en,
        explicacion: fila.explicacion,
        plan: filasAPlan(fila),
      };
    },

    async eliminarPlan(id: string) {
      // Las asignaciones semanales se borran en cascada (on delete cascade) y la
      // política "planes: eliminar los propios" deja fuera cualquier plan ajeno.
      return eliminarFila(cliente, "planes", id, "No se pudo eliminar el plan.");
    },

    async obtenerDatosEntrada(fechaReferencia: FechaIso) {
      const [presupuesto, compromisos, ingresos, meta] = await Promise.all([
        cliente.from("presupuestos").select("monto_semanal::text, dia_inicio_semana").maybeSingle(),
        cliente
          .from("compromisos")
          .select("id, monto::text, fecha_limite, ocurrencias")
          .order("creado_en", { ascending: true }),
        cliente.from("ingresos_extra").select("id, monto::text, fecha").order("fecha", { ascending: true }),
        cliente.from("metas_ahorro").select("monto_objetivo::text, fecha_objetivo").maybeSingle(),
      ]);
      const error = presupuesto.error ?? compromisos.error ?? ingresos.error ?? meta.error;
      if (error) {
        throw new ErrorPersistencia("No se pudieron consultar los datos de entrada.", error.code);
      }
      return filasAEntrada(
        fechaReferencia,
        presupuesto.data as unknown as FilaPresupuesto | null,
        (compromisos.data ?? []) as unknown as FilaCompromiso[],
        (ingresos.data ?? []) as unknown as FilaIngresoExtra[],
        meta.data as unknown as FilaMetaAhorro | null,
      );
    },

    // -----------------------------------------------------------------------
    // Captura del usuario (RF-02 a RF-06), incorporada a I-04 por SC-06.
    //
    // Las altas necesitan escribir `usuario_id`, que la seguridad por fila exige
    // igual a auth.uid(). Ese identificador se toma de la sesión verificada por
    // Supabase, nunca de un parámetro: es el principio que fijó SC-04.
    // -----------------------------------------------------------------------

    async obtenerPresupuesto() {
      const { data, error } = await cliente
        .from("presupuestos")
        .select("monto_semanal::text, dia_inicio_semana")
        .maybeSingle();
      if (error) {
        throw new ErrorPersistencia("No se pudo consultar el presupuesto.", error.code);
      }
      return data === null ? null : filaAPresupuesto(data as unknown as FilaPresupuesto);
    },

    async guardarPresupuesto(presupuesto: Presupuesto) {
      const usuarioId = await idDeLaSesion(cliente);
      // Hay un presupuesto por usuario: la columna usuario_id es unique, así que el
      // upsert reemplaza el existente en lugar de crear un segundo.
      const { error } = await cliente
        .from("presupuestos")
        .upsert({ usuario_id: usuarioId, ...presupuestoAFila(presupuesto) }, { onConflict: "usuario_id" });
      if (error) {
        throw new ErrorPersistencia("No se pudo guardar el presupuesto.", error.code);
      }
    },

    async listarCompromisos() {
      const { data, error } = await cliente
        .from("compromisos")
        .select("id, denominacion, monto::text, fecha_limite, ocurrencias")
        .order("creado_en", { ascending: true });
      if (error) {
        throw new ErrorPersistencia("No se pudieron consultar los compromisos.", error.code);
      }
      return (data as unknown as FilaCompromisoGuardado[]).map(filaACompromiso);
    },

    async agregarCompromiso(datos: DatosCompromiso) {
      const usuarioId = await idDeLaSesion(cliente);
      const { data, error } = await cliente
        .from("compromisos")
        .insert({ usuario_id: usuarioId, ...compromisoAFila(datos) })
        .select("id")
        .single();
      if (error) {
        throw new ErrorPersistencia("No se pudo guardar el compromiso.", error.code);
      }
      return (data as { id: string }).id;
    },

    async actualizarCompromiso(id: string, datos: DatosCompromiso) {
      if (!esUuid(id)) {
        return false;
      }
      const { data, error } = await cliente
        .from("compromisos")
        .update(compromisoAFila(datos))
        .eq("id", id)
        .select("id");
      if (error) {
        throw new ErrorPersistencia("No se pudo modificar el compromiso.", error.code);
      }
      return (data ?? []).length > 0;
    },

    async eliminarCompromiso(id: string) {
      return eliminarFila(cliente, "compromisos", id, "No se pudo eliminar el compromiso.");
    },

    async listarIngresos() {
      const { data, error } = await cliente
        .from("ingresos_extra")
        .select("id, monto::text, fecha")
        .order("fecha", { ascending: true });
      if (error) {
        throw new ErrorPersistencia("No se pudieron consultar los ingresos.", error.code);
      }
      return (data as unknown as FilaIngresoExtra[]).map(filaAIngreso);
    },

    async agregarIngreso(datos: DatosIngreso) {
      const usuarioId = await idDeLaSesion(cliente);
      const { data, error } = await cliente
        .from("ingresos_extra")
        .insert({ usuario_id: usuarioId, ...ingresoAFila(datos) })
        .select("id")
        .single();
      if (error) {
        throw new ErrorPersistencia("No se pudo guardar el ingreso.", error.code);
      }
      return (data as { id: string }).id;
    },

    async eliminarIngreso(id: string) {
      return eliminarFila(cliente, "ingresos_extra", id, "No se pudo eliminar el ingreso.");
    },

    async obtenerMeta() {
      const { data, error } = await cliente
        .from("metas_ahorro")
        .select("monto_objetivo::text, fecha_objetivo")
        .maybeSingle();
      if (error) {
        throw new ErrorPersistencia("No se pudo consultar la meta de ahorro.", error.code);
      }
      return data === null ? null : filaAMeta(data as unknown as FilaMetaAhorro);
    },

    async guardarMeta(meta: MetaAhorro) {
      const usuarioId = await idDeLaSesion(cliente);
      const { error } = await cliente
        .from("metas_ahorro")
        .upsert({ usuario_id: usuarioId, ...metaAFila(meta) }, { onConflict: "usuario_id" });
      if (error) {
        throw new ErrorPersistencia("No se pudo guardar la meta de ahorro.", error.code);
      }
    },

    async eliminarMeta() {
      const usuarioId = await idDeLaSesion(cliente);
      const { data, error } = await cliente
        .from("metas_ahorro")
        .delete()
        .eq("usuario_id", usuarioId)
        .select("id");
      if (error) {
        throw new ErrorPersistencia("No se pudo eliminar la meta de ahorro.", error.code);
      }
      return (data ?? []).length > 0;
    },
  };
}

/**
 * Identificador del usuario de la sesión, verificado por Supabase. Solo se usa para
 * escribir `usuario_id` en las altas; nunca llega como parámetro desde la interfaz.
 */
async function idDeLaSesion(cliente: SupabaseClient): Promise<string> {
  const { data, error } = await cliente.auth.getClaims();
  const id = data?.claims?.sub;
  if (error || typeof id !== "string") {
    throw new ErrorPersistencia("No hay sesion para guardar los datos.", error?.code);
  }
  return id;
}

/** Baja por identificador. La seguridad por fila limita el alcance a las filas propias. */
async function eliminarFila(
  cliente: SupabaseClient,
  tabla: "compromisos" | "ingresos_extra" | "planes",
  id: string,
  mensaje: string,
): Promise<boolean> {
  if (!esUuid(id)) {
    return false;
  }
  const { data, error } = await cliente.from(tabla).delete().eq("id", id).select("id");
  if (error) {
    throw new ErrorPersistencia(mensaje, error.code);
  }
  return (data ?? []).length > 0;
}

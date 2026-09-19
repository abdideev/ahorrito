/**
 * Adaptador de persistencia (C-05): implementa el puerto I-04 sobre Supabase.
 *
 * Recibe el cliente ya creado con la sesión del usuario, en lugar de construirlo: así
 * la identidad la decide quien llama y la seguridad por fila la aplica la base de datos.
 * Los importes se leen como texto (`::text`) para convertirlos a centavos sin pasar por
 * punto flotante.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FechaIso } from "@/core/tipos";
import type { RepositorioPlanes } from "@/ports/repositorio";
import {
  esUuid,
  filaAResumen,
  filasAEntrada,
  filasAPlan,
  planAFilas,
  type FilaCompromiso,
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
  };
}

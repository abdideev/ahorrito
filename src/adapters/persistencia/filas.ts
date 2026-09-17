/**
 * Traducción entre el modelo del dominio (C-03) y las filas de la base de datos (C-07).
 *
 * Los datos leídos se validan al reconstruir el dominio con los constructores del
 * núcleo (`centavos`, `fechaIso`): una fila corrupta produce un error explícito en lugar
 * de un plan con importes o fechas inválidos.
 *
 * Dentro de las columnas jsonb (`detalle`, `advertencias`) los importes se guardan como
 * centavos enteros, que JSON representa sin pérdida. Las columnas de importe usan
 * numeric(12,2) conforme a la decisión de diseño 3.4.3.
 */

import { fechaIso } from "@/core/calendario";
import {
  centavos,
  restarCentavos,
  type Advertencia,
  type Apartado,
  type AsignacionSemanal,
  type Compromiso,
  type DiaSemana,
  type EntradaPlan,
  type FechaIso,
  type IngresoExtra,
  type Plan,
  type Vencimiento,
} from "@/core/tipos";
import type { ResumenPlan } from "@/ports/repositorio";
import { centavosATexto, textoACentavos } from "./importes";

// ---------------------------------------------------------------------------
// Filas de escritura: la forma que recibe la función guardar_plan
// ---------------------------------------------------------------------------

export interface DetalleSemana {
  readonly apartados: readonly Apartado[];
  readonly vencimientos: readonly Vencimiento[];
}

export interface FilaPlan {
  readonly fecha_referencia: string;
  readonly inicio_horizonte: string;
  readonly fin_horizonte: string;
  readonly meta_monto_objetivo: string | null;
  readonly meta_fecha_objetivo: string | null;
  readonly meta_viable: boolean | null;
  readonly ahorro_posible: string | null;
  readonly faltante_meta: string | null;
  readonly advertencias: readonly Advertencia[];
}

export interface FilaAsignacion {
  readonly numero_semana: number;
  readonly fecha_inicio: string;
  readonly fecha_fin: string;
  readonly ingresos_extra: string;
  readonly monto_disponible: string;
  readonly monto_apartado: string;
  readonly monto_vencimientos: string;
  readonly remanente: string;
  readonly aporte_meta: string;
  readonly sobrecargada: boolean;
  readonly en_deficit: boolean;
  readonly detalle: DetalleSemana;
}

// ---------------------------------------------------------------------------
// Filas de lectura: la forma que devuelve PostgREST con los importes como texto
// ---------------------------------------------------------------------------

export interface FilaPlanLeida extends FilaPlan {
  readonly id: string;
  readonly generado_en: string;
  readonly explicacion: string | null;
  readonly asignaciones_semanales: readonly FilaAsignacion[];
}

export interface FilaResumenPlan {
  readonly id: string;
  readonly generado_en: string;
  readonly fecha_referencia: string;
  readonly inicio_horizonte: string;
  readonly fin_horizonte: string;
  readonly meta_viable: boolean | null;
  readonly asignaciones_semanales: readonly { readonly count: number }[];
}

export interface FilaPresupuesto {
  readonly monto_semanal: string;
  readonly dia_inicio_semana: number;
}

export interface FilaCompromiso {
  readonly id: string;
  readonly monto: string;
  readonly fecha_limite: string;
  readonly ocurrencias: number;
}

export interface FilaIngresoExtra {
  readonly id: string;
  readonly monto: string;
  readonly fecha: string;
}

export interface FilaMetaAhorro {
  readonly monto_objetivo: string;
  readonly fecha_objetivo: string;
}

// ---------------------------------------------------------------------------
// Dominio → filas
// ---------------------------------------------------------------------------

export function planAFilas(plan: Plan): { plan: FilaPlan; asignaciones: FilaAsignacion[] } {
  const meta = plan.evaluacionMeta;
  return {
    plan: {
      fecha_referencia: plan.fechaReferencia,
      inicio_horizonte: plan.inicioHorizonte,
      fin_horizonte: plan.finHorizonte,
      meta_monto_objetivo: meta === null ? null : centavosATexto(meta.montoObjetivo),
      meta_fecha_objetivo: meta === null ? null : meta.fechaObjetivo,
      meta_viable: meta === null ? null : meta.viable,
      ahorro_posible: meta === null ? null : centavosATexto(meta.ahorroPosible),
      faltante_meta: meta === null ? null : centavosATexto(meta.faltante),
      advertencias: plan.advertencias,
    },
    asignaciones: plan.asignaciones.map((asignacion) => ({
      numero_semana: asignacion.numeroSemana,
      fecha_inicio: asignacion.fechaInicio,
      fecha_fin: asignacion.fechaFin,
      ingresos_extra: centavosATexto(asignacion.ingresosExtra),
      monto_disponible: centavosATexto(asignacion.montoDisponible),
      monto_apartado: centavosATexto(asignacion.montoApartado),
      monto_vencimientos: centavosATexto(asignacion.montoVencimientos),
      remanente: centavosATexto(asignacion.remanente),
      aporte_meta: centavosATexto(asignacion.aporteMeta),
      sobrecargada: asignacion.sobrecargada,
      en_deficit: asignacion.enDeficit,
      detalle: { apartados: asignacion.apartados, vencimientos: asignacion.vencimientos },
    })),
  };
}

// ---------------------------------------------------------------------------
// Filas → dominio
// ---------------------------------------------------------------------------

export function filasAPlan(fila: FilaPlanLeida): Plan {
  const asignaciones = [...fila.asignaciones_semanales]
    .sort((a, b) => a.numero_semana - b.numero_semana)
    .map(filaAAsignacion);

  const evaluacionMeta =
    fila.meta_viable === null
      ? null
      : {
          montoObjetivo: textoACentavos(requerido(fila.meta_monto_objetivo, "meta_monto_objetivo")),
          fechaObjetivo: fechaIso(requerido(fila.meta_fecha_objetivo, "meta_fecha_objetivo")),
          ahorroPosible: textoACentavos(requerido(fila.ahorro_posible, "ahorro_posible")),
          viable: fila.meta_viable,
          faltante: textoACentavos(requerido(fila.faltante_meta, "faltante_meta")),
          // El motor solo lista las semanas con aporte mayor que cero.
          aportes: asignaciones
            .filter((asignacion) => asignacion.aporteMeta > 0)
            .map((asignacion) => ({ numeroSemana: asignacion.numeroSemana, monto: asignacion.aporteMeta })),
        };

  return {
    fechaReferencia: fechaIso(fila.fecha_referencia),
    inicioHorizonte: fechaIso(fila.inicio_horizonte),
    finHorizonte: fechaIso(fila.fin_horizonte),
    asignaciones,
    evaluacionMeta,
    advertencias: comoLista(fila.advertencias, "advertencias").map(leerAdvertencia),
  };
}

function filaAAsignacion(fila: FilaAsignacion): AsignacionSemanal {
  const ingresosExtra = textoACentavos(fila.ingresos_extra);
  const montoDisponible = textoACentavos(fila.monto_disponible);
  const detalle = comoObjeto(fila.detalle, "detalle");
  return {
    numeroSemana: comoEntero(fila.numero_semana, "numero_semana"),
    fechaInicio: fechaIso(fila.fecha_inicio),
    fechaFin: fechaIso(fila.fecha_fin),
    // El presupuesto no se almacena: es lo disponible menos los ingresos extraordinarios.
    presupuesto: restarCentavos(montoDisponible, ingresosExtra),
    ingresosExtra,
    montoDisponible,
    montoApartado: textoACentavos(fila.monto_apartado),
    montoVencimientos: textoACentavos(fila.monto_vencimientos),
    remanente: textoACentavos(fila.remanente),
    aporteMeta: textoACentavos(fila.aporte_meta),
    apartados: comoLista(detalle.apartados, "detalle.apartados").map(leerApartado),
    vencimientos: comoLista(detalle.vencimientos, "detalle.vencimientos").map(leerVencimiento),
    sobrecargada: comoBooleano(fila.sobrecargada, "sobrecargada"),
    enDeficit: comoBooleano(fila.en_deficit, "en_deficit"),
  };
}

export function filaAResumen(fila: FilaResumenPlan): ResumenPlan {
  return {
    id: fila.id,
    generadoEn: fila.generado_en,
    fechaReferencia: fechaIso(fila.fecha_referencia),
    inicioHorizonte: fechaIso(fila.inicio_horizonte),
    finHorizonte: fechaIso(fila.fin_horizonte),
    semanas: fila.asignaciones_semanales[0]?.count ?? 0,
    metaViable: fila.meta_viable,
  };
}

/**
 * Reconstruye la entrada del motor a partir de los datos capturados. La denominación de
 * los compromisos no se lee: el motor no la usa (RNF-10).
 */
export function filasAEntrada(
  fechaReferencia: FechaIso,
  presupuesto: FilaPresupuesto | null,
  compromisos: readonly FilaCompromiso[],
  ingresos: readonly FilaIngresoExtra[],
  meta: FilaMetaAhorro | null,
): EntradaPlan | null {
  if (presupuesto === null || compromisos.length === 0) {
    return null;
  }
  return {
    fechaReferencia,
    presupuesto: {
      montoSemanal: textoACentavos(presupuesto.monto_semanal),
      diaInicioSemana: comoDiaSemana(presupuesto.dia_inicio_semana),
    },
    compromisos: compromisos.map(
      (fila): Compromiso => ({
        id: fila.id,
        monto: textoACentavos(fila.monto),
        fechaLimite: fechaIso(fila.fecha_limite),
        ocurrencias: comoEntero(fila.ocurrencias, "ocurrencias"),
      }),
    ),
    ingresosExtra: ingresos.map(
      (fila): IngresoExtra => ({
        id: fila.id,
        monto: textoACentavos(fila.monto),
        fecha: fechaIso(fila.fecha),
      }),
    ),
    metaAhorro:
      meta === null
        ? null
        : { montoObjetivo: textoACentavos(meta.monto_objetivo), fechaObjetivo: fechaIso(meta.fecha_objetivo) },
  };
}

const PATRON_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Evita enviar a la base de datos identificadores que no son UUID. */
export function esUuid(valor: string): boolean {
  return PATRON_UUID.test(valor);
}

// ---------------------------------------------------------------------------
// Lectura validada de valores jsonb
// ---------------------------------------------------------------------------

const TIPOS_ADVERTENCIA = new Set<Advertencia["tipo"]>([
  "semana-sobrecargada",
  "semana-en-deficit",
  "meta-no-alcanzable",
  "meta-fuera-de-horizonte",
  "vencimiento-anterior-a-referencia",
  "vencimiento-fuera-de-horizonte",
  "ingreso-fuera-de-horizonte",
]);

function leerAdvertencia(valor: unknown): Advertencia {
  const objeto = comoObjeto(valor, "advertencia");
  const tipo = objeto.tipo;
  if (typeof tipo !== "string" || !TIPOS_ADVERTENCIA.has(tipo as Advertencia["tipo"])) {
    throw new RangeError(`Tipo de advertencia desconocido: ${String(tipo)}.`);
  }
  // Se validan los importes y las fechas presentes; la forma de cada tipo la fija el motor.
  for (const campo of ["excedente", "faltante"]) {
    if (campo in objeto) {
      centavos(comoEntero(objeto[campo], campo));
    }
  }
  for (const campo of ["fecha", "fechaObjetivo", "finHorizonte"]) {
    if (campo in objeto) {
      fechaIso(comoTexto(objeto[campo], campo));
    }
  }
  return objeto as unknown as Advertencia;
}

function leerApartado(valor: unknown): Apartado {
  const objeto = comoObjeto(valor, "apartado");
  return {
    compromisoId: comoTexto(objeto.compromisoId, "compromisoId"),
    ocurrencia: comoEntero(objeto.ocurrencia, "ocurrencia"),
    monto: centavos(comoEntero(objeto.monto, "monto")),
  };
}

function leerVencimiento(valor: unknown): Vencimiento {
  const objeto = comoObjeto(valor, "vencimiento");
  return {
    compromisoId: comoTexto(objeto.compromisoId, "compromisoId"),
    ocurrencia: comoEntero(objeto.ocurrencia, "ocurrencia"),
    fecha: fechaIso(comoTexto(objeto.fecha, "fecha")),
    monto: centavos(comoEntero(objeto.monto, "monto")),
  };
}

function comoObjeto(valor: unknown, campo: string): Record<string, unknown> {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) {
    throw new RangeError(`Se esperaba un objeto en ${campo}.`);
  }
  return valor as Record<string, unknown>;
}

function comoLista(valor: unknown, campo: string): unknown[] {
  if (!Array.isArray(valor)) {
    throw new RangeError(`Se esperaba una lista en ${campo}.`);
  }
  return valor;
}

function comoTexto(valor: unknown, campo: string): string {
  if (typeof valor !== "string") {
    throw new RangeError(`Se esperaba texto en ${campo}.`);
  }
  return valor;
}

function comoEntero(valor: unknown, campo: string): number {
  if (typeof valor !== "number" || !Number.isSafeInteger(valor)) {
    throw new RangeError(`Se esperaba un entero en ${campo}.`);
  }
  return valor;
}

function comoBooleano(valor: unknown, campo: string): boolean {
  if (typeof valor !== "boolean") {
    throw new RangeError(`Se esperaba un booleano en ${campo}.`);
  }
  return valor;
}

function comoDiaSemana(valor: unknown): DiaSemana {
  const dia = comoEntero(valor, "dia_inicio_semana");
  if (dia < 0 || dia > 6) {
    throw new RangeError(`Dia de inicio de semana invalido: ${dia}.`);
  }
  return dia as DiaSemana;
}

function requerido<T>(valor: T | null, campo: string): T {
  if (valor === null) {
    throw new RangeError(`Falta ${campo} en un plan con meta de ahorro evaluada.`);
  }
  return valor;
}

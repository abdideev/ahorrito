/**
 * Carga anonimizada que el adaptador de IA (C-04) envía al proveedor (RNF-10, RES-10).
 *
 * RES-10 permite transmitir únicamente montos, fechas y etiquetas genéricas. Esta función
 * es el único punto donde el plan se convierte en lo que sale del sistema, y lo hace por
 * lista blanca: cada campo de la carga se copia de forma explícita. Nunca se propaga un
 * objeto del dominio completo con `...`, de modo que un campo que se agregue mañana al
 * plan no llega al proveedor sin que alguien lo escriba aquí a propósito.
 *
 * Los identificadores de compromisos e ingresos se sustituyen por etiquetas genéricas
 * ("Compromiso 1", "Ingreso 1"). Un UUID no identifica a una persona por sí solo, pero es
 * una clave de la base de datos y no le aporta nada a la explicación (minimización).
 */

import type { Advertencia, AsignacionSemanal, FechaIso, Plan } from "@/core/tipos";
import { centavosATexto } from "@/adapters/persistencia/importes";

/** Importe en pesos con dos decimales, como texto exacto ("1234.50"). */
export type ImporteCarga = string;

export interface VencimientoCarga {
  readonly compromiso: string;
  readonly ocurrencia: number;
  readonly fecha: FechaIso;
  readonly monto: ImporteCarga;
}

export interface ApartadoCarga {
  readonly compromiso: string;
  readonly ocurrencia: number;
  readonly monto: ImporteCarga;
}

export interface SemanaCarga {
  readonly numero: number;
  readonly inicio: FechaIso;
  readonly fin: FechaIso;
  readonly presupuesto: ImporteCarga;
  readonly ingresosExtra: ImporteCarga;
  readonly disponible: ImporteCarga;
  readonly apartado: ImporteCarga;
  readonly remanente: ImporteCarga;
  readonly aporteMeta: ImporteCarga;
  readonly sobrecargada: boolean;
  readonly enDeficit: boolean;
  readonly vencimientos: readonly VencimientoCarga[];
  readonly apartados: readonly ApartadoCarga[];
}

export interface MetaCarga {
  readonly montoObjetivo: ImporteCarga;
  readonly fechaObjetivo: FechaIso;
  readonly ahorroPosible: ImporteCarga;
  readonly viable: boolean;
  readonly faltante: ImporteCarga;
}

export type AdvertenciaCarga =
  | { readonly tipo: "semana-sobrecargada"; readonly semana: number; readonly excedente: ImporteCarga }
  | { readonly tipo: "semana-en-deficit"; readonly semana: number; readonly faltante: ImporteCarga }
  | { readonly tipo: "meta-no-alcanzable"; readonly faltante: ImporteCarga }
  | { readonly tipo: "meta-fuera-de-horizonte"; readonly fechaObjetivo: FechaIso; readonly finHorizonte: FechaIso }
  | {
      readonly tipo: "vencimiento-anterior-a-referencia" | "vencimiento-fuera-de-horizonte";
      readonly compromiso: string;
      readonly ocurrencia: number;
      readonly fecha: FechaIso;
    }
  | { readonly tipo: "ingreso-fuera-de-horizonte"; readonly ingreso: string; readonly fecha: FechaIso };

export interface CargaAnonimizada {
  readonly moneda: "MXN";
  readonly fechaReferencia: FechaIso;
  readonly inicioHorizonte: FechaIso;
  readonly finHorizonte: FechaIso;
  readonly semanas: readonly SemanaCarga[];
  /** Nula cuando el plan no tiene meta de ahorro. */
  readonly meta: MetaCarga | null;
  readonly advertencias: readonly AdvertenciaCarga[];
}

/**
 * Asigna etiquetas genéricas en orden de primera aparición. El orden es determinista para
 * un mismo plan, lo que hace reproducibles las pruebas y la inspección de CA-11.
 */
class Etiquetador {
  private readonly etiquetas = new Map<string, string>();

  constructor(private readonly prefijo: string) {}

  etiqueta(id: string): string {
    let etiqueta = this.etiquetas.get(id);
    if (etiqueta === undefined) {
      etiqueta = `${this.prefijo} ${this.etiquetas.size + 1}`;
      this.etiquetas.set(id, etiqueta);
    }
    return etiqueta;
  }
}

export function construirCarga(plan: Plan): CargaAnonimizada {
  const compromisos = new Etiquetador("Compromiso");
  const ingresos = new Etiquetador("Ingreso");

  return {
    moneda: "MXN",
    fechaReferencia: plan.fechaReferencia,
    inicioHorizonte: plan.inicioHorizonte,
    finHorizonte: plan.finHorizonte,
    semanas: plan.asignaciones.map((asignacion) => semanaACarga(asignacion, compromisos)),
    meta:
      plan.evaluacionMeta === null
        ? null
        : {
            montoObjetivo: centavosATexto(plan.evaluacionMeta.montoObjetivo),
            fechaObjetivo: plan.evaluacionMeta.fechaObjetivo,
            ahorroPosible: centavosATexto(plan.evaluacionMeta.ahorroPosible),
            viable: plan.evaluacionMeta.viable,
            faltante: centavosATexto(plan.evaluacionMeta.faltante),
          },
    advertencias: plan.advertencias.map((advertencia) =>
      advertenciaACarga(advertencia, compromisos, ingresos),
    ),
  };
}

function semanaACarga(asignacion: AsignacionSemanal, compromisos: Etiquetador): SemanaCarga {
  return {
    numero: asignacion.numeroSemana,
    inicio: asignacion.fechaInicio,
    fin: asignacion.fechaFin,
    presupuesto: centavosATexto(asignacion.presupuesto),
    ingresosExtra: centavosATexto(asignacion.ingresosExtra),
    disponible: centavosATexto(asignacion.montoDisponible),
    apartado: centavosATexto(asignacion.montoApartado),
    remanente: centavosATexto(asignacion.remanente),
    aporteMeta: centavosATexto(asignacion.aporteMeta),
    sobrecargada: asignacion.sobrecargada,
    enDeficit: asignacion.enDeficit,
    vencimientos: asignacion.vencimientos.map((vencimiento) => ({
      compromiso: compromisos.etiqueta(vencimiento.compromisoId),
      ocurrencia: vencimiento.ocurrencia,
      fecha: vencimiento.fecha,
      monto: centavosATexto(vencimiento.monto),
    })),
    apartados: asignacion.apartados.map((apartado) => ({
      compromiso: compromisos.etiqueta(apartado.compromisoId),
      ocurrencia: apartado.ocurrencia,
      monto: centavosATexto(apartado.monto),
    })),
  };
}

function advertenciaACarga(
  advertencia: Advertencia,
  compromisos: Etiquetador,
  ingresos: Etiquetador,
): AdvertenciaCarga {
  switch (advertencia.tipo) {
    case "semana-sobrecargada":
      return {
        tipo: advertencia.tipo,
        semana: advertencia.numeroSemana,
        excedente: centavosATexto(advertencia.excedente),
      };
    case "semana-en-deficit":
      return {
        tipo: advertencia.tipo,
        semana: advertencia.numeroSemana,
        faltante: centavosATexto(advertencia.faltante),
      };
    case "meta-no-alcanzable":
      return { tipo: advertencia.tipo, faltante: centavosATexto(advertencia.faltante) };
    case "meta-fuera-de-horizonte":
      return {
        tipo: advertencia.tipo,
        fechaObjetivo: advertencia.fechaObjetivo,
        finHorizonte: advertencia.finHorizonte,
      };
    case "vencimiento-anterior-a-referencia":
    case "vencimiento-fuera-de-horizonte":
      return {
        tipo: advertencia.tipo,
        compromiso: compromisos.etiqueta(advertencia.compromisoId),
        ocurrencia: advertencia.ocurrencia,
        fecha: advertencia.fecha,
      };
    case "ingreso-fuera-de-horizonte":
      return {
        tipo: advertencia.tipo,
        ingreso: ingresos.etiqueta(advertencia.ingresoId),
        fecha: advertencia.fecha,
      };
  }
}

/**
 * Redacción de las advertencias del motor (C-01).
 *
 * El núcleo emite códigos estructurados y no texto, precisamente para que la redacción
 * viva aquí. Esta función es la única que traduce un código a una frase en español, así
 * que cambiar el tono del sistema es cambiar un archivo.
 *
 * Las advertencias que se refieren a un compromiso o a un ingreso reciben un diccionario
 * de denominaciones: al usuario se le muestra el nombre que él escribió, no el
 * identificador de la base de datos ni la etiqueta genérica que ve el modelo de lenguaje.
 */

import type { Advertencia } from "@/core/tipos";
import { formatearPesos } from "@/lib/dinero";

export type Denominaciones = Readonly<Record<string, string>>;

export interface AdvertenciaLegible {
  readonly tipo: Advertencia["tipo"];
  /** "alta" cuando el plan no se puede cumplir tal como está; "media" cuando solo avisa. */
  readonly gravedad: "alta" | "media";
  readonly texto: string;
}

function nombre(denominaciones: Denominaciones, id: string): string {
  return denominaciones[id] ?? "un pago que ya no existe";
}

export function describirAdvertencia(
  advertencia: Advertencia,
  denominaciones: Denominaciones = {},
): AdvertenciaLegible {
  switch (advertencia.tipo) {
    case "semana-sobrecargada":
      return {
        tipo: advertencia.tipo,
        gravedad: "media",
        texto: `Semana ${advertencia.numeroSemana}: lo que vence supera por ${formatearPesos(
          advertencia.excedente,
        )} lo que recibes esa semana. Se cubre con lo apartado antes.`,
      };
    case "semana-en-deficit":
      return {
        tipo: advertencia.tipo,
        gravedad: "alta",
        texto: `Semana ${advertencia.numeroSemana}: faltan ${formatearPesos(
          advertencia.faltante,
        )} para apartar todo lo necesario.`,
      };
    case "meta-no-alcanzable":
      return {
        tipo: advertencia.tipo,
        gravedad: "alta",
        texto: `Tu meta de ahorro no se alcanza en la fecha que elegiste: faltan ${formatearPesos(
          advertencia.faltante,
        )}.`,
      };
    case "meta-fuera-de-horizonte":
      return {
        tipo: advertencia.tipo,
        gravedad: "media",
        texto: `Tu meta vence el ${advertencia.fechaObjetivo}, después del ${advertencia.finHorizonte}, que es hasta donde llega este plan. La evaluación es parcial.`,
      };
    case "vencimiento-anterior-a-referencia":
      return {
        tipo: advertencia.tipo,
        gravedad: "media",
        texto: `"${nombre(denominaciones, advertencia.compromisoId)}" venció el ${
          advertencia.fecha
        }, antes de hoy, así que no entra en este plan.`,
      };
    case "vencimiento-fuera-de-horizonte":
      return {
        tipo: advertencia.tipo,
        gravedad: "media",
        texto: `Un pago de "${nombre(denominaciones, advertencia.compromisoId)}" vence el ${
          advertencia.fecha
        }, más allá del alcance de este plan.`,
      };
    case "ingreso-fuera-de-horizonte":
      return {
        tipo: advertencia.tipo,
        gravedad: "media",
        texto: `El ingreso del ${advertencia.fecha} queda fuera del alcance de este plan y no se toma en cuenta.`,
      };
  }
}

/** Las de gravedad alta primero: son las que exigen una decisión del usuario. */
export function describirAdvertencias(
  advertencias: readonly Advertencia[],
  denominaciones: Denominaciones = {},
): AdvertenciaLegible[] {
  return advertencias
    .map((advertencia) => describirAdvertencia(advertencia, denominaciones))
    .sort((a, b) => (a.gravedad === b.gravedad ? 0 : a.gravedad === "alta" ? -1 : 1));
}

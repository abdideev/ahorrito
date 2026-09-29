/**
 * Etiquetas genéricas de los compromisos de un plan ("Compromiso 1", "Compromiso 2").
 *
 * Son las que viajan al proveedor de inteligencia artificial en lugar de los
 * identificadores y de las denominaciones (RNF-10, RES-10). El mismo cálculo se usa en
 * dos lugares:
 *
 * 1. El adaptador de IA (C-04), al construir la carga anonimizada.
 * 2. La interfaz (C-01), para deshacer la sustitución en el texto que devuelve el
 *    modelo y mostrar al usuario la denominación que él escribió.
 *
 * Vive aquí, y no duplicado en cada lado, porque si los dos órdenes divergieran la
 * interfaz atribuiría un pago a otro. El orden es el de primera aparición en el plan y
 * no depende de la base de datos, de modo que es reproducible a partir del plan solo.
 */

import type { Plan } from "@/core/tipos";

export const PREFIJO_COMPROMISO = "Compromiso";
export const PREFIJO_INGRESO = "Ingreso";

/** Etiqueta por identificador, en orden de primera aparición dentro del plan. */
export function etiquetasDeCompromisos(plan: Plan): Map<string, string> {
  const etiquetas = new Map<string, string>();
  const registrar = (id: string) => {
    if (!etiquetas.has(id)) {
      etiquetas.set(id, `${PREFIJO_COMPROMISO} ${etiquetas.size + 1}`);
    }
  };

  for (const asignacion of plan.asignaciones) {
    asignacion.vencimientos.forEach((vencimiento) => registrar(vencimiento.compromisoId));
    asignacion.apartados.forEach((apartado) => registrar(apartado.compromisoId));
  }
  for (const advertencia of plan.advertencias) {
    if (
      advertencia.tipo === "vencimiento-anterior-a-referencia" ||
      advertencia.tipo === "vencimiento-fuera-de-horizonte"
    ) {
      registrar(advertencia.compromisoId);
    }
  }
  return etiquetas;
}

/**
 * Sustituye en un texto las etiquetas genéricas por las denominaciones del usuario.
 *
 * Se aplica al texto que devuelve el modelo de lenguaje: el modelo nunca conoció las
 * denominaciones, así que la traducción ocurre al presentar, no al solicitar. Las
 * etiquetas se reemplazan de mayor a menor número para que "Compromiso 1" no se coma el
 * prefijo de "Compromiso 12".
 */
export function conDenominaciones(
  texto: string,
  plan: Plan,
  denominaciones: Readonly<Record<string, string>>,
): string {
  const pares = [...etiquetasDeCompromisos(plan)]
    .map(([id, etiqueta]) => ({ etiqueta, denominacion: denominaciones[id] }))
    .filter((par): par is { etiqueta: string; denominacion: string } => par.denominacion !== undefined)
    .sort((a, b) => b.etiqueta.localeCompare(a.etiqueta, "es", { numeric: true }));

  return pares.reduce(
    (resultado, { etiqueta, denominacion }) => resultado.split(etiqueta).join(`"${denominacion}"`),
    texto,
  );
}

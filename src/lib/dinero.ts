/**
 * Conversión entre los pesos que ve el usuario y los centavos enteros que usa el
 * motor (regla de código 2.5.7). Es la frontera: hacia adentro, todo es centavos;
 * hacia afuera, solo se formatea para presentar.
 */

import { centavos, type Centavos } from "@/core/tipos";

const FORMATO_PESOS = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

/** Convierte una cantidad en pesos capturada por el usuario a centavos enteros. */
export function pesosACentavos(pesos: number | string): Centavos {
  const cantidad = typeof pesos === "string" ? Number(pesos.trim()) : pesos;
  if (!Number.isFinite(cantidad)) {
    throw new RangeError(`Cantidad invalida: "${pesos}".`);
  }
  return centavos(Math.round(cantidad * 100));
}

/** Formatea un importe en centavos como pesos mexicanos, solo para presentarlo. */
export function formatearPesos(importe: Centavos): string {
  return FORMATO_PESOS.format(importe / 100);
}

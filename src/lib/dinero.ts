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

/**
 * Importe en centavos como texto plano de dos decimales ("1234.50"), sin símbolo ni
 * separadores de miles: es lo que necesita el atributo `value` de un campo numérico.
 * La aritmética es entera para no reintroducir el punto flotante en la presentación.
 */
export function centavosATextoPlano(importe: Centavos): string {
  const absoluto = Math.abs(importe);
  const centenas = absoluto % 100;
  const pesos = (absoluto - centenas) / 100;
  return `${importe < 0 ? "-" : ""}${pesos}.${String(centenas).padStart(2, "0")}`;
}

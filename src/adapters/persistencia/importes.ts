/**
 * Conversión exacta entre centavos enteros (motor) y numeric(12,2) (base de datos).
 *
 * La regla de negocio 4 prohíbe el punto flotante también en esta frontera. PostgREST
 * devuelve los numeric como números JSON, que JavaScript interpreta en punto flotante;
 * por eso el adaptador los lee convertidos a texto (`columna::text`) y los transforma
 * aquí con aritmética entera. Al escribir, los envía como texto con dos decimales.
 */

import { centavos, type Centavos } from "@/core/tipos";

/** Máximo representable en numeric(12,2): 9 999 999 999.99. */
const PESOS_MAXIMOS = 9_999_999_999;
const PATRON_IMPORTE = /^(-)?(\d{1,10})\.(\d{2})$/;

export function centavosATexto(importe: Centavos): string {
  const absoluto = Math.abs(importe);
  const resto = absoluto % 100;
  const pesos = (absoluto - resto) / 100;
  if (pesos > PESOS_MAXIMOS) {
    throw new RangeError(`Importe fuera del rango de numeric(12,2): ${importe} centavos.`);
  }
  return `${importe < 0 ? "-" : ""}${pesos}.${String(resto).padStart(2, "0")}`;
}

export function textoACentavos(texto: string): Centavos {
  const partes = PATRON_IMPORTE.exec(texto);
  if (partes === null) {
    throw new RangeError(`Importe con formato invalido: "${texto}".`);
  }
  const [, signo, pesos, fraccion] = partes;
  const valor = Number(pesos) * 100 + Number(fraccion);
  return centavos(signo === undefined || valor === 0 ? valor : -valor);
}

/**
 * SC-02 (RF-14). Lógica del huevo de Pascua «Cuadre perfecto».
 *
 * Vive fuera de la interfaz para poder probarse sin navegador, igual que el motor.
 * No pertenece a src/core: revelar créditos no es una regla del dominio financiero.
 *
 * La secuencia tiene dos condiciones:
 * 1. El plan cuadra al centavo: todas las semanas terminan con remanente cero. Solo es
 *    alcanzable porque el motor calcula en centavos enteros.
 * 2. Las monedas de cada semana se depositan en orden, de la primera a la última.
 *    Un depósito fuera de orden reinicia la alcancía.
 */

import type { Plan } from "@/core/tipos";

/** El plan cuadra al centavo cuando todas sus semanas terminan con remanente cero. */
export function esCuadrePerfecto(plan: Plan): boolean {
  return (
    plan.asignaciones.length > 0 &&
    plan.asignaciones.every((asignacion) => asignacion.remanente === 0)
  );
}

export interface EstadoAlcancia {
  readonly totalSemanas: number;
  /** Monedas depositadas en orden: las semanas 1 a `depositadas`. */
  readonly depositadas: number;
}

export type ResultadoDeposito = "depositada" | "completa" | "reiniciada";

export function crearAlcancia(totalSemanas: number): EstadoAlcancia {
  if (!Number.isInteger(totalSemanas) || totalSemanas < 1) {
    throw new RangeError(`Numero de semanas invalido: ${totalSemanas}.`);
  }
  return { totalSemanas, depositadas: 0 };
}

/** Deposita la moneda de una semana. Solo avanza si es la siguiente en orden. */
export function depositarMoneda(
  estado: EstadoAlcancia,
  numeroSemana: number,
): { estado: EstadoAlcancia; resultado: ResultadoDeposito } {
  if (numeroSemana !== estado.depositadas + 1) {
    return { estado: { ...estado, depositadas: 0 }, resultado: "reiniciada" };
  }
  const depositadas = estado.depositadas + 1;
  return {
    estado: { ...estado, depositadas },
    resultado: depositadas === estado.totalSemanas ? "completa" : "depositada",
  };
}

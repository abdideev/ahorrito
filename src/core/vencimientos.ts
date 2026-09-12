/**
 * M-02 Vencimientos. Deriva las fechas de vencimiento de los compromisos recurrentes.
 *
 * Los vencimientos no se almacenan (SUP-04): se recalculan en cada ejecucion a partir
 * del compromiso, de modo que no existen dos representaciones del mismo hecho.
 */

import { fechaIso, sumarMeses } from "./calendario";
import type { Compromiso, FechaIso, Vencimiento } from "./tipos";

/** Limite de repeticiones mensuales de un compromiso (regla de negocio 2). */
export const OCURRENCIAS_MAXIMAS = 6;

export interface ClasificacionVencimientos {
  /** Vencen entre la fecha de referencia y el fin del horizonte, ambos incluidos. */
  readonly dentro: readonly Vencimiento[];
  /** Vencen antes de la fecha de referencia; ya no pueden planificarse. */
  readonly anteriores: readonly Vencimiento[];
  /** Vencen despues del fin del horizonte. */
  readonly posteriores: readonly Vencimiento[];
}

/**
 * Deriva las ocurrencias mensuales de un compromiso. Cada fecha se calcula desde la
 * fecha limite original y no desde la ocurrencia anterior, para que un compromiso con
 * dia 31 vuelva a vencer el 31 despues de pasar por un mes corto.
 */
export function derivarVencimientos(compromiso: Compromiso): Vencimiento[] {
  validarCompromiso(compromiso);
  const vencimientos: Vencimiento[] = [];
  for (let indice = 0; indice < compromiso.ocurrencias; indice += 1) {
    vencimientos.push({
      compromisoId: compromiso.id,
      ocurrencia: indice + 1,
      fecha: sumarMeses(compromiso.fechaLimite, indice),
      monto: compromiso.monto,
    });
  }
  return vencimientos;
}

/**
 * Deriva los vencimientos de todos los compromisos en orden cronologico. Los empates
 * se resuelven por identificador y numero de ocurrencia, de modo que el resultado no
 * depende del orden en que llegan los compromisos.
 */
export function derivarTodosLosVencimientos(compromisos: readonly Compromiso[]): Vencimiento[] {
  const identificadores = new Set<string>();
  for (const compromiso of compromisos) {
    if (identificadores.has(compromiso.id)) {
      throw new RangeError(`Identificador de compromiso duplicado: "${compromiso.id}".`);
    }
    identificadores.add(compromiso.id);
  }
  return compromisos.flatMap(derivarVencimientos).sort(compararVencimientos);
}

/** Separa los vencimientos segun su posicion respecto al horizonte de planificacion. */
export function clasificarVencimientos(
  vencimientos: readonly Vencimiento[],
  fechaReferencia: FechaIso,
  finHorizonte: FechaIso,
): ClasificacionVencimientos {
  const dentro: Vencimiento[] = [];
  const anteriores: Vencimiento[] = [];
  const posteriores: Vencimiento[] = [];
  for (const vencimiento of vencimientos) {
    if (vencimiento.fecha < fechaReferencia) {
      anteriores.push(vencimiento);
    } else if (vencimiento.fecha > finHorizonte) {
      posteriores.push(vencimiento);
    } else {
      dentro.push(vencimiento);
    }
  }
  return { dentro, anteriores, posteriores };
}

// Comparacion por codigo de caracter y no con localeCompare: el orden de localeCompare
// depende de la configuracion regional del entorno y romperia el determinismo.
function compararVencimientos(a: Vencimiento, b: Vencimiento): number {
  if (a.fecha !== b.fecha) {
    return a.fecha < b.fecha ? -1 : 1;
  }
  if (a.compromisoId !== b.compromisoId) {
    return a.compromisoId < b.compromisoId ? -1 : 1;
  }
  // Inalcanzable con entradas validas: los identificadores son unicos y las ocurrencias
  // de un compromiso son mensuales. Se conserva para que el orden sea total.
  return a.ocurrencia - b.ocurrencia;
}

function validarCompromiso(compromiso: Compromiso): void {
  const { id, monto, fechaLimite, ocurrencias } = compromiso;
  if (typeof id !== "string" || id.length === 0) {
    throw new RangeError("El compromiso requiere un identificador no vacio.");
  }
  if (!Number.isSafeInteger(monto) || monto <= 0) {
    throw new RangeError(`Compromiso "${id}": el monto debe ser un entero de centavos mayor que cero.`);
  }
  if (!Number.isInteger(ocurrencias) || ocurrencias < 1 || ocurrencias > OCURRENCIAS_MAXIMAS) {
    throw new RangeError(
      `Compromiso "${id}": las ocurrencias deben estar entre 1 y ${OCURRENCIAS_MAXIMAS}.`,
    );
  }
  fechaIso(fechaLimite);
}

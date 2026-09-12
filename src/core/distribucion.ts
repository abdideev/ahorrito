/**
 * M-03 Distribucion. Reparte el presupuesto entre las semanas del horizonte cubriendo
 * cada vencimiento antes de su fecha limite (RF-07).
 *
 * Regla de reparto: cada ocurrencia se aparta en partes iguales desde la semana
 * siguiente a la ocurrencia anterior del mismo compromiso, o desde la primera semana
 * si no hay anterior, hasta la semana en que vence. Asi una mensualidad se reune a lo
 * largo del mes que la precede y no concentra la carga al inicio del horizonte.
 *
 * Lo que sobra en una semana no pasa a la siguiente: ese remanente ya tiene destino,
 * la meta de ahorro o el gasto libre, y contarlo dos veces ocultaria las semanas que
 * CA-05 exige marcar.
 */

import { numeroDeSemana } from "./calendario";
import { centavos, restarCentavos, sumarCentavos } from "./tipos";
import type {
  Apartado,
  AsignacionCalculada,
  Centavos,
  FechaIso,
  IngresoExtra,
  Semana,
  Vencimiento,
} from "./tipos";

export interface EntradaDistribucion {
  readonly semanas: readonly Semana[];
  /** Vencimientos dentro del horizonte, en orden cronologico (salida de M-02). */
  readonly vencimientos: readonly Vencimiento[];
  readonly presupuestoSemanal: Centavos;
  /** Ingresos extraordinarios dentro del horizonte. */
  readonly ingresosExtra?: readonly IngresoExtra[];
}

/**
 * Reparte un importe en partes iguales. Los centavos que no alcanzan a dividirse van a
 * las primeras partes: apartar de mas al principio nunca provoca un pago tardio.
 */
export function repartirEnPartesIguales(monto: Centavos, partes: number): Centavos[] {
  if (!Number.isInteger(partes) || partes < 1) {
    throw new RangeError(`Numero de partes invalido: ${partes}. Se espera un entero mayor que cero.`);
  }
  if (monto < 0) {
    throw new RangeError(`Importe invalido: ${monto}. El reparto requiere un monto no negativo.`);
  }
  // La division se hace sobre un multiplo exacto de partes para no depender del
  // redondeo de la division en punto flotante.
  const residuo = monto % partes;
  const base = (monto - residuo) / partes;
  return Array.from({ length: partes }, (_, indice) =>
    centavos(indice < residuo ? base + 1 : base),
  );
}

/** Calcula la asignacion de cada semana del horizonte. */
export function distribuir(entrada: EntradaDistribucion): AsignacionCalculada[] {
  const { semanas, vencimientos, presupuestoSemanal, ingresosExtra = [] } = entrada;
  if (!Number.isSafeInteger(presupuestoSemanal) || presupuestoSemanal <= 0) {
    throw new RangeError(
      `Presupuesto semanal invalido: ${presupuestoSemanal}. Se espera un entero de centavos mayor que cero.`,
    );
  }

  const apartadosPorSemana = new Map<number, Apartado[]>();
  const vencimientosPorSemana = new Map<number, Vencimiento[]>();
  const ingresosPorSemana = new Map<number, Centavos[]>();

  for (const [, ocurrencias] of agruparPorCompromiso(vencimientos)) {
    let semanaAnterior: number | null = null;
    for (const vencimiento of ocurrencias) {
      const semanaVence = ubicarSemana(semanas, vencimiento.fecha, "vencimiento");
      const primeraSemana = semanaAnterior === null ? 1 : Math.min(semanaAnterior + 1, semanaVence);
      const montos = repartirEnPartesIguales(vencimiento.monto, semanaVence - primeraSemana + 1);
      montos.forEach((monto, indice) => {
        acumular(apartadosPorSemana, primeraSemana + indice, {
          compromisoId: vencimiento.compromisoId,
          ocurrencia: vencimiento.ocurrencia,
          monto,
        });
      });
      acumular(vencimientosPorSemana, semanaVence, vencimiento);
      semanaAnterior = semanaVence;
    }
  }

  for (const ingreso of ingresosExtra) {
    if (!Number.isSafeInteger(ingreso.monto) || ingreso.monto <= 0) {
      throw new RangeError(
        `Ingreso "${ingreso.id}": el monto debe ser un entero de centavos mayor que cero.`,
      );
    }
    acumular(ingresosPorSemana, ubicarSemana(semanas, ingreso.fecha, "ingreso"), ingreso.monto);
  }

  return semanas.map((semana) => {
    const apartados = (apartadosPorSemana.get(semana.numero) ?? []).sort(compararApartados);
    const vencimientosDeLaSemana = vencimientosPorSemana.get(semana.numero) ?? [];
    const ingresos = sumarCentavos(ingresosPorSemana.get(semana.numero) ?? []);
    const montoDisponible = centavos(presupuestoSemanal + ingresos);
    const montoApartado = sumarCentavos(apartados.map((apartado) => apartado.monto));
    return {
      numeroSemana: semana.numero,
      fechaInicio: semana.inicio,
      fechaFin: semana.fin,
      presupuesto: presupuestoSemanal,
      ingresosExtra: ingresos,
      montoDisponible,
      montoApartado,
      montoVencimientos: sumarCentavos(vencimientosDeLaSemana.map((v) => v.monto)),
      remanente: restarCentavos(montoDisponible, montoApartado),
      apartados,
      vencimientos: vencimientosDeLaSemana,
    };
  });
}

function agruparPorCompromiso(
  vencimientos: readonly Vencimiento[],
): Map<string, Vencimiento[]> {
  const grupos = new Map<string, Vencimiento[]>();
  for (const vencimiento of vencimientos) {
    acumular(grupos, vencimiento.compromisoId, vencimiento);
  }
  for (const ocurrencias of grupos.values()) {
    ocurrencias.sort((a, b) => a.ocurrencia - b.ocurrencia);
  }
  return grupos;
}

function acumular<C, V>(mapa: Map<C, V[]>, clave: C, valor: V): void {
  const existentes = mapa.get(clave);
  if (existentes === undefined) {
    mapa.set(clave, [valor]);
  } else {
    existentes.push(valor);
  }
}

function ubicarSemana(semanas: readonly Semana[], fecha: FechaIso, concepto: string): number {
  const numero = numeroDeSemana(semanas, fecha);
  if (numero === null) {
    throw new RangeError(`El ${concepto} del ${fecha} cae fuera del horizonte recibido.`);
  }
  return numero;
}

function compararApartados(a: Apartado, b: Apartado): number {
  if (a.compromisoId !== b.compromisoId) {
    return a.compromisoId < b.compromisoId ? -1 : 1;
  }
  // Inalcanzable con entradas validas: dos ocurrencias del mismo compromiso nunca se
  // apartan en la misma semana. Se conserva para que el orden sea total.
  return a.ocurrencia - b.ocurrencia;
}

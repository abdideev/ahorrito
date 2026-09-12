/**
 * M-04 Evaluacion. Detecta las semanas sobrecargadas (RF-08) y determina la viabilidad
 * de la meta de ahorro (RF-09).
 *
 * Sobrecarga y deficit son cosas distintas y se informan por separado:
 * - Sobrecargada: lo que vence en la semana supera lo disponible (RF-08, CA-05).
 * - En deficit: lo que hay que apartar en la semana supera lo disponible.
 * Una semana puede estar en deficit sin estar sobrecargada, porque el apartado reune
 * por adelantado pagos que vencen despues.
 */

import { fechaIso } from "./calendario";
import { centavos, sumarCentavos } from "./tipos";
import type {
  Advertencia,
  AporteMeta,
  AsignacionCalculada,
  Centavos,
  EvaluacionMeta,
  FechaIso,
  MetaAhorro,
} from "./tipos";

/** Semanas cuyos vencimientos superan lo disponible (RF-08). */
export function detectarSemanasSobrecargadas(
  asignaciones: readonly AsignacionCalculada[],
): number[] {
  return asignaciones
    .filter((asignacion) => asignacion.montoVencimientos > asignacion.montoDisponible)
    .map((asignacion) => asignacion.numeroSemana);
}

/** Semanas en las que lo que hay que apartar supera lo disponible. */
export function detectarSemanasEnDeficit(asignaciones: readonly AsignacionCalculada[]): number[] {
  return asignaciones
    .filter((asignacion) => asignacion.remanente < 0)
    .map((asignacion) => asignacion.numeroSemana);
}

/**
 * Evalua si la meta es alcanzable con los remanentes de las semanas que inician hasta
 * la fecha objetivo, e indica el faltante cuando no lo es (RF-09, CA-06).
 */
export function evaluarMeta(
  asignaciones: readonly AsignacionCalculada[],
  meta: MetaAhorro,
): EvaluacionMeta {
  if (!Number.isSafeInteger(meta.montoObjetivo) || meta.montoObjetivo <= 0) {
    throw new RangeError(
      `Meta de ahorro invalida: ${meta.montoObjetivo}. Se espera un entero de centavos mayor que cero.`,
    );
  }
  fechaIso(meta.fechaObjetivo);

  const consideradas = asignaciones.filter(
    (asignacion) => asignacion.fechaInicio <= meta.fechaObjetivo,
  );
  // Solo el remanente positivo puede ahorrarse; una semana en deficit aporta cero.
  const capacidades = consideradas.map((asignacion) =>
    centavos(Math.max(0, asignacion.remanente)),
  );
  const ahorroPosible = sumarCentavos(capacidades);
  const viable = ahorroPosible >= meta.montoObjetivo;

  return {
    montoObjetivo: meta.montoObjetivo,
    fechaObjetivo: meta.fechaObjetivo,
    ahorroPosible,
    viable,
    faltante: centavos(viable ? 0 : meta.montoObjetivo - ahorroPosible),
    aportes: repartirAporte(
      consideradas,
      capacidades,
      viable ? meta.montoObjetivo : ahorroPosible,
    ),
  };
}

/**
 * Reune las advertencias derivadas de las asignaciones y de la meta. Las de los
 * vencimientos e ingresos fuera del horizonte las agrega plan.ts, que es quien conoce
 * lo que quedo fuera.
 */
export function construirAdvertencias(
  asignaciones: readonly AsignacionCalculada[],
  evaluacion: EvaluacionMeta | null,
  finHorizonte: FechaIso,
): Advertencia[] {
  const advertencias: Advertencia[] = [];
  for (const asignacion of asignaciones) {
    if (asignacion.montoVencimientos > asignacion.montoDisponible) {
      advertencias.push({
        tipo: "semana-sobrecargada",
        numeroSemana: asignacion.numeroSemana,
        excedente: centavos(asignacion.montoVencimientos - asignacion.montoDisponible),
      });
    }
    if (asignacion.remanente < 0) {
      advertencias.push({
        tipo: "semana-en-deficit",
        numeroSemana: asignacion.numeroSemana,
        faltante: centavos(-asignacion.remanente),
      });
    }
  }
  if (evaluacion !== null) {
    if (!evaluacion.viable) {
      advertencias.push({ tipo: "meta-no-alcanzable", faltante: evaluacion.faltante });
    }
    if (evaluacion.fechaObjetivo > finHorizonte) {
      advertencias.push({
        tipo: "meta-fuera-de-horizonte",
        fechaObjetivo: evaluacion.fechaObjetivo,
        finHorizonte,
      });
    }
  }
  return advertencias;
}

/**
 * Reparte el ahorro en dos pasadas. La primera asigna una cuota uniforme limitada por
 * el remanente de cada semana; la segunda completa lo que falte desde las primeras
 * semanas con capacidad libre. Una sola pasada uniforme dejaria la meta sin alcanzar
 * cuando la capacidad esta concentrada en pocas semanas, aunque el total alcance.
 */
function repartirAporte(
  asignaciones: readonly AsignacionCalculada[],
  capacidades: readonly Centavos[],
  objetivo: number,
): AporteMeta[] {
  const total = asignaciones.length;
  if (total === 0 || objetivo <= 0) {
    return [];
  }
  const cuota = dividirHaciaArriba(objetivo, total);
  let restante = objetivo;
  // Primera pasada: cuota uniforme, limitada por la capacidad de la semana y por lo
  // que falta del objetivo. Sin ese segundo limite, un objetivo que no divide exacto
  // entre las semanas repartiria de mas.
  const montos = capacidades.map((capacidad) => {
    const monto = Math.min(capacidad, cuota, restante);
    restante -= monto;
    return monto;
  });
  // Segunda pasada: completa lo que falte desde las primeras semanas con capacidad libre.
  for (let indice = 0; indice < total && restante > 0; indice += 1) {
    const adicional = Math.min(capacidades[indice] - montos[indice], restante);
    montos[indice] += adicional;
    restante -= adicional;
  }
  return asignaciones
    .map((asignacion, indice) => ({
      numeroSemana: asignacion.numeroSemana,
      monto: centavos(montos[indice]),
    }))
    .filter((aporte) => aporte.monto > 0);
}

// Division entera hacia arriba, sin punto flotante (regla de negocio 4).
function dividirHaciaArriba(dividendo: number, divisor: number): number {
  const residuo = dividendo % divisor;
  return (dividendo - residuo) / divisor + (residuo > 0 ? 1 : 0);
}

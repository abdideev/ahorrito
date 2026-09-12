/**
 * Composicion del motor de calculo determinista (C-03). Expone calcularPlan, la
 * interfaz I-02 entre el orquestador y el nucleo.
 *
 * calcularPlan es una funcion pura: ante la misma entrada devuelve siempre la misma
 * salida, no lee el reloj ni el entorno y no modifica lo que recibe. Esa propiedad es
 * la que hace verificable RNF-06.
 */

import { calcularFinHorizonte, fechaIso, generarSemanas } from "./calendario";
import { distribuir } from "./distribucion";
import {
  construirAdvertencias,
  detectarSemanasEnDeficit,
  detectarSemanasSobrecargadas,
  evaluarMeta,
} from "./evaluacion";
import { centavos } from "./tipos";
import type {
  Advertencia,
  AsignacionSemanal,
  EntradaPlan,
  FechaIso,
  IngresoExtra,
  Plan,
} from "./tipos";
import { clasificarVencimientos, derivarTodosLosVencimientos } from "./vencimientos";

/** Genera el plan numerico completo a partir de la entrada declarada por el usuario. */
export function calcularPlan(entrada: EntradaPlan): Plan {
  const { fechaReferencia, presupuesto, compromisos } = entrada;
  const ingresosExtra = entrada.ingresosExtra ?? [];
  const metaAhorro = entrada.metaAhorro ?? null;

  fechaIso(fechaReferencia);
  if (compromisos.length === 0) {
    throw new RangeError("El plan requiere al menos un compromiso (regla de negocio 6).");
  }

  // M-02: los vencimientos se derivan antes del horizonte porque lo determinan.
  const vencimientos = derivarTodosLosVencimientos(compromisos);
  const fechasRelevantes: FechaIso[] = vencimientos.map((vencimiento) => vencimiento.fecha);
  if (metaAhorro !== null) {
    // SC-01: la fecha objetivo de la meta tambien puede extender el horizonte.
    fechasRelevantes.push(fechaIso(metaAhorro.fechaObjetivo));
  }
  const finHorizonte = calcularFinHorizonte(fechaReferencia, fechasRelevantes);

  // M-01
  const semanas = generarSemanas(fechaReferencia, presupuesto.diaInicioSemana, finHorizonte);
  const vencimientosClasificados = clasificarVencimientos(
    vencimientos,
    fechaReferencia,
    finHorizonte,
  );
  const ingresosClasificados = clasificarIngresos(ingresosExtra, fechaReferencia, finHorizonte);

  // M-03
  const asignaciones = distribuir({
    semanas,
    vencimientos: vencimientosClasificados.dentro,
    presupuestoSemanal: presupuesto.montoSemanal,
    ingresosExtra: ingresosClasificados.dentro,
  });

  // M-04
  const evaluacionMeta = metaAhorro === null ? null : evaluarMeta(asignaciones, metaAhorro);
  const sobrecargadas = new Set(detectarSemanasSobrecargadas(asignaciones));
  const enDeficit = new Set(detectarSemanasEnDeficit(asignaciones));
  const aportes = new Map(
    (evaluacionMeta?.aportes ?? []).map((aporte) => [aporte.numeroSemana, aporte.monto]),
  );

  const asignacionesFinales: AsignacionSemanal[] = asignaciones.map((asignacion) => ({
    ...asignacion,
    aporteMeta: aportes.get(asignacion.numeroSemana) ?? centavos(0),
    sobrecargada: sobrecargadas.has(asignacion.numeroSemana),
    enDeficit: enDeficit.has(asignacion.numeroSemana),
  }));

  return {
    fechaReferencia,
    inicioHorizonte: semanas[0].inicio,
    finHorizonte,
    asignaciones: asignacionesFinales,
    evaluacionMeta,
    advertencias: [
      ...construirAdvertencias(asignaciones, evaluacionMeta, finHorizonte),
      ...advertenciasDeLoExcluido(vencimientosClasificados, ingresosClasificados),
    ],
  };
}

interface IngresosClasificados {
  readonly dentro: readonly IngresoExtra[];
  readonly fuera: readonly IngresoExtra[];
}

function clasificarIngresos(
  ingresos: readonly IngresoExtra[],
  fechaReferencia: FechaIso,
  finHorizonte: FechaIso,
): IngresosClasificados {
  const dentro: IngresoExtra[] = [];
  const fuera: IngresoExtra[] = [];
  for (const ingreso of ingresos) {
    const fecha = fechaIso(ingreso.fecha);
    if (fecha < fechaReferencia || fecha > finHorizonte) {
      fuera.push(ingreso);
    } else {
      dentro.push(ingreso);
    }
  }
  return { dentro, fuera };
}

/**
 * Lo que queda fuera del horizonte no se descarta en silencio: se informa, para que la
 * interfaz pueda explicar por que un pago registrado no aparece en el plan.
 */
function advertenciasDeLoExcluido(
  vencimientos: ReturnType<typeof clasificarVencimientos>,
  ingresos: IngresosClasificados,
): Advertencia[] {
  const advertencias: Advertencia[] = [];
  for (const vencimiento of vencimientos.anteriores) {
    advertencias.push({
      tipo: "vencimiento-anterior-a-referencia",
      compromisoId: vencimiento.compromisoId,
      ocurrencia: vencimiento.ocurrencia,
      fecha: vencimiento.fecha,
    });
  }
  for (const vencimiento of vencimientos.posteriores) {
    advertencias.push({
      tipo: "vencimiento-fuera-de-horizonte",
      compromisoId: vencimiento.compromisoId,
      ocurrencia: vencimiento.ocurrencia,
      fecha: vencimiento.fecha,
    });
  }
  for (const ingreso of ingresos.fuera) {
    advertencias.push({
      tipo: "ingreso-fuera-de-horizonte",
      ingresoId: ingreso.id,
      fecha: ingreso.fecha,
    });
  }
  return advertencias;
}

/**
 * Cifras de conjunto del plan para las tarjetas de la vista (C-01).
 *
 * No calcula nada nuevo: agrega lo que el motor ya entregó (C-03), para que la interfaz
 * no repita sumas en cada componente ni pueda discrepar de la tabla semanal.
 */

import { centavos, type AsignacionSemanal, type Centavos, type Plan } from "@/core/tipos";

export interface ResumenPlan {
  readonly semanas: number;
  readonly semanasAlDia: number;
  /** Semanas sobrecargadas que aún se cubren con lo apartado antes (RF-08). */
  readonly semanasCargaAlta: number;
  /** Semanas donde lo que hay que apartar supera lo disponible. */
  readonly semanasSinAlcance: number;
  readonly totalApartado: Centavos;
  readonly totalMeta: Centavos;
  readonly primeraSemana: AsignacionSemanal | null;
  /** Fracción de la meta cubierta por el ahorro posible, entre 0 y 1; nula sin meta. */
  readonly avanceMeta: number | null;
}

export function resumirPlan(plan: Plan): ResumenPlan {
  let semanasCargaAlta = 0;
  let semanasSinAlcance = 0;
  let totalApartado = 0;
  let totalMeta = 0;

  for (const semana of plan.asignaciones) {
    if (semana.enDeficit) {
      semanasSinAlcance += 1;
    } else if (semana.sobrecargada) {
      semanasCargaAlta += 1;
    }
    totalApartado += semana.montoApartado;
    totalMeta += semana.aporteMeta;
  }

  const meta = plan.evaluacionMeta;
  const avanceMeta =
    meta === null || meta.montoObjetivo <= 0
      ? null
      : Math.min(1, Math.max(0, meta.ahorroPosible / meta.montoObjetivo));

  return {
    semanas: plan.asignaciones.length,
    semanasAlDia: plan.asignaciones.length - semanasCargaAlta - semanasSinAlcance,
    semanasCargaAlta,
    semanasSinAlcance,
    totalApartado: centavos(totalApartado),
    totalMeta: centavos(totalMeta),
    primeraSemana: plan.asignaciones[0] ?? null,
    avanceMeta,
  };
}

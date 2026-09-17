/**
 * Puerto I-04: contrato del repositorio de planes (RF-12).
 *
 * El orquestador (C-02) depende de esta interfaz, no de Supabase. El adaptador de
 * persistencia (C-05) la implementa.
 *
 * Diferencia deliberada con la sección 3.3.1 del documento maestro: las operaciones no
 * reciben `usuarioId`. Cada repositorio se construye con la sesión del usuario, y la
 * seguridad por fila decide qué registros puede ver o crear. Un parámetro `usuarioId`
 * invitaría a confiar en un identificador enviado por el cliente.
 */

import type { EntradaPlan, FechaIso, Plan } from "@/core/tipos";

export interface ResumenPlan {
  readonly id: string;
  /** Marca de tiempo ISO 8601 del guardado. */
  readonly generadoEn: string;
  readonly fechaReferencia: FechaIso;
  readonly inicioHorizonte: FechaIso;
  readonly finHorizonte: FechaIso;
  readonly semanas: number;
  /** Nulo cuando el plan se generó sin meta de ahorro. */
  readonly metaViable: boolean | null;
}

export interface PlanGuardado {
  readonly id: string;
  readonly generadoEn: string;
  readonly plan: Plan;
  /** Nula mientras no exista o si el servicio de IA no respondió (RNF-03). */
  readonly explicacion: string | null;
}

export interface RepositorioPlanes {
  /** Guarda el plan y sus semanas de forma atómica. Devuelve el identificador asignado. */
  guardarPlan(plan: Plan): Promise<string>;

  /** Planes del usuario de la sesión, del más reciente al más antiguo. */
  listarPlanes(): Promise<ResumenPlan[]>;

  /** Plan del usuario de la sesión, o null si no existe o pertenece a otro usuario. */
  obtenerPlan(id: string): Promise<PlanGuardado | null>;

  /**
   * Datos capturados por el usuario listos para el motor, o null si falta lo
   * obligatorio: el presupuesto y al menos un compromiso (regla de negocio 6).
   */
  obtenerDatosEntrada(fechaReferencia: FechaIso): Promise<EntradaPlan | null>;
}

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

import type {
  Centavos,
  Compromiso,
  EntradaPlan,
  FechaIso,
  IngresoExtra,
  MetaAhorro,
  Plan,
  Presupuesto,
} from "@/core/tipos";

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

/**
 * Compromiso tal como lo ve la interfaz (SC-06). Extiende el tipo del motor con la
 * denominación, que el usuario necesita para reconocer el pago y que el motor no
 * recibe: por eso tampoco puede llegar al proveedor de IA (RNF-10).
 */
export interface CompromisoGuardado extends Compromiso {
  readonly denominacion: string;
}

/** Datos de un compromiso al darlo de alta o modificarlo; el identificador lo asigna la base. */
export interface DatosCompromiso {
  readonly denominacion: string;
  readonly monto: Centavos;
  readonly fechaLimite: FechaIso;
  /** Repeticiones mensuales, entre 1 y 6 (regla de negocio 2). */
  readonly ocurrencias: number;
}

export interface DatosIngreso {
  readonly monto: Centavos;
  readonly fecha: FechaIso;
}

export interface RepositorioPlanes {
  /** Guarda el plan y sus semanas de forma atómica. Devuelve el identificador asignado. */
  guardarPlan(plan: Plan): Promise<string>;

  /**
   * Agrega la explicación a un plan propio; es lo único de un plan guardado que puede
   * cambiar (SC-05). Devuelve false si el plan no existe o pertenece a otro usuario.
   */
  guardarExplicacion(id: string, explicacion: string): Promise<boolean>;

  /** Planes del usuario de la sesión, del más reciente al más antiguo. */
  listarPlanes(): Promise<ResumenPlan[]>;

  /** Plan del usuario de la sesión, o null si no existe o pertenece a otro usuario. */
  obtenerPlan(id: string): Promise<PlanGuardado | null>;

  /**
   * Datos capturados por el usuario listos para el motor, o null si falta lo
   * obligatorio: el presupuesto y al menos un compromiso (regla de negocio 6).
   */
  obtenerDatosEntrada(fechaReferencia: FechaIso): Promise<EntradaPlan | null>;

  // -------------------------------------------------------------------------
  // Captura del usuario (RF-02 a RF-06), incorporada a I-04 por SC-06.
  // Las operaciones que modifican una fila existente devuelven false cuando no
  // alcanzan ninguna: la seguridad por fila no distingue entre "no existe" y
  // "es de otro usuario", y la interfaz tampoco necesita distinguirlo.
  // -------------------------------------------------------------------------

  /** Presupuesto del usuario, o null si todavía no lo ha capturado (RF-02). */
  obtenerPresupuesto(): Promise<Presupuesto | null>;

  /** Crea el presupuesto o reemplaza el existente: hay uno por usuario (RF-02). */
  guardarPresupuesto(presupuesto: Presupuesto): Promise<void>;

  /** Compromisos del usuario, del más antiguo al más reciente (RF-03). */
  listarCompromisos(): Promise<CompromisoGuardado[]>;

  /** Da de alta un compromiso y devuelve el identificador asignado (RF-03). */
  agregarCompromiso(datos: DatosCompromiso): Promise<string>;

  /** Modifica un compromiso propio (RF-04). */
  actualizarCompromiso(id: string, datos: DatosCompromiso): Promise<boolean>;

  /** Elimina un compromiso propio (RF-04). */
  eliminarCompromiso(id: string): Promise<boolean>;

  /** Ingresos extraordinarios del usuario, por fecha ascendente (RF-05). */
  listarIngresos(): Promise<IngresoExtra[]>;

  agregarIngreso(datos: DatosIngreso): Promise<string>;

  eliminarIngreso(id: string): Promise<boolean>;

  /** Meta de ahorro del usuario, o null si no la ha definido (RF-06). */
  obtenerMeta(): Promise<MetaAhorro | null>;

  /** Crea la meta o reemplaza la existente: hay una por usuario (RF-06). */
  guardarMeta(meta: MetaAhorro): Promise<void>;

  /** Quita la meta de ahorro. Devuelve false si no había ninguna. */
  eliminarMeta(): Promise<boolean>;
}

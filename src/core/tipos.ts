/**
 * Tipos del dominio del motor de calculo determinista (C-03).
 *
 * Convenciones que este archivo fija para todo el nucleo:
 * - Los importes son centavos enteros (regla de negocio 4, regla de codigo 2.5.7).
 *   El tipo Centavos esta marcado para que el compilador impida mezclarlo con un
 *   number cualquiera, por ejemplo un monto en pesos con decimales.
 * - Las fechas son cadenas AAAA-MM-DD sin hora ni zona horaria. Con ese formato el
 *   orden lexicografico coincide con el cronologico.
 * - Este archivo no importa nada: es la base de la que dependen los demas modulos.
 */

declare const marcaCentavos: unique symbol;
declare const marcaFecha: unique symbol;

/** Importe en centavos de peso mexicano. Puede ser negativo en un remanente con deficit. */
export type Centavos = number & { readonly [marcaCentavos]: true };

/** Fecha de calendario AAAA-MM-DD validada. Se construye con fechaIso() de calendario.ts. */
export type FechaIso = string & { readonly [marcaFecha]: true };

/** Dia de la semana: 0 corresponde a domingo, conforme al contrato de I-01 (seccion 3.3.2). */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Unico constructor valido de Centavos. Rechaza cualquier valor que no sea un entero
 * representable sin perdida, lo que incluye decimales, NaN e infinitos.
 */
export function centavos(valor: number): Centavos {
  if (!Number.isSafeInteger(valor)) {
    throw new RangeError(`Importe invalido: ${valor}. Se esperan centavos enteros.`);
  }
  return valor as Centavos;
}

/** Suma importes verificando que el resultado siga siendo un entero seguro. */
export function sumarCentavos(valores: Iterable<Centavos>): Centavos {
  let total = 0;
  for (const valor of valores) {
    total += valor;
  }
  return centavos(total);
}

/** Resta dos importes verificando que el resultado siga siendo un entero seguro. */
export function restarCentavos(minuendo: Centavos, sustraendo: Centavos): Centavos {
  return centavos(minuendo - sustraendo);
}

// ---------------------------------------------------------------------------
// Entrada del motor (I-02)
// ---------------------------------------------------------------------------

export interface Presupuesto {
  /** Monto recibido cada semana, disponible desde el primer dia de la semana. */
  readonly montoSemanal: Centavos;
  readonly diaInicioSemana: DiaSemana;
}

/**
 * Compromiso de pago tal como lo necesita el calculo. No incluye la denominacion:
 * el motor no la usa, y omitirla impide que llegue por descuido a la carga que se
 * envia al proveedor de IA (RNF-10).
 */
export interface Compromiso {
  readonly id: string;
  /** Importe de cada ocurrencia. */
  readonly monto: Centavos;
  /** Vencimiento de la primera ocurrencia. */
  readonly fechaLimite: FechaIso;
  /** Repeticiones mensuales, entre 1 y 6 (regla de negocio 2). */
  readonly ocurrencias: number;
}

export interface IngresoExtra {
  readonly id: string;
  readonly monto: Centavos;
  /** Fecha de recepcion; el ingreso se suma a la semana que la contiene. */
  readonly fecha: FechaIso;
}

export interface MetaAhorro {
  readonly montoObjetivo: Centavos;
  readonly fechaObjetivo: FechaIso;
}

export interface EntradaPlan {
  /**
   * Fecha desde la que se planifica. Se recibe como dato en lugar de leer el reloj
   * para que calcularPlan sea una funcion pura y sus pruebas sean reproducibles.
   */
  readonly fechaReferencia: FechaIso;
  readonly presupuesto: Presupuesto;
  /** Al menos uno (regla de negocio 6). */
  readonly compromisos: readonly Compromiso[];
  readonly ingresosExtra?: readonly IngresoExtra[];
  readonly metaAhorro?: MetaAhorro | null;
}

// ---------------------------------------------------------------------------
// Estructuras intermedias de los modulos M-01 a M-03
// ---------------------------------------------------------------------------

/** Semana presupuestal de siete dias producida por M-01. */
export interface Semana {
  /** Posicion dentro del horizonte, empezando en 1. */
  readonly numero: number;
  readonly inicio: FechaIso;
  readonly fin: FechaIso;
}

/** Ocurrencia concreta de un compromiso, derivada por M-02. No se almacena (SUP-04). */
export interface Vencimiento {
  readonly compromisoId: string;
  /** Numero de ocurrencia, empezando en 1. */
  readonly ocurrencia: number;
  readonly fecha: FechaIso;
  readonly monto: Centavos;
}

/** Parte de un vencimiento que se reserva en una semana concreta. */
export interface Apartado {
  readonly compromisoId: string;
  readonly ocurrencia: number;
  readonly monto: Centavos;
}

/** Resultado de M-03 para una semana, antes de la evaluacion de M-04. */
export interface AsignacionCalculada {
  readonly numeroSemana: number;
  readonly fechaInicio: FechaIso;
  readonly fechaFin: FechaIso;
  readonly presupuesto: Centavos;
  readonly ingresosExtra: Centavos;
  /** presupuesto + ingresosExtra. No se arrastra el remanente de semanas previas. */
  readonly montoDisponible: Centavos;
  /** Suma de los apartados de la semana. */
  readonly montoApartado: Centavos;
  /** Suma de los vencimientos cuya fecha cae en la semana. */
  readonly montoVencimientos: Centavos;
  /** montoDisponible - montoApartado. Negativo indica deficit. */
  readonly remanente: Centavos;
  readonly apartados: readonly Apartado[];
  readonly vencimientos: readonly Vencimiento[];
}

// ---------------------------------------------------------------------------
// Evaluacion (M-04)
// ---------------------------------------------------------------------------

export interface AporteMeta {
  readonly numeroSemana: number;
  readonly monto: Centavos;
}

export interface EvaluacionMeta {
  readonly montoObjetivo: Centavos;
  readonly fechaObjetivo: FechaIso;
  /** Suma de los remanentes positivos de las semanas que inician hasta la fecha objetivo. */
  readonly ahorroPosible: Centavos;
  readonly viable: boolean;
  /** Cero cuando la meta es viable (CA-06). */
  readonly faltante: Centavos;
  /** Aporte sugerido por semana; solo incluye semanas con aporte mayor que cero. */
  readonly aportes: readonly AporteMeta[];
}

/**
 * Advertencias como codigos estructurados y no como texto. El nucleo no decide la
 * redaccion: la interfaz la traduce a espanol y el adaptador de IA la usa como dato.
 */
export type Advertencia =
  | {
      readonly tipo: "semana-sobrecargada";
      readonly numeroSemana: number;
      /** montoVencimientos - montoDisponible. */
      readonly excedente: Centavos;
    }
  | {
      readonly tipo: "semana-en-deficit";
      readonly numeroSemana: number;
      /** montoApartado - montoDisponible. */
      readonly faltante: Centavos;
    }
  | {
      readonly tipo: "meta-no-alcanzable";
      readonly faltante: Centavos;
    }
  | {
      readonly tipo: "meta-fuera-de-horizonte";
      readonly fechaObjetivo: FechaIso;
      readonly finHorizonte: FechaIso;
    }
  | {
      readonly tipo: "vencimiento-anterior-a-referencia";
      readonly compromisoId: string;
      readonly ocurrencia: number;
      readonly fecha: FechaIso;
    }
  | {
      readonly tipo: "vencimiento-fuera-de-horizonte";
      readonly compromisoId: string;
      readonly ocurrencia: number;
      readonly fecha: FechaIso;
    }
  | {
      readonly tipo: "ingreso-fuera-de-horizonte";
      readonly ingresoId: string;
      readonly fecha: FechaIso;
    };

// ---------------------------------------------------------------------------
// Salida del motor (I-02)
// ---------------------------------------------------------------------------

/** Asignacion final de una semana: el calculo de M-03 mas las marcas de M-04. */
export interface AsignacionSemanal extends AsignacionCalculada {
  /** Parte del remanente que se sugiere destinar a la meta de ahorro. */
  readonly aporteMeta: Centavos;
  /** RF-08: los vencimientos de la semana superan lo disponible. */
  readonly sobrecargada: boolean;
  /** Lo que hay que apartar en la semana supera lo disponible. */
  readonly enDeficit: boolean;
}

/**
 * Plan numerico. La explicacion en lenguaje natural no forma parte del nucleo:
 * la agrega el orquestador (C-02) y puede ser nula (regla de negocio 5).
 */
export interface Plan {
  readonly fechaReferencia: FechaIso;
  readonly inicioHorizonte: FechaIso;
  readonly finHorizonte: FechaIso;
  readonly asignaciones: readonly AsignacionSemanal[];
  /** Nula cuando la entrada no trae meta de ahorro. */
  readonly evaluacionMeta: EvaluacionMeta | null;
  readonly advertencias: readonly Advertencia[];
}

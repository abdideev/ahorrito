/**
 * Fecha del servidor en la zona horaria del proyecto.
 *
 * Vive fuera del orquestador porque la comparten dos responsabilidades: la fecha de
 * referencia con la que se calcula un plan (SC-05) y la validación de la fecha objetivo
 * de la meta de ahorro, que el contrato de I-01 exige posterior a hoy.
 */

const FORMATO_FECHA_MEXICO = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Mexico_City",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Fecha de hoy en el centro de México, AAAA-MM-DD. El servidor corre en UTC: sin esta
 * conversión, un plan pedido después de las 18:00 quedaría fechado al día siguiente.
 * El formato en-CA es el que produce AAAA-MM-DD, cuyo orden lexicográfico coincide con
 * el cronológico y permite comparar fechas como cadenas.
 */
export function fechaDeHoyEnMexico(ahora: Date = new Date()): string {
  return FORMATO_FECHA_MEXICO.format(ahora);
}

const UN_DIA_EN_MS = 24 * 60 * 60 * 1000;

/**
 * Día siguiente a hoy en el centro de México, AAAA-MM-DD.
 *
 * Es la primera fecha que el usuario puede elegir como objetivo de su meta, porque el
 * contrato de I-01 la exige posterior a hoy. Se calcula sobre la fecha ya convertida a
 * la zona horaria, no sobre el instante UTC, para no adelantarse un día por la tarde.
 */
export function fechaDeMananaEnMexico(ahora: Date = new Date()): string {
  const hoy = fechaDeHoyEnMexico(ahora);
  return new Date(new Date(`${hoy}T00:00:00Z`).getTime() + UN_DIA_EN_MS).toISOString().slice(0, 10);
}

/**
 * M-01 Calendario. Genera las semanas del horizonte a partir del dia de inicio
 * configurado y concentra toda la aritmetica de fechas del nucleo.
 *
 * Las fechas se convierten a un numero de dia (dias desde 1970-01-01) con aritmetica
 * entera. No se usa Date: su analisis depende de la zona horaria del proceso y
 * Date.UTC reinterpreta los anios 0 a 99 como 1900 a 1999.
 */

import type { DiaSemana, FechaIso, Semana } from "./tipos";

/** Tope del horizonte de planificacion (SUP-01, modificado por SC-01). */
export const HORIZONTE_MAXIMO_MESES = 6;

const PATRON_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

interface PartesFecha {
  readonly anio: number;
  readonly mes: number;
  readonly dia: number;
}

function esBisiesto(anio: number): boolean {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
}

function diasDelMes(anio: number, mes: number): number {
  if (mes === 2) {
    return esBisiesto(anio) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(mes) ? 30 : 31;
}

function descomponer(fecha: FechaIso): PartesFecha {
  return {
    anio: Number(fecha.slice(0, 4)),
    mes: Number(fecha.slice(5, 7)),
    dia: Number(fecha.slice(8, 10)),
  };
}

function componer({ anio, mes, dia }: PartesFecha): FechaIso {
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${String(anio).padStart(4, "0")}-${dos(mes)}-${dos(dia)}` as FechaIso;
}

// Conversion entre fecha civil y numero de dia. Algoritmo de calendario gregoriano
// proleptico de H. Hinnant ("chrono-Compatible Low-Level Date Algorithms"), que
// desplaza el inicio del anio a marzo para que el dia bisiesto quede al final.
function aNumeroDeDia({ anio, mes, dia }: PartesFecha): number {
  const y = mes <= 2 ? anio - 1 : anio;
  const era = Math.floor(y / 400);
  const anioDeEra = y - era * 400;
  const mesDesdeMarzo = (mes + 9) % 12;
  const diaDelAnio = Math.floor((153 * mesDesdeMarzo + 2) / 5) + dia - 1;
  const diaDeEra =
    anioDeEra * 365 + Math.floor(anioDeEra / 4) - Math.floor(anioDeEra / 100) + diaDelAnio;
  return era * 146097 + diaDeEra - 719468;
}

function desdeNumeroDeDia(numeroDeDia: number): PartesFecha {
  const z = numeroDeDia + 719468;
  const era = Math.floor(z / 146097);
  const diaDeEra = z - era * 146097;
  const anioDeEra = Math.floor(
    (diaDeEra -
      Math.floor(diaDeEra / 1460) +
      Math.floor(diaDeEra / 36524) -
      Math.floor(diaDeEra / 146096)) /
      365,
  );
  const diaDelAnio =
    diaDeEra - (365 * anioDeEra + Math.floor(anioDeEra / 4) - Math.floor(anioDeEra / 100));
  const mesDesdeMarzo = Math.floor((5 * diaDelAnio + 2) / 153);
  const dia = diaDelAnio - Math.floor((153 * mesDesdeMarzo + 2) / 5) + 1;
  const mes = mesDesdeMarzo < 10 ? mesDesdeMarzo + 3 : mesDesdeMarzo - 9;
  const anio = anioDeEra + era * 400 + (mes <= 2 ? 1 : 0);
  return { anio, mes, dia };
}

/** Valida una cadena AAAA-MM-DD que corresponda a un dia real del calendario. */
export function fechaIso(texto: string): FechaIso {
  const partes = PATRON_FECHA.exec(texto);
  if (partes !== null) {
    const anio = Number(partes[1]);
    const mes = Number(partes[2]);
    const dia = Number(partes[3]);
    if (mes >= 1 && mes <= 12 && dia >= 1 && dia <= diasDelMes(anio, mes)) {
      return texto as FechaIso;
    }
  }
  throw new RangeError(`Fecha invalida: "${texto}". Se espera AAAA-MM-DD.`);
}

export function sumarDias(fecha: FechaIso, dias: number): FechaIso {
  return componer(desdeNumeroDeDia(aNumeroDeDia(descomponer(fecha)) + dias));
}

/**
 * Suma meses conservando el dia. Si el mes destino no tiene ese dia, se usa su
 * ultimo dia: 31 de enero mas un mes es 28 o 29 de febrero.
 */
export function sumarMeses(fecha: FechaIso, meses: number): FechaIso {
  const { anio, mes, dia } = descomponer(fecha);
  const indiceMes = anio * 12 + (mes - 1) + meses;
  const anioDestino = Math.floor(indiceMes / 12);
  const mesDestino = indiceMes - anioDestino * 12 + 1;
  return componer({
    anio: anioDestino,
    mes: mesDestino,
    dia: Math.min(dia, diasDelMes(anioDestino, mesDestino)),
  });
}

/** Dias transcurridos de desde a hasta; negativo si hasta es anterior. */
export function diferenciaEnDias(desde: FechaIso, hasta: FechaIso): number {
  return aNumeroDeDia(descomponer(hasta)) - aNumeroDeDia(descomponer(desde));
}

export function diaDeLaSemana(fecha: FechaIso): DiaSemana {
  // El numero de dia 0 (1970-01-01) fue jueves, dia 4.
  const numeroDeDia = aNumeroDeDia(descomponer(fecha));
  return ((((numeroDeDia + 4) % 7) + 7) % 7) as DiaSemana;
}

/** Primer dia de la semana presupuestal que contiene la fecha. */
export function inicioDeSemana(fecha: FechaIso, diaInicioSemana: DiaSemana): FechaIso {
  validarDiaSemana(diaInicioSemana);
  const retroceso = (diaDeLaSemana(fecha) - diaInicioSemana + 7) % 7;
  return sumarDias(fecha, -retroceso);
}

/**
 * Fin del horizonte (SUP-01 modificado por SC-01): la fecha relevante mas lejana
 * (ultimo vencimiento o fecha objetivo de la meta), sin rebasar seis meses desde la
 * fecha de referencia y sin quedar antes de ella.
 */
export function calcularFinHorizonte(
  fechaReferencia: FechaIso,
  fechasRelevantes: readonly FechaIso[],
): FechaIso {
  const tope = sumarMeses(fechaReferencia, HORIZONTE_MAXIMO_MESES);
  let fin = fechaReferencia;
  for (const fecha of fechasRelevantes) {
    if (fecha > fin) {
      fin = fecha;
    }
  }
  return fin > tope ? tope : fin;
}

/**
 * Genera semanas contiguas de siete dias. La primera inicia en el dia configurado
 * mas reciente que no sea posterior a la fecha de referencia; la ultima contiene la
 * fecha de fin.
 */
export function generarSemanas(
  fechaReferencia: FechaIso,
  diaInicioSemana: DiaSemana,
  fechaFin: FechaIso,
): Semana[] {
  if (fechaFin < fechaReferencia) {
    throw new RangeError(
      `El fin del horizonte (${fechaFin}) es anterior a la referencia (${fechaReferencia}).`,
    );
  }
  const semanas: Semana[] = [];
  let inicio = inicioDeSemana(fechaReferencia, diaInicioSemana);
  while (inicio <= fechaFin) {
    semanas.push({ numero: semanas.length + 1, inicio, fin: sumarDias(inicio, 6) });
    inicio = sumarDias(inicio, 7);
  }
  return semanas;
}

/**
 * Numero de la semana que contiene la fecha, o null si cae fuera del horizonte.
 * Supone semanas contiguas de siete dias, como las que produce generarSemanas.
 */
export function numeroDeSemana(semanas: readonly Semana[], fecha: FechaIso): number | null {
  if (semanas.length === 0) {
    return null;
  }
  const dias = diferenciaEnDias(semanas[0].inicio, fecha);
  if (dias < 0) {
    return null;
  }
  const indice = Math.floor(dias / 7);
  return indice < semanas.length ? indice + 1 : null;
}

function validarDiaSemana(dia: number): void {
  if (!Number.isInteger(dia) || dia < 0 || dia > 6) {
    throw new RangeError(`Dia de inicio de semana invalido: ${dia}. Se espera 0 a 6.`);
  }
}

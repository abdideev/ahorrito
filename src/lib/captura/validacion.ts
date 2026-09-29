/**
 * Validación de la captura en el servidor (RF-02 a RF-06, sección 3.6.2).
 *
 * Las Server Actions son alcanzables con peticiones POST directas, no solo desde el
 * formulario, así que esta validación es el control real; la del navegador es comodidad
 * (regla de código 2.5.6).
 *
 * Todo importe se convierte aquí a centavos enteros y nunca se opera en punto flotante
 * (regla de negocio 4). Los límites replican las restricciones que la base de datos ya
 * impone, para responder con un mensaje en lugar de con un error de base de datos.
 */

import { centavos, type Centavos, type DiaSemana, type Presupuesto } from "@/core/tipos";

/** Máximo representable en numeric(12,2), en pesos. */
export const PESOS_MAXIMOS = 9_999_999_999;

const PATRON_IMPORTE = /^\d{1,10}(\.\d{1,2})?$/;
const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export type ResultadoImporte =
  | { readonly valido: true; readonly monto: Centavos }
  | { readonly valido: false; readonly error: string };

/**
 * Convierte un importe capturado a centavos. Acepta separadores de miles y el símbolo
 * de peso, que es lo que la gente escribe; rechaza más de dos decimales, porque
 * redondear en silencio produciría un plan que no cuadra con lo capturado.
 */
export function validarImporte(recibido: unknown, etiqueta: string): ResultadoImporte {
  if (typeof recibido !== "string") {
    return { valido: false, error: `Escribe ${etiqueta}.` };
  }
  const limpio = recibido.trim().replace(/[\s$,]/g, "");
  if (limpio === "") {
    return { valido: false, error: `Escribe ${etiqueta}.` };
  }
  if (!PATRON_IMPORTE.test(limpio)) {
    return { valido: false, error: `Escribe ${etiqueta} con números y hasta dos decimales.` };
  }
  const [enteros, decimales = ""] = limpio.split(".");
  if (Number(enteros) > PESOS_MAXIMOS) {
    return { valido: false, error: `El importe es demasiado grande.` };
  }
  const monto = centavos(Number(enteros) * 100 + Number(decimales.padEnd(2, "0")));
  if (monto <= 0) {
    return { valido: false, error: `${etiqueta[0].toUpperCase()}${etiqueta.slice(1)} debe ser mayor que cero.` };
  }
  return { valido: true, monto };
}

export type ResultadoDia =
  | { readonly valido: true; readonly dia: DiaSemana }
  | { readonly valido: false; readonly error: string };

/** Día de inicio de semana: 0 es domingo, conforme al contrato de I-01. */
export function validarDiaSemana(recibido: unknown): ResultadoDia {
  const texto = typeof recibido === "string" ? recibido.trim() : "";
  if (!/^[0-6]$/.test(texto)) {
    return { valido: false, error: "Elige el día en que inicia tu semana." };
  }
  return { valido: true, dia: Number(texto) as DiaSemana };
}

export type ResultadoFecha =
  | { readonly valido: true; readonly fecha: string }
  | { readonly valido: false; readonly error: string };

/**
 * Fecha de calendario AAAA-MM-DD existente. No usa `fechaIso` del núcleo para decidir:
 * esa función lanza, y aquí un dato inválido del usuario debe producir un mensaje.
 */
export function validarFecha(recibido: unknown, etiqueta: string): ResultadoFecha {
  const texto = typeof recibido === "string" ? recibido.trim() : "";
  if (texto === "") {
    return { valido: false, error: `Elige ${etiqueta}.` };
  }
  if (!PATRON_FECHA.test(texto)) {
    return { valido: false, error: `Elige ${etiqueta} con el formato AAAA-MM-DD.` };
  }
  // El constructor Date acepta el 31 de febrero y lo corre al 3 de marzo: se compara
  // la fecha reconstruida para descartar días que no existen.
  const fecha = new Date(`${texto}T00:00:00Z`);
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== texto) {
    return { valido: false, error: `Esa fecha no existe.` };
  }
  return { valido: true, fecha: texto };
}

export interface ErroresPresupuesto {
  readonly montoSemanal?: string;
  readonly diaInicioSemana?: string;
}

export type ResultadoPresupuesto =
  | { readonly valido: true; readonly presupuesto: Presupuesto }
  | { readonly valido: false; readonly errores: ErroresPresupuesto };

/** RF-02: presupuesto semanal con día de inicio de semana. */
export function validarPresupuesto(montoRecibido: unknown, diaRecibido: unknown): ResultadoPresupuesto {
  const monto = validarImporte(montoRecibido, "tu presupuesto semanal");
  const dia = validarDiaSemana(diaRecibido);

  if (!monto.valido || !dia.valido) {
    return {
      valido: false,
      errores: {
        montoSemanal: monto.valido ? undefined : monto.error,
        diaInicioSemana: dia.valido ? undefined : dia.error,
      },
    };
  }
  return { valido: true, presupuesto: { montoSemanal: monto.monto, diaInicioSemana: dia.dia } };
}

export const LONGITUD_MAXIMA_DENOMINACION = 80;
export const OCURRENCIAS_MINIMAS = 1;
export const OCURRENCIAS_MAXIMAS = 6;

export interface ErroresCompromiso {
  readonly denominacion?: string;
  readonly monto?: string;
  readonly fechaLimite?: string;
  readonly ocurrencias?: string;
}

export interface DatosCompromisoValidados {
  readonly denominacion: string;
  readonly monto: Centavos;
  readonly fechaLimite: string;
  readonly ocurrencias: number;
}

export type ResultadoCompromiso =
  | { readonly valido: true; readonly datos: DatosCompromisoValidados }
  | { readonly valido: false; readonly errores: ErroresCompromiso };

/**
 * RF-03: compromiso de pago con denominación, monto, fecha límite y ocurrencias.
 *
 * Las ocurrencias van de 1 a 6 (regla de negocio 2). Una fecha límite anterior a hoy se
 * acepta: el motor la señala con una advertencia en lugar de rechazarla, porque el
 * usuario puede estar registrando un pago que ya venció y quiere ver reflejado.
 */
export function validarCompromiso(
  denominacionRecibida: unknown,
  montoRecibido: unknown,
  fechaRecibida: unknown,
  ocurrenciasRecibidas: unknown,
): ResultadoCompromiso {
  const denominacion = typeof denominacionRecibida === "string" ? denominacionRecibida.trim() : "";
  const monto = validarImporte(montoRecibido, "el monto del pago");
  const fecha = validarFecha(fechaRecibida, "la fecha límite");
  const ocurrencias = validarOcurrencias(ocurrenciasRecibidas);

  let errorDenominacion: string | undefined;
  if (denominacion === "") {
    errorDenominacion = "Escribe cómo reconoces este pago.";
  } else if (denominacion.length > LONGITUD_MAXIMA_DENOMINACION) {
    errorDenominacion = `Usa ${LONGITUD_MAXIMA_DENOMINACION} caracteres o menos.`;
  }

  if (errorDenominacion || !monto.valido || !fecha.valido || !ocurrencias.valido) {
    return {
      valido: false,
      errores: {
        denominacion: errorDenominacion,
        monto: monto.valido ? undefined : monto.error,
        fechaLimite: fecha.valido ? undefined : fecha.error,
        ocurrencias: ocurrencias.valido ? undefined : ocurrencias.error,
      },
    };
  }
  return {
    valido: true,
    datos: {
      denominacion,
      monto: monto.monto,
      fechaLimite: fecha.fecha,
      ocurrencias: ocurrencias.ocurrencias,
    },
  };
}

type ResultadoOcurrencias =
  | { readonly valido: true; readonly ocurrencias: number }
  | { readonly valido: false; readonly error: string };

function validarOcurrencias(recibido: unknown): ResultadoOcurrencias {
  const texto = typeof recibido === "string" ? recibido.trim() : "";
  if (!/^[1-6]$/.test(texto)) {
    return {
      valido: false,
      error: `Elige entre ${OCURRENCIAS_MINIMAS} y ${OCURRENCIAS_MAXIMAS} repeticiones mensuales.`,
    };
  }
  return { valido: true, ocurrencias: Number(texto) };
}

export interface ErroresIngreso {
  readonly monto?: string;
  readonly fecha?: string;
}

export type ResultadoIngreso =
  | { readonly valido: true; readonly monto: Centavos; readonly fecha: string }
  | { readonly valido: false; readonly errores: ErroresIngreso };

/**
 * RF-05: ingreso extraordinario con monto y fecha de recepción.
 *
 * No se exige que la fecha caiga dentro del horizonte: el horizonte depende del plan que
 * todavía no se ha calculado, y el motor ya avisa con `ingreso-fuera-de-horizonte`.
 */
export function validarIngreso(montoRecibido: unknown, fechaRecibida: unknown): ResultadoIngreso {
  const monto = validarImporte(montoRecibido, "el monto del ingreso");
  const fecha = validarFecha(fechaRecibida, "la fecha del ingreso");

  if (!monto.valido || !fecha.valido) {
    return {
      valido: false,
      errores: {
        monto: monto.valido ? undefined : monto.error,
        fecha: fecha.valido ? undefined : fecha.error,
      },
    };
  }
  return { valido: true, monto: monto.monto, fecha: fecha.fecha };
}

export interface ErroresMeta {
  readonly montoObjetivo?: string;
  readonly fechaObjetivo?: string;
}

export type ResultadoMeta =
  | { readonly valido: true; readonly montoObjetivo: Centavos; readonly fechaObjetivo: string }
  | { readonly valido: false; readonly errores: ErroresMeta };

/**
 * RF-06: meta de ahorro con monto objetivo y fecha objetivo.
 *
 * El contrato de I-01 exige que la fecha objetivo sea posterior a hoy. La fecha de hoy se
 * recibe como dato, no se lee del reloj, para que la función sea comprobable; quien la
 * llama usa la fecha del centro de México (`fechaDeHoyEnMexico`).
 */
export function validarMeta(montoRecibido: unknown, fechaRecibida: unknown, hoy: string): ResultadoMeta {
  const monto = validarImporte(montoRecibido, "el monto de tu meta");
  const fecha = validarFecha(fechaRecibida, "la fecha en que quieres lograrla");

  let errorFecha = fecha.valido ? undefined : (fecha as { error: string }).error;
  if (fecha.valido && fecha.fecha <= hoy) {
    // Las fechas AAAA-MM-DD se comparan como cadenas: su orden alfabético es cronológico.
    errorFecha = "Elige una fecha posterior a hoy.";
  }

  if (!monto.valido || errorFecha) {
    return {
      valido: false,
      errores: { montoObjetivo: monto.valido ? undefined : monto.error, fechaObjetivo: errorFecha },
    };
  }
  return { valido: true, montoObjetivo: monto.monto, fechaObjetivo: (fecha as { fecha: string }).fecha };
}

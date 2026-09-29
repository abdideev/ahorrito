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

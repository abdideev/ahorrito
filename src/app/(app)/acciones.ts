"use server";

/**
 * Acciones de captura del panel (C-01 → C-05 por I-04, SC-06).
 *
 * Las Server Actions se alcanzan con peticiones POST directas, no solo desde el
 * formulario, así que cada una valida su entrada en el servidor (sección 3.6.2). La
 * identidad no viaja en el formulario: la aporta la sesión y la comprueba la seguridad
 * por fila (SC-04).
 */

import { revalidatePath } from "next/cache";
import { fechaIso } from "@/core/calendario";
import { ErrorPersistencia } from "@/adapters/persistencia/repositorio-supabase";
import { texto, type EstadoCaptura } from "@/lib/captura/estado";
import { validarCompromiso, validarPresupuesto } from "@/lib/captura/validacion";
import { RUTA_PANEL } from "@/lib/autenticacion/rutas";
import { repositorioDeLaSesion } from "@/lib/supabase/repositorio";

/** RF-02: captura o reemplaza el presupuesto semanal con su día de inicio de semana. */
export async function guardarPresupuesto(
  _estadoPrevio: EstadoCaptura,
  formulario: FormData,
): Promise<EstadoCaptura> {
  const valores = {
    montoSemanal: texto(formulario, "montoSemanal"),
    diaInicioSemana: texto(formulario, "diaInicioSemana"),
  };
  const validacion = validarPresupuesto(valores.montoSemanal, valores.diaInicioSemana);

  if (!validacion.valido) {
    return {
      tipo: "error",
      mensaje: "Revisa los campos marcados.",
      errores: { ...validacion.errores },
      valores,
    };
  }

  try {
    const repositorio = await repositorioDeLaSesion();
    await repositorio.guardarPresupuesto(validacion.presupuesto);
  } catch (error) {
    console.error("[captura] No se pudo guardar el presupuesto.", describirError(error));
    return {
      tipo: "error",
      mensaje: "No se pudo guardar tu presupuesto. Intenta de nuevo.",
      errores: {},
      valores,
    };
  }

  // La página vuelve a leer el presupuesto guardado, que es la única fuente de verdad.
  revalidatePath(RUTA_PANEL);
  return { tipo: "exito", mensaje: "Presupuesto guardado.", errores: {}, valores: {} };
}

/**
 * RF-03: da de alta un compromiso de pago. Al terminar, el formulario queda vacío para
 * capturar el siguiente, que es el caso común al empezar.
 */
export async function agregarCompromiso(
  _estadoPrevio: EstadoCaptura,
  formulario: FormData,
): Promise<EstadoCaptura> {
  const valores = valoresDeCompromiso(formulario);
  const validacion = validarCompromiso(
    valores.denominacion,
    valores.monto,
    valores.fechaLimite,
    valores.ocurrencias,
  );
  if (!validacion.valido) {
    return { tipo: "error", mensaje: "Revisa los campos marcados.", errores: { ...validacion.errores }, valores };
  }

  try {
    const repositorio = await repositorioDeLaSesion();
    await repositorio.agregarCompromiso({
      denominacion: validacion.datos.denominacion,
      monto: validacion.datos.monto,
      fechaLimite: fechaIso(validacion.datos.fechaLimite),
      ocurrencias: validacion.datos.ocurrencias,
    });
  } catch (error) {
    return fallo(error, "No se pudo guardar el pago. Intenta de nuevo.", valores);
  }

  revalidatePath(RUTA_PANEL);
  return { tipo: "exito", mensaje: `Se agregó "${validacion.datos.denominacion}".`, errores: {}, valores: {} };
}

/** RF-04: modifica un compromiso propio. */
export async function actualizarCompromiso(
  _estadoPrevio: EstadoCaptura,
  formulario: FormData,
): Promise<EstadoCaptura> {
  const id = texto(formulario, "id");
  const valores = valoresDeCompromiso(formulario);
  const validacion = validarCompromiso(
    valores.denominacion,
    valores.monto,
    valores.fechaLimite,
    valores.ocurrencias,
  );
  if (!validacion.valido) {
    return { tipo: "error", mensaje: "Revisa los campos marcados.", errores: { ...validacion.errores }, valores };
  }

  try {
    const repositorio = await repositorioDeLaSesion();
    const cambiado = await repositorio.actualizarCompromiso(id, {
      denominacion: validacion.datos.denominacion,
      monto: validacion.datos.monto,
      fechaLimite: fechaIso(validacion.datos.fechaLimite),
      ocurrencias: validacion.datos.ocurrencias,
    });
    if (!cambiado) {
      // El identificador no existe o es de otro usuario: la seguridad por fila no
      // distingue ambos casos y la respuesta tampoco debe distinguirlos.
      return { tipo: "error", mensaje: "No encontramos ese pago.", errores: {}, valores };
    }
  } catch (error) {
    return fallo(error, "No se pudo modificar el pago. Intenta de nuevo.", valores);
  }

  revalidatePath(RUTA_PANEL);
  return { tipo: "exito", mensaje: "Pago actualizado.", errores: {}, valores };
}

/** RF-04: elimina un compromiso propio. */
export async function eliminarCompromiso(
  _estadoPrevio: EstadoCaptura,
  formulario: FormData,
): Promise<EstadoCaptura> {
  const id = texto(formulario, "id");
  try {
    const repositorio = await repositorioDeLaSesion();
    const eliminado = await repositorio.eliminarCompromiso(id);
    if (!eliminado) {
      return { tipo: "error", mensaje: "No encontramos ese pago.", errores: {}, valores: {} };
    }
  } catch (error) {
    return fallo(error, "No se pudo eliminar el pago. Intenta de nuevo.", {});
  }

  revalidatePath(RUTA_PANEL);
  return { tipo: "exito", mensaje: "Pago eliminado.", errores: {}, valores: {} };
}

function valoresDeCompromiso(formulario: FormData): Record<string, string> {
  return {
    denominacion: texto(formulario, "denominacion"),
    monto: texto(formulario, "monto"),
    fechaLimite: texto(formulario, "fechaLimite"),
    ocurrencias: texto(formulario, "ocurrencias"),
  };
}

/** Registra el fallo sin datos del usuario y devuelve un mensaje que no filtra detalles. */
function fallo(error: unknown, mensaje: string, valores: Record<string, string>): EstadoCaptura {
  console.error(`[captura] ${mensaje}`, describirError(error));
  return { tipo: "error", mensaje, errores: {}, valores };
}

/** Solo el nombre y el código: el mensaje original podría describir la consulta. */
function describirError(error: unknown): string {
  if (error instanceof ErrorPersistencia) {
    return `ErrorPersistencia(${error.codigo ?? "sin codigo"})`;
  }
  return error instanceof Error ? error.name : "desconocido";
}

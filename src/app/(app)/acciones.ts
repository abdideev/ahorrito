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
import { ErrorPersistencia } from "@/adapters/persistencia/repositorio-supabase";
import { texto, type EstadoCaptura } from "@/lib/captura/estado";
import { validarPresupuesto } from "@/lib/captura/validacion";
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

/** Solo el nombre y el código: el mensaje original podría describir la consulta. */
function describirError(error: unknown): string {
  if (error instanceof ErrorPersistencia) {
    return `ErrorPersistencia(${error.codigo ?? "sin codigo"})`;
  }
  return error instanceof Error ? error.name : "desconocido";
}

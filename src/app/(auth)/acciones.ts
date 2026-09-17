"use server";

/**
 * Acciones de autenticación (RF-01, C-06).
 *
 * Las Server Actions son alcanzables con peticiones POST directas, no solo desde los
 * formularios; por eso cada una valida su entrada en el servidor (sección 3.6.2).
 * La contraseña solo viaja de aquí a Supabase Auth por HTTPS: no se registra en logs
 * ni se guarda en tablas propias (RNF-05).
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { EstadoFormulario } from "@/lib/autenticacion/estado";
import { mensajeDeErrorAutenticacion } from "@/lib/autenticacion/mensajes";
import {
  RUTA_INICIO_SESION,
  RUTA_PANEL,
  rutaInternaSegura,
  urlDeConfirmacion,
} from "@/lib/autenticacion/rutas";
import { validarInicioSesion, validarRegistro } from "@/lib/autenticacion/validacion";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export async function registrarse(
  _estadoPrevio: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const validacion = validarRegistro(formulario.get("correo"), formulario.get("contrasena"));
  if (!validacion.valido) {
    return {
      tipo: "error",
      mensaje: "Revisa los campos marcados.",
      errores: validacion.errores,
      correo: validacion.correo,
    };
  }

  const supabase = await crearClienteServidor();
  const origen = (await headers()).get("origin");
  const { data, error } = await supabase.auth.signUp({
    email: validacion.correo,
    password: validacion.contrasena,
    // Flujo PKCE: el enlace del correo confirma la cuenta en Supabase y vuelve a
    // /confirmar con un código que se canjea por la sesión.
    options: { emailRedirectTo: urlDeConfirmacion(origen) },
  });

  if (error) {
    return {
      tipo: "error",
      mensaje: mensajeDeErrorAutenticacion(error.code),
      errores: {},
      correo: validacion.correo,
    };
  }

  // Si la confirmación por correo estuviera desactivada, Supabase abre la sesión de inmediato.
  if (data.session) {
    redirect(RUTA_PANEL);
  }

  // Con la confirmación activa, Supabase responde igual para correos nuevos y existentes.
  // El mensaje tampoco los distingue, para no revelar qué cuentas existen.
  return {
    tipo: "exito",
    mensaje:
      "Si el correo puede registrarse, recibirás un enlace para confirmar la cuenta. Revisa tu bandeja de entrada.",
    errores: {},
    correo: validacion.correo,
  };
}

export async function iniciarSesion(
  _estadoPrevio: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const validacion = validarInicioSesion(formulario.get("correo"), formulario.get("contrasena"));
  if (!validacion.valido) {
    return {
      tipo: "error",
      mensaje: "Revisa los campos marcados.",
      errores: validacion.errores,
      correo: validacion.correo,
    };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: validacion.correo,
    password: validacion.contrasena,
  });

  if (error) {
    return {
      tipo: "error",
      mensaje: mensajeDeErrorAutenticacion(error.code),
      errores: {},
      correo: validacion.correo,
    };
  }

  redirect(rutaInternaSegura(formulario.get("siguiente"), RUTA_PANEL));
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect(RUTA_INICIO_SESION);
}

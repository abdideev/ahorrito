import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { RUTA_INICIO_SESION, RUTA_PANEL, rutaInternaSegura } from "@/lib/autenticacion/rutas";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/**
 * Destino del enlace de confirmación que Supabase envía por correo (RF-01).
 *
 * Admite los dos flujos de Supabase Auth:
 * - Código PKCE (`code`): el que usa la plantilla de correo por omisión. Supabase ya
 *   confirmó el correo; aquí solo se canjea el código por la sesión. Requiere abrir el
 *   enlace en el mismo navegador del registro, donde está la cookie del verificador.
 * - Token (`token_hash` y `type`): el que usará una plantilla personalizada cuando el
 *   proyecto tenga SMTP propio (Fase 6). Funciona desde cualquier navegador.
 *
 * Diferencias deliberadas respecto a la plantilla oficial de Supabase para Next.js:
 * - `next` solo admite rutas internas. La plantilla redirige a cualquier valor, lo que
 *   permitiría usar un enlace legítimo de confirmación para enviar al usuario a un sitio
 *   externo (redirección abierta, CWE-601).
 * - El mensaje de error de Supabase no se coloca en la URL, donde quedaría en el
 *   historial del navegador y en los registros del servidor.
 */

const TIPOS_ADMITIDOS: readonly string[] = ["signup", "email", "invite", "magiclink", "recovery", "email_change"];

export async function GET(solicitud: NextRequest) {
  const parametros = solicitud.nextUrl.searchParams;
  const codigo = parametros.get("code");
  const tokenHash = parametros.get("token_hash");
  const tipo = parametros.get("type");
  const destino = rutaInternaSegura(parametros.get("next"), RUTA_PANEL);

  if (codigo) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) {
      redirect(destino);
    }
  } else if (tokenHash && tipo && TIPOS_ADMITIDOS.includes(tipo)) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.verifyOtp({
      type: tipo as EmailOtpType,
      token_hash: tokenHash,
    });
    if (!error) {
      redirect(destino);
    }
  }

  redirect(`${RUTA_INICIO_SESION}?error=confirmacion`);
}

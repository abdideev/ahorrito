import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clasificarRuta, RUTA_INICIO_SESION, RUTA_PANEL } from "@/lib/autenticacion/rutas";
import { configuracionSupabase, type ConfiguracionSupabase } from "./entorno";

/**
 * Renueva la sesión y aplica la protección de rutas en cada petición (paso 2.4).
 *
 * Es la primera de tres capas de defensa:
 *   1. Esta función: comprobación optimista antes de renderizar.
 *   2. El layout de (app): verifica la sesión en el servidor al renderizar.
 *   3. La seguridad por fila de la base de datos: aunque las dos anteriores fallaran,
 *      ninguna consulta devuelve datos de otro usuario (RNF-04).
 */
export async function actualizarSesion(solicitud: NextRequest): Promise<NextResponse> {
  const tipo = clasificarRuta(solicitud.nextUrl.pathname);

  let configuracion: ConfiguracionSupabase;
  try {
    configuracion = configuracionSupabase();
  } catch (error) {
    // Sin Supabase configurado, las rutas públicas (incluida la demostración del
    // motor) siguen funcionando; las demás fallan de forma explícita.
    if (tipo === "publica") {
      return NextResponse.next({ request: solicitud });
    }
    throw error;
  }

  let respuesta = NextResponse.next({ request: solicitud });

  const supabase = createServerClient(configuracion.url, configuracion.clavePublica, {
    cookies: {
      getAll() {
        return solicitud.cookies.getAll();
      },
      setAll(porEstablecer) {
        porEstablecer.forEach(({ name, value }) => solicitud.cookies.set(name, value));
        respuesta = NextResponse.next({ request: solicitud });
        porEstablecer.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
      },
    },
  });

  // No ejecutar código entre la creación del cliente y getClaims(): la renovación de
  // la sesión ocurre aquí, y cualquier código intermedio puede desincronizar las cookies
  // y cerrar sesiones de forma aleatoria. getClaims() verifica la firma del JWT;
  // getSession() no lo hace y no debe usarse para decidir acceso.
  const { data } = await supabase.auth.getClaims();
  const autenticado = Boolean(data?.claims);

  if (!autenticado && tipo === "protegida") {
    const destino = solicitud.nextUrl.clone();
    destino.pathname = RUTA_INICIO_SESION;
    destino.search = "";
    destino.searchParams.set("siguiente", `${solicitud.nextUrl.pathname}${solicitud.nextUrl.search}`);
    return conservarCookies(NextResponse.redirect(destino), respuesta);
  }

  if (!autenticado && tipo === "api") {
    return conservarCookies(NextResponse.json({ error: "No autenticado" }, { status: 401 }), respuesta);
  }

  if (autenticado && tipo === "invitado") {
    const destino = solicitud.nextUrl.clone();
    destino.pathname = RUTA_PANEL;
    destino.search = "";
    return conservarCookies(NextResponse.redirect(destino), respuesta);
  }

  return respuesta;
}

/**
 * Una respuesta nueva no hereda las cookies renovadas. Sin copiarlas, el navegador y el
 * servidor quedan con sesiones distintas y el usuario pierde la suya.
 */
function conservarCookies(destino: NextResponse, origen: NextResponse): NextResponse {
  origen.cookies.getAll().forEach((cookie) => destino.cookies.set(cookie));
  return destino;
}

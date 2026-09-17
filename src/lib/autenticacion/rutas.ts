/**
 * Clasificación de rutas para la protección de sesión (Fase 2, paso 2.4).
 *
 * Política de denegación por omisión: toda ruta es protegida salvo que se declare
 * pública aquí. Así, una pantalla nueva nace protegida aunque se olvide registrarla.
 */

export type TipoRuta = "publica" | "invitado" | "protegida" | "api";

export const RUTA_INICIO_SESION = "/iniciar-sesion";
export const RUTA_PANEL = "/panel";
export const RUTA_CONFIRMAR = "/confirmar";

/** Accesibles con o sin sesión. */
const RUTAS_PUBLICAS = ["/", "/demo", RUTA_CONFIRMAR] as const;

/** Solo tienen sentido sin sesión; con sesión se redirige al panel. */
const RUTAS_DE_INVITADO = [RUTA_INICIO_SESION, "/registro"] as const;

function perteneceA(ruta: string, base: string): boolean {
  // "/" solo coincide consigo misma: con un prefijo simple, toda ruta sería pública.
  if (base === "/") {
    return ruta === "/";
  }
  return ruta === base || ruta.startsWith(`${base}/`);
}

export function clasificarRuta(ruta: string): TipoRuta {
  if (perteneceA(ruta, "/api")) {
    return "api";
  }
  if (RUTAS_DE_INVITADO.some((base) => perteneceA(ruta, base))) {
    return "invitado";
  }
  if (RUTAS_PUBLICAS.some((base) => perteneceA(ruta, base))) {
    return "publica";
  }
  return "protegida";
}

const ORIGEN_DE_REFERENCIA = "http://ahorrito.invalid";

/**
 * Devuelve el destino solo si es una ruta interna del sitio; si no, el respaldo.
 * Previene redirecciones abiertas (CWE-601): un enlace legítimo de confirmación con
 * `next=https://sitio-malicioso` no debe sacar al usuario de la aplicación.
 * El análisis con URL cubre las variantes que los navegadores interpretan como
 * absolutas: "//dominio", "/\dominio" y rutas con tabuladores o saltos de línea.
 */
export function rutaInternaSegura(destino: unknown, respaldo: string): string {
  if (typeof destino !== "string" || !destino.startsWith("/")) {
    return respaldo;
  }
  try {
    const url = new URL(destino, ORIGEN_DE_REFERENCIA);
    if (url.origin !== ORIGEN_DE_REFERENCIA) {
      return respaldo;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return respaldo;
  }
}

/**
 * URL absoluta a la que Supabase redirige después de confirmar el correo.
 *
 * Se construye con el encabezado Origin de la Server Action. Es confiable por dos
 * defensas independientes: Next.js aborta la acción si Origin no coincide con el host
 * (protección CSRF), y Supabase solo redirige a direcciones de su lista permitida.
 * Si el origen falta o no es válido, se omite y Supabase usa la Site URL del proyecto.
 */
export function urlDeConfirmacion(origen: string | null): string | undefined {
  if (!origen) {
    return undefined;
  }
  try {
    const url = new URL(origen);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return undefined;
    }
    return `${url.origin}${RUTA_CONFIRMAR}`;
  } catch {
    return undefined;
  }
}

/**
 * Configuración de conexión con Supabase (C-06, C-07).
 *
 * Valida las variables de entorno al usarlas, en lugar de confiar en aserciones "!",
 * para que un despliegue mal configurado falle con un mensaje claro (RNF-09).
 * Exige HTTPS: la conexión con Supabase es uno de los tramos de RNF-05. Solo se admite
 * HTTP contra una instancia local.
 *
 * Los mensajes de error nunca incluyen el valor de la clave.
 */

export interface ConfiguracionSupabase {
  readonly url: string;
  readonly clavePublica: string;
}

const ANFITRIONES_LOCALES = new Set(["localhost", "127.0.0.1"]);

export function leerConfiguracionSupabase(valores: {
  url?: string;
  clavePublica?: string;
}): ConfiguracionSupabase {
  const url = valores.url?.trim();
  const clavePublica = valores.clavePublica?.trim();
  if (!url || !clavePublica) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copia .env.example a .env.local y completa ambas variables.",
    );
  }

  let direccion: URL;
  try {
    direccion = new URL(url);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL no es una URL valida.");
  }

  const esLocal = ANFITRIONES_LOCALES.has(direccion.hostname);
  if (direccion.protocol !== "https:" && !(esLocal && direccion.protocol === "http:")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL debe usar HTTPS (RNF-05).");
  }

  return { url: direccion.origin, clavePublica };
}

/**
 * Lee la configuración del entorno. Las variables se nombran de forma literal porque
 * Next.js solo sustituye `process.env.NEXT_PUBLIC_*` cuando aparece escrito completo.
 */
export function configuracionSupabase(): ConfiguracionSupabase {
  return leerConfiguracionSupabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    clavePublica: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

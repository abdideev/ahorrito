import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { configuracionSupabase } from "./entorno";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 *
 * Se crea uno por petición y nunca se guarda en una variable global: la sesión vive en
 * las cookies de cada petición, y un cliente compartido mezclaría usuarios.
 *
 * Usa la clave pública. Las consultas quedan sujetas a la seguridad por fila con la
 * identidad del usuario de la sesión; la aplicación no usa la clave de servicio.
 */
export async function crearClienteServidor() {
  const { url, clavePublica } = configuracionSupabase();
  const almacen = await cookies();

  return createServerClient(url, clavePublica, {
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      setAll(porEstablecer) {
        try {
          porEstablecer.forEach(({ name, value, options }) => almacen.set(name, value, options));
        } catch {
          // Un Server Component no puede escribir cookies. Es seguro ignorarlo porque
          // proxy.ts renueva la sesión en cada petición.
        }
      },
    },
  });
}

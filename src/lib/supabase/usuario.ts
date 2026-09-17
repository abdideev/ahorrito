import { cache } from "react";
import { crearClienteServidor } from "./servidor";

export interface UsuarioActual {
  readonly id: string;
  readonly correo: string;
}

/**
 * Usuario de la sesión, verificado en el servidor con getClaims().
 * `cache` evita repetir la verificación cuando el layout y la página la piden en la
 * misma petición.
 */
export const obtenerUsuarioActual = cache(async (): Promise<UsuarioActual | null> => {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) {
    return null;
  }
  return { id: claims.sub, correo: typeof claims.email === "string" ? claims.email : "" };
});

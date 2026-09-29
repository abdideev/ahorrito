import { crearRepositorioSupabase } from "@/adapters/persistencia/repositorio-supabase";
import type { RepositorioPlanes } from "@/ports/repositorio";
import { crearClienteServidor } from "./servidor";

/**
 * Repositorio (I-04) construido con la sesión de la petición en curso.
 *
 * Se crea uno por petición, nunca uno compartido: el cliente lleva la sesión del usuario
 * y uno global mezclaría identidades. Es el único punto donde la capa de aplicación
 * elige la implementación del puerto; el resto depende de la interfaz.
 */
export async function repositorioDeLaSesion(): Promise<RepositorioPlanes> {
  return crearRepositorioSupabase(await crearClienteServidor());
}

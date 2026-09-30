/**
 * Preferencia de tema de la interfaz (C-01).
 *
 * La lee el layout raíz en el servidor y la escribe el selector de tema en el
 * navegador; por eso vive en `lib` y no dentro de ninguno de los dos.
 */

export const COOKIE_TEMA = "theme";

export type Tema = "light" | "dark";

/** Un año: la preferencia sobrevive entre sesiones sin caducar a mitad del periodo. */
const UN_ANO_EN_SEGUNDOS = 60 * 60 * 24 * 365;

/** Valor de `document.cookie` que guarda el tema para todas las rutas del sitio. */
export function cookieDeTema(tema: Tema): string {
  return `${COOKIE_TEMA}=${tema}; Path=/; Max-Age=${UN_ANO_EN_SEGUNDOS}; SameSite=Lax`;
}

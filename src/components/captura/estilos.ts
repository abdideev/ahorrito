/**
 * Clases compartidas por los formularios de captura (C-01).
 *
 * Están aquí y no repetidas en cada componente para que el contraste y el estilo del
 * foco se ajusten en un solo lugar cuando se verifique RNF-11 en el paso 4.7.
 */

export const etiqueta = "block text-sm font-semibold text-texto";

export const campo =
  "hundido mt-2 min-h-11 w-full px-3.5 py-2.5 text-texto aria-[invalid=true]:border-2 aria-[invalid=true]:border-error disabled:cursor-not-allowed disabled:opacity-60";

export const ayuda = "mt-2 text-sm leading-5 text-texto-suave";

export const error = "mt-2 text-sm font-semibold text-error";

export const botonPrimario = "boton-primario";

export const botonSecundario = "boton-secundario";

export function mensaje(tipo: "error" | "exito" | null): string {
  return tipo === "error"
    ? "rounded-xl border border-error bg-error/[0.06] p-3 text-sm font-semibold text-error"
    : "rounded-xl border border-[var(--verde-600)] bg-verde-marca/[0.08] p-3 text-sm font-semibold text-texto";
}

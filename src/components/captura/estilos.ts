/**
 * Clases compartidas por los formularios de captura (C-01).
 *
 * Están aquí y no repetidas en cada componente para que el contraste y el estilo del
 * foco se ajusten en un solo lugar cuando se verifique RNF-11 en el paso 4.7.
 */

export const etiqueta = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export const campo =
  "mt-1 w-full rounded border border-zinc-400 bg-white px-3 py-2 text-zinc-900 aria-[invalid=true]:border-red-600 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

export const error = "mt-1 text-sm text-red-700 dark:text-red-400";

export function mensaje(tipo: "error" | "exito" | null): string {
  return tipo === "error"
    ? "rounded border border-red-600 p-3 text-sm text-red-700 dark:text-red-400"
    : "rounded border border-emerald-600 p-3 text-sm text-emerald-800 dark:text-emerald-300";
}

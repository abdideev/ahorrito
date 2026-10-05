/**
 * Clases compartidas por los formularios de captura (C-01).
 *
 * Están aquí y no repetidas en cada componente para que el contraste y el estilo del
 * foco se ajusten en un solo lugar cuando se verifique RNF-11 en el paso 4.7.
 */

export const etiqueta = "mb-2 block text-sm font-semibold text-texto";

export const campo =
  "hundido min-h-12 w-full px-3.5 py-2.5 text-texto placeholder:text-texto-suave aria-[invalid=true]:border-2 aria-[invalid=true]:border-error disabled:cursor-not-allowed disabled:opacity-60";

/** Campo con un icono decorativo a la izquierda; el contenedor debe ser `relative`. */
export const campoConIcono = `${campo} pl-11`;

export const iconoCampo =
  "pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-texto-suave";

/** Campo de importe con el signo de pesos a la izquierda; el contenedor debe ser `relative`. */
export const campoPesos = `${campo} pl-8 tabular-nums`;

export const prefijoPesos =
  "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-semibold text-texto-suave";

export const ayuda = "mt-2 text-sm leading-5 text-texto-suave";

export const error = "mt-2 text-sm font-semibold text-error";

export const botonPrimario = "boton-primario";

/** Guardar datos capturados. El verde queda para la acción principal: generar el plan. */
export const botonGuardar = "boton-invertido w-full sm:w-auto";

export const botonSecundario = "boton-secundario";

export function mensaje(tipo: "error" | "exito" | null): string {
  return tipo === "error"
    ? "rounded-xl border border-error/40 bg-error-suave p-3 text-sm font-semibold text-error"
    : "rounded-xl border border-terciario/30 bg-terciario-suave p-3 text-sm font-semibold text-terciario";
}

import type { ReactNode } from "react";
import { error as claseError, etiqueta as claseEtiqueta } from "@/components/captura/estilos";

interface Props {
  idCampo: string;
  etiqueta: string;
  /** Mensaje del servidor para este campo; ausente cuando el valor es válido. */
  mensajeError?: string;
  /** Texto de ayuda permanente, anunciado junto al campo. */
  ayuda?: string;
  children: ReactNode;
}

/**
 * Envoltura de un campo de captura: etiqueta, control, ayuda y error (RNF-11).
 *
 * Vive a nivel de módulo y no dentro del formulario: un componente declarado durante el
 * render se recrea en cada dibujo y pierde el estado de sus controles.
 *
 * Quien lo usa debe enlazar el control con `id={idCampo}` y con
 * `aria-describedby={idAyuda(idCampo)}` o `idError(idCampo)` según corresponda.
 */
export function CampoCaptura({ idCampo, etiqueta, mensajeError, ayuda, children }: Props) {
  return (
    <div>
      <label htmlFor={idCampo} className={claseEtiqueta}>
        {etiqueta}
      </label>
      {children}
      {ayuda && (
        <p id={idAyuda(idCampo)} className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {ayuda}
        </p>
      )}
      {mensajeError && (
        <p id={idError(idCampo)} className={claseError}>
          {mensajeError}
        </p>
      )}
    </div>
  );
}

export const idAyuda = (idCampo: string) => `${idCampo}-ayuda`;
export const idError = (idCampo: string) => `${idCampo}-error`;

/** Lista de identificadores para `aria-describedby`, o undefined si no hay ninguno. */
export function describedBy(idCampo: string, opciones: { ayuda?: boolean; error?: boolean }): string | undefined {
  const ids = [opciones.ayuda ? idAyuda(idCampo) : null, opciones.error ? idError(idCampo) : null].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

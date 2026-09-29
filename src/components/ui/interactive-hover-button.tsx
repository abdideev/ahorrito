/**
 * Componente Interactive Hover Button de Magic UI.
 * Origen: https://magicui.design/docs/components/interactive-hover-button
 * Registro: https://magicui.design/r/interactive-hover-button.json
 * Licencia: MIT, Copyright (c) Magic UI.
 *
 * Adaptaciones para Ahorrito: se sustituyó `lucide-react` por un SVG en línea, se eliminó
 * la utilidad `cn`, se ocultó la capa visual duplicada a lectores de pantalla y se llevó
 * la animación a CSS para respetar `prefers-reduced-motion` sin agregar dependencias.
 */

import type { ButtonHTMLAttributes } from "react";

function combinarClases(...clases: Array<string | undefined>): string {
  return clases.filter(Boolean).join(" ");
}

export function InteractiveHoverButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={combinarClases("boton-primario boton-interactivo", className)}
      {...props}
    >
      <span className="boton-interactivo-contenido">
        <span aria-hidden="true" className="boton-interactivo-punto" />
        <span>{children}</span>
      </span>
      <span aria-hidden="true" className="boton-interactivo-alterno">
        <span>{children}</span>
        <svg viewBox="0 0 24 24" className="size-5" fill="none">
          <path
            d="M5 12h14m-5-5 5 5-5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}

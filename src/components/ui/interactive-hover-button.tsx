/**
 * Componente Interactive Hover Button de Magic UI.
 * Origen: https://magicui.design/docs/components/interactive-hover-button
 * Registro: https://magicui.design/r/interactive-hover-button.json
 * Licencia: MIT, Copyright (c) Magic UI.
 *
 * Adaptaciones para Ahorrito: se sustituyó `lucide-react` por un SVG en línea, se eliminó
 * la utilidad `cn`, se ocultó la capa visual duplicada a lectores de pantalla y se llevó
 * la animación a CSS para respetar `prefers-reduced-motion` sin agregar dependencias.
 * Como en el original, al pasar el cursor solo se desvanece el texto; el círculo se
 * expande y su color, `--punto-interactivo`, queda como fondo del botón.
 * `InteractiveHoverLink` aplica el mismo efecto a un enlace de navegación: un `<button>`
 * que navega no se anuncia como enlace ni se abre en otra pestaña.
 */

import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { IconoFlecha } from "@/components/ui/iconos";

function combinarClases(...clases: Array<string | undefined>): string {
  return clases.filter(Boolean).join(" ");
}

function Capas({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="boton-interactivo-contenido">
        <span aria-hidden="true" className="boton-interactivo-punto" />
        <span className="boton-interactivo-texto">{children}</span>
      </span>
      <span aria-hidden="true" className="boton-interactivo-alterno">
        <span>{children}</span>
        <IconoFlecha />
      </span>
    </>
  );
}

export function InteractiveHoverButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={combinarClases("boton-primario boton-interactivo", className)} {...props}>
      <Capas>{children}</Capas>
    </button>
  );
}

export function InteractiveHoverLink({ children, className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link className={combinarClases("boton-primario boton-interactivo", className)} {...props}>
      <Capas>{children}</Capas>
    </Link>
  );
}

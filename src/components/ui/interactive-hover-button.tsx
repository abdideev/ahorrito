"use client";

/**
 * Componente Interactive Hover Button de Magic UI.
 * Origen: https://magicui.design/docs/components/interactive-hover-button
 * Registro: https://magicui.design/r/interactive-hover-button.json
 * Licencia: MIT, Copyright (c) Magic UI.
 *
 * Adaptaciones para Ahorrito: la flecha de `lucide-react` se toma de react-icons (SC-08), se eliminó
 * la utilidad `cn`, se ocultó la capa visual duplicada a lectores de pantalla y se llevó
 * la animación a CSS para respetar `prefers-reduced-motion` sin agregar dependencias.
 * Como en el original, al pasar el cursor solo se desvanece el texto; el círculo se
 * expande y su color, `--punto-interactivo`, queda como fondo del botón. Al hacer clic
 * el botón se hunde con Motion (SC-08).
 * `InteractiveHoverLink` aplica el mismo efecto a un enlace de navegación: un `<button>`
 * que navega no se anuncia como enlace ni se abre en otra pestaña.
 */

import { motion, type HTMLMotionProps } from "motion/react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { IconoFlecha } from "@/components/ui/iconos";
import { TAP_BOTON } from "@/components/ui/movimiento";

const EnlaceMovil = motion.create(Link);

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
  disabled,
  ...props
}: Omit<HTMLMotionProps<"button">, "children"> & { children?: ReactNode }) {
  return (
    <motion.button
      className={combinarClases("boton-primario boton-interactivo", className)}
      disabled={disabled}
      whileTap={disabled ? undefined : TAP_BOTON}
      {...props}
    >
      <Capas>{children}</Capas>
    </motion.button>
  );
}

export function InteractiveHoverLink({
  children,
  className,
  ...props
}: Omit<ComponentProps<typeof EnlaceMovil>, "children"> & { children?: ReactNode }) {
  return (
    <EnlaceMovil
      className={combinarClases("boton-primario boton-interactivo", className)}
      whileTap={TAP_BOTON}
      {...props}
    >
      <Capas>{children}</Capas>
    </EnlaceMovil>
  );
}

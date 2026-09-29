/**
 * Componente Animated Shiny Text de Magic UI.
 * Origen: https://magicui.design/docs/components/animated-shiny-text
 * Registro: https://magicui.design/r/animated-shiny-text.json
 * Licencia: MIT, Copyright (c) Magic UI.
 *
 * Adaptaciones para Ahorrito: se eliminó la utilidad `cn`, se usaron los tokens de texto
 * con contraste verificado y la animación se limita a una pasada dentro de
 * `prefers-reduced-motion: no-preference`.
 */

import type { ComponentPropsWithoutRef, CSSProperties, FC } from "react";

export interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number;
}

function combinarClases(...clases: Array<string | undefined>): string {
  return clases.filter(Boolean).join(" ");
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  style,
  ...props
}) => {
  return (
    <span
      style={
        {
          ...style,
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={combinarClases("texto-brillante-animado", className)}
      {...props}
    >
      {children}
    </span>
  );
};

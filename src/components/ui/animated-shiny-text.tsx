/**
 * Componente Animated Shiny Text de Magic UI.
 * Origen: https://magicui.design/docs/components/animated-shiny-text
 * Registro: https://magicui.design/r/animated-shiny-text.json
 * Licencia: MIT, Copyright (c) Magic UI.
 *
 * Adaptaciones para Ahorrito: se eliminó la utilidad `cn`, se usaron los tokens de texto
 * con contraste verificado y la animación vive dentro de `prefers-reduced-motion:
 * no-preference`. Se repite mientras dura una espera; con `unaVez` da una sola pasada,
 * para textos que solo deben llamar la atención al aparecer.
 */

import type { ComponentPropsWithoutRef, CSSProperties, FC } from "react";

export interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number;
  unaVez?: boolean;
}

function combinarClases(...clases: Array<string | undefined>): string {
  return clases.filter(Boolean).join(" ");
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  unaVez = false,
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
      data-una-vez={unaVez ? "" : undefined}
      className={combinarClases("texto-brillante-animado", className)}
      {...props}
    >
      {children}
    </span>
  );
};

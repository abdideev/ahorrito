/**
 * Iconos de trazo compartidos por la interfaz (C-01).
 *
 * Son SVG en línea y no una biblioteca de iconos para no agregar dependencias. Todos
 * son decorativos (`aria-hidden`): el significado siempre lo lleva el texto contiguo,
 * de modo que un lector de pantalla no anuncia nada que la vista no diga (RNF-11).
 */

import type { ReactNode, SVGProps } from "react";

type PropsIcono = Omit<SVGProps<SVGSVGElement>, "children">;

function Icono({ className = "size-5", children, ...props }: PropsIcono & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconoFlecha = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M5 12h14m-5-5 5 5-5 5" />
  </Icono>
);

export const IconoCalendario = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
  </Icono>
);

export const IconoEscudo = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M12 21s8-4 8-10V5l-8-3-8 3v6c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-5" />
  </Icono>
);

export const IconoTendencia = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </Icono>
);

export const IconoCartera = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M4 7a2 2 0 0 1 2-2h11v4" />
    <path d="M4 7v11a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2Z" />
    <path d="M16 14.5h.01" />
  </Icono>
);

export const IconoRecibo = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
    <path d="M9 8h6m-6 4h6" />
  </Icono>
);

export const IconoAlcancia = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M5 11a7 6 0 0 1 12.5-3.5L20 7v4l1 1v3h-2.5A7 6 0 0 1 16 17.5V20h-3v-1.6a8 8 0 0 1-3 0V20H7v-2.7A6 6 0 0 1 5 13v-2Z" />
    <path d="M10 8h3" />
  </Icono>
);

export const IconoBillete = (p: PropsIcono) => (
  <Icono {...p}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6.5 9.5h.01M17.5 14.5h.01" />
  </Icono>
);

export const IconoAviso = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M12 9v4m0 4h.01M10.3 3.8 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
  </Icono>
);

export const IconoInfo = (p: PropsIcono) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5m0-8h.01" />
  </Icono>
);

export const IconoCheck = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="m5 12 4 4L19 6" />
  </Icono>
);

export const IconoCirculoCheck = (p: PropsIcono) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </Icono>
);

export const IconoError = (p: PropsIcono) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6m0-6-6 6" />
  </Icono>
);

export const IconoMas = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icono>
);

export const IconoLapiz = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="m13.5 6.5 4 4" />
  </Icono>
);

export const IconoPapelera = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Icono>
);

export const IconoDestello = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6" />
  </Icono>
);

export const IconoHistorial = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5M12 7v5l3 2" />
  </Icono>
);

export const IconoPanel = (p: PropsIcono) => (
  <Icono {...p}>
    <rect x="3" y="3" width="8" height="10" rx="2" />
    <rect x="13" y="3" width="8" height="6" rx="2" />
    <rect x="13" y="11" width="8" height="10" rx="2" />
    <rect x="3" y="15" width="8" height="6" rx="2" />
  </Icono>
);

export const IconoSalir = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" />
  </Icono>
);

export const IconoReloj = (p: PropsIcono) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icono>
);

export const IconoRepetir = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M17 2l3 3-3 3" />
    <path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3" />
    <path d="M20 13v2a4 4 0 0 1-4 4H4" />
  </Icono>
);

export const IconoCandado = (p: PropsIcono) => (
  <Icono {...p}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
  </Icono>
);

export const IconoCorreo = (p: PropsIcono) => (
  <Icono {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Icono>
);

export const IconoChevron = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icono>
);

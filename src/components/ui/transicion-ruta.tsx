import { ViewTransition, type ReactNode } from "react";

/**
 * Transición de entrada y salida del contenido de una página (C-01).
 *
 * Usa `<ViewTransition>` de React, que el App Router de Next 16 activa en cada
 * navegación sin configuración ni dependencias. Va en cada `page.tsx` y no en el layout:
 * un layout persiste entre navegaciones y nunca dispara `enter` ni `exit`.
 *
 * `router.refresh()` no desmonta la página, así que recalcular un plan no la anima. Las
 * animaciones están en `globals.css` y se anulan con "reducir movimiento".
 */
export function TransicionRuta({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="ruta-entra" exit="ruta-sale" default="none">
      {children}
    </ViewTransition>
  );
}

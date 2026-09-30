"use client";

/**
 * Componente Animated Theme Toggler de Magic UI.
 * Origen: https://magicui.design/docs/components/animated-theme-toggler
 * Registro: https://magicui.design/r/animated-theme-toggler.json
 * Licencia: MIT, Copyright (c) Magic UI.
 *
 * Adaptaciones para Ahorrito: los iconos de `lucide-react` se toman de react-icons (SC-08) y se eliminó
 * la utilidad `cn`; se conserva solo la variante circular, que es la que se usa; el
 * botón anuncia en español el tema al que cambia; y si el sistema pide reducir el
 * movimiento, el tema cambia sin la transición de vista.
 *
 * El original guarda el tema en `localStorage`; aquí va en una cookie, que el layout raíz
 * lee en el servidor para entregar el HTML ya con el tema y evitar un destello.
 */

import { useCallback, useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { flushSync } from "react-dom";
import { IconoLuna, IconoSol } from "@/components/ui/iconos";
import { cookieDeTema } from "@/lib/tema";

interface Props extends Omit<ComponentPropsWithoutRef<"button">, "onClick" | "children"> {
  duration?: number;
}

function combinarClases(...clases: Array<string | undefined>): string {
  return clases.filter(Boolean).join(" ");
}

export function AnimatedThemeToggler({ className, duration = 400, ...props }: Props) {
  const [oscuro, setOscuro] = useState(false);
  const botonRef = useRef<HTMLButtonElement>(null);
  const enTransicion = useRef(false);

  useEffect(() => {
    const raiz = document.documentElement;
    const actualizar = () => setOscuro(raiz.classList.contains("dark"));
    actualizar();
    // Si otro selector de la página cambia el tema, este botón se mantiene al día.
    const observador = new MutationObserver(actualizar);
    observador.observe(raiz, { attributes: true, attributeFilter: ["class"] });
    return () => observador.disconnect();
  }, []);

  const alternar = useCallback(() => {
    const boton = botonRef.current;
    if (boton === null || enTransicion.current) {
      return;
    }

    const aplicar = () => {
      const nuevo = !document.documentElement.classList.contains("dark");
      document.documentElement.classList.toggle("dark", nuevo);
      setOscuro(nuevo);
      // Si las cookies están bloqueadas, el tema cambia igual; solo no se recuerda.
      document.cookie = cookieDeTema(nuevo ? "dark" : "light");
    };

    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof document.startViewTransition !== "function" || sinMovimiento) {
      aplicar();
      return;
    }

    // Porcentajes y no píxeles: Chrome dibuja mal el recorte en px con escalas de
    // pantalla fraccionarias, como el 150 % de Windows (nota del registro original).
    const ancho = window.innerWidth;
    const alto = window.innerHeight;
    const { top, left, width, height } = boton.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radio = Math.hypot(Math.max(x, ancho - x), Math.max(y, alto - y));
    const centro = `${(x / ancho) * 100}% ${(y / alto) * 100}%`;
    const radioFinal = `${(radio / (Math.hypot(ancho, alto) / Math.SQRT2)) * 100}%`;
    const recorte = [`circle(0% at ${centro})`, `circle(${radioFinal} at ${centro})`];

    const raiz = document.documentElement;
    raiz.dataset.transicionTema = "activa";
    raiz.style.setProperty("--tema-recorte-inicial", recorte[0]);
    enTransicion.current = true;

    const transicion = document.startViewTransition(() => {
      flushSync(aplicar);
    });

    // Salvaguarda propia: la transición espera un cuadro de pintado para capturar la
    // vista. Si no llega (pestaña que no se dibuja), se omite; `skipTransition` ejecuta
    // igual el cambio de tema, de modo que el botón nunca queda sin efecto.
    const salvaguarda = window.setTimeout(() => transicion.skipTransition(), 1000);

    transicion.ready
      .then(() => {
        window.clearTimeout(salvaguarda);
        raiz.animate(
          { clipPath: recorte },
          { duration, easing: "ease-in-out", fill: "forwards", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});

    transicion.finished
      .finally(() => {
        window.clearTimeout(salvaguarda);
        enTransicion.current = false;
        delete raiz.dataset.transicionTema;
        raiz.style.removeProperty("--tema-recorte-inicial");
      })
      .catch(() => {});
  }, [duration]);

  return (
    <button
      type="button"
      ref={botonRef}
      onClick={alternar}
      aria-label={oscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={oscuro ? "Tema claro" : "Tema oscuro"}
      className={combinarClases(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-borde-fuerte bg-tarjeta text-texto hover:bg-superficie-hundida",
        className,
      )}
      {...props}
    >
      {/* El icono lo elige el CSS con la clase `dark`, que ya viene del servidor: así no
          aparece el icono equivocado mientras React hidrata. */}
      <IconoSol className="hidden size-5 dark:inline" />
      <IconoLuna className="size-5 dark:hidden" />
    </button>
  );
}

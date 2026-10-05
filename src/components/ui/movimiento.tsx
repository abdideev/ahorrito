"use client";

/**
 * Animaciones de la interfaz con Motion (SC-08, #26).
 *
 * Reglas comunes para que el movimiento no compita con el contenido:
 * - `MotionConfig reducedMotion="user"`: con "reducir movimiento" activado en el sistema,
 *   Motion omite desplazamientos y escalas y deja solo cambios de opacidad (RNF-11).
 * - Entradas cortas (menos de medio segundo) y desplazamientos de pocos píxeles, en CSS
 *   para que el contenido nunca dependa de JavaScript para verse (ver `Aparecer`).
 * - Las transiciones entre rutas no viven aquí: las hace `TransicionRuta` con
 *   `<ViewTransition>` de React, porque el App Router desmonta la página saliente sin
 *   avisar a `AnimatePresence`.
 */

import { AnimatePresence, motion, MotionConfig, type HTMLMotionProps } from "motion/react";
import { useState, type ReactNode } from "react";

/** Curva de desaceleración compartida: arranca rápido y se asienta sin rebote. */
export const CURVA = [0.2, 0.8, 0.2, 1] as const;

/** Efecto de las tarjetas que se pueden señalar: se elevan y crecen un 1 %. */
export const HOVER_TARJETA = { y: -3, scale: 1.01, transition: { duration: 0.2, ease: CURVA } } as const;

/** Efecto de clic compartido por los botones: se hunden un 3 %. */
export const TAP_BOTON = { scale: 0.97 } as const;

export function ProveedorMovimiento({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

type Etiqueta = "div" | "section" | "header" | "footer" | "li" | "p";

type PropsAparecer<E extends Etiqueta> = HTMLMotionProps<E> & {
  como?: E;
  /** Posición en la cuadrícula: cada celda entra 50 ms después de la anterior. */
  indice?: number;
  /**
   * Se eleva al señalarla y se hunde al pulsarla. Es un booleano y no un objeto de
   * animación porque las páginas de servidor solo pueden pasar valores serializables.
   */
  interactiva?: boolean;
};

/**
 * Celda que entra con un desvanecido y 12 px de subida. Sustituye a la etiqueta de la
 * celda (`como`) para no agregar un nivel más a la cuadrícula Bento: así conserva su
 * `col-span` y su semántica.
 *
 * La entrada es una animación CSS (`.aparecer` en `globals.css`) y no de Motion: Motion
 * dibuja en el servidor la celda con `opacity: 0` y la revela desde JavaScript, así que
 * mientras la página hidrata, o si JavaScript falla, el panel se vería en blanco. La
 * animación CSS arranca con el primer pintado. Motion se reserva el cursor y el clic.
 */
export function Aparecer<E extends Etiqueta = "div">({
  como,
  indice = 0,
  interactiva = false,
  className,
  style,
  ...props
}: PropsAparecer<E>) {
  const Componente = motion[(como ?? "div") as Etiqueta] as React.ElementType;
  return (
    <Componente
      className={`aparecer ${className ?? ""}`}
      style={{ ...style, "--orden": Math.min(indice, 8) }}
      whileHover={interactiva ? HOVER_TARJETA : undefined}
      whileTap={interactiva ? { scale: 0.99 } : undefined}
      {...props}
    />
  );
}

interface PropsRegion {
  abierto: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Contenido que se despliega y pliega en altura sin desmontarse, para que un formulario
 * conserve lo escrito al cerrarlo. Al terminar de plegarse recibe `hidden`, que lo saca
 * del orden de tabulación y del árbol de accesibilidad (RNF-11).
 */
export function RegionDesplegable({ abierto, id, className, children }: PropsRegion) {
  const [oculto, setOculto] = useState(!abierto);
  // Se quita `hidden` en cuanto se pide abrir: un elemento oculto no tiene altura que
  // medir. Ajustar el estado durante el render evita un cuadro con la región invisible.
  if (abierto && oculto) {
    setOculto(false);
  }

  return (
    <motion.div
      id={id}
      hidden={oculto}
      initial={false}
      animate={abierto ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: CURVA }}
      onAnimationComplete={() => {
        if (!abierto) {
          setOculto(true);
        }
      }}
      className={`overflow-hidden ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * Lista cuyos elementos pueden animar su salida. `AnimatePresence` retiene el elemento
 * eliminado hasta que termina su `exit`; sus hijos deben ser componentes `motion` con
 * `key`. `initial={false}` evita animar las filas que ya estaban al cargar.
 */
export function ListaAnimada({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <ul className={className}>
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </ul>
  );
}

/** Entrada y salida de una fila de lista, para usar con `ListaAnimada`. */
export const FILA = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -16, transition: { duration: 0.2, ease: CURVA } },
  transition: { duration: 0.25, ease: CURVA },
} as const;

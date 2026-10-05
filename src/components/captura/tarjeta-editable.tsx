"use client";

import { motion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { IconoLapiz, IconoMas } from "@/components/ui/iconos";
import { Aparecer, RegionDesplegable, TAP_BOTON } from "@/components/ui/movimiento";

interface Props {
  /** Título de la tarjeta, ya con su nivel de encabezado e identificador. */
  encabezado: ReactNode;
  /** Texto del botón que abre el formulario, por ejemplo "Editar" o "Agregar pago". */
  textoAccion: string;
  icono?: "editar" | "agregar";
  /** Lo que se lee sin editar: la cifra guardada o la lista de pagos. */
  resumen?: ReactNode;
  formulario: ReactNode;
  /** Sin datos todavía no hay nada que resumir: el formulario empieza abierto. */
  abiertoInicial?: boolean;
  /** Posición en la cuadrícula, para escalonar la entrada (SC-08). */
  indice?: number;
  className?: string;
}

/**
 * Tarjeta de captura en dos estados: resumen para leer y formulario para editar.
 *
 * El botón vive en el encabezado y el formulario se abre debajo; con un `<details>`
 * nativo el botón tendría que ir pegado al contenido que despliega. Accesibilidad
 * (RNF-11): es un botón real con `aria-expanded` y `aria-controls`.
 *
 * El formulario se despliega en altura con `RegionDesplegable` (Motion, SC-08) y nunca
 * se desmonta, así su estado no se pierde al cerrarlo.
 */
export function TarjetaEditable({
  encabezado,
  textoAccion,
  icono = "editar",
  resumen,
  formulario,
  abiertoInicial = false,
  indice = 0,
  className,
}: Props) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  const idRegion = useId();

  return (
    <Aparecer como="section" indice={indice} className={`tarjeta p-6 sm:p-7 ${className ?? ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {encabezado}
        <motion.button
          type="button"
          aria-expanded={abierto}
          aria-controls={idRegion}
          onClick={() => setAbierto((valor) => !valor)}
          whileTap={TAP_BOTON}
          className="boton-secundario min-h-11 px-3 text-sm"
        >
          {icono === "agregar" ? <IconoMas className="size-4" /> : <IconoLapiz className="size-4" />}
          {abierto ? "Cerrar" : textoAccion}
        </motion.button>
      </div>

      <RegionDesplegable id={idRegion} abierto={abierto}>
        <div className="mt-5 rounded-2xl border border-borde bg-superficie-hundida p-4 sm:p-5">{formulario}</div>
      </RegionDesplegable>

      {resumen}
    </Aparecer>
  );
}

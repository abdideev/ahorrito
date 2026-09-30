"use client";

import { useId, useState, type ReactNode } from "react";
import { IconoLapiz, IconoMas } from "@/components/ui/iconos";

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
  className?: string;
}

/**
 * Tarjeta de captura en dos estados: resumen para leer y formulario para editar.
 *
 * El botón vive en el encabezado y el formulario se abre debajo; con un `<details>`
 * nativo el botón tendría que ir pegado al contenido que despliega. Accesibilidad
 * (RNF-11): es un botón real con `aria-expanded` y `aria-controls`, y el formulario
 * permanece en el DOM oculto con `hidden`, así su estado no se pierde al cerrarlo.
 */
export function TarjetaEditable({
  encabezado,
  textoAccion,
  icono = "editar",
  resumen,
  formulario,
  abiertoInicial = false,
  className,
}: Props) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  const idRegion = useId();

  return (
    <section className={`tarjeta p-6 sm:p-7 ${className ?? ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {encabezado}
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={idRegion}
          onClick={() => setAbierto((valor) => !valor)}
          className="boton-secundario min-h-11 px-3 text-sm"
        >
          {icono === "agregar" ? <IconoMas className="size-4" /> : <IconoLapiz className="size-4" />}
          {abierto ? "Cerrar" : textoAccion}
        </button>
      </div>

      <div id={idRegion} hidden={!abierto} className="mt-5 rounded-2xl border border-borde bg-superficie-hundida p-4 sm:p-5">
        {formulario}
      </div>

      {resumen}
    </section>
  );
}

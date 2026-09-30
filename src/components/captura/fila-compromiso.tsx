"use client";

import { motion } from "motion/react";
import { useId, useState } from "react";
import { BotonEliminar } from "@/components/captura/boton-eliminar";
import { FormularioCompromiso } from "@/components/captura/formulario-compromiso";
import { IconoLapiz, IconoRepetir } from "@/components/ui/iconos";
import { FILA, RegionDesplegable } from "@/components/ui/movimiento";
import type { EstadoCaptura } from "@/lib/captura/estado";
import { centavosATextoPlano, formatearPesos } from "@/lib/dinero";
import { formatearFechaCorta, formatearFechaLarga } from "@/lib/fecha";
import type { CompromisoGuardado } from "@/ports/repositorio";

type Accion = (estado: EstadoCaptura, formulario: FormData) => Promise<EstadoCaptura>;

interface Props {
  compromiso: CompromisoGuardado;
  actualizar: Accion;
  eliminar: Accion;
}

/**
 * Un pago en la lista compacta del panel, con su edición y su baja (RF-03, RF-04).
 *
 * La fila se lee de un vistazo: nombre, recurrencia, fecha y monto. La edición se abre
 * debajo con un botón que declara `aria-expanded`; la fecha corta lleva la larga en
 * `<time dateTime>` para que un lector de pantalla no lea "17 oct" sin año.
 */
export function FilaCompromiso({ compromiso, actualizar, eliminar }: Props) {
  const [editando, setEditando] = useState(false);
  const idEdicion = useId();

  return (
    <motion.li layout {...FILA} className="rounded-2xl border border-borde bg-tarjeta p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-primario" />
        <div className="min-w-0 flex-1 basis-40">
          <p className="truncate font-bold text-texto" title={compromiso.denominacion}>
            {compromiso.denominacion}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-texto-suave">
            <span>
              {compromiso.ocurrencias === 1 ? "Vence el " : "Desde el "}
              <time dateTime={compromiso.fechaLimite} title={formatearFechaLarga(compromiso.fechaLimite)}>
                {formatearFechaCorta(compromiso.fechaLimite)}
              </time>
            </span>
            {compromiso.ocurrencias > 1 && (
              <span className="inline-flex items-center gap-1">
                <IconoRepetir className="size-3.5" />
                {compromiso.ocurrencias} meses
              </span>
            )}
          </p>
        </div>
        {/* Monto y acciones van juntos: en pantallas angostas bajan a una segunda línea. */}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <p className="mr-2 font-bold text-texto tabular-nums">{formatearPesos(compromiso.monto)}</p>
          <button
            type="button"
            aria-expanded={editando}
            aria-controls={idEdicion}
            onClick={() => setEditando((valor) => !valor)}
            title={`Editar ${compromiso.denominacion}`}
            className="boton-secundario min-w-11 px-0 text-sm aria-expanded:border-primario aria-expanded:bg-primario-suave"
          >
            <IconoLapiz className="size-4" />
            <span className="sr-only">Editar {compromiso.denominacion}</span>
          </button>
          <BotonEliminar accion={eliminar} id={compromiso.id} descripcion={compromiso.denominacion} soloIcono />
        </div>
      </div>

      <RegionDesplegable id={idEdicion} abierto={editando}>
        <div className="mt-3 border-t border-borde pt-4">
          <FormularioCompromiso
            accion={actualizar}
            id={compromiso.id}
            iniciales={{
              denominacion: compromiso.denominacion,
              monto: centavosATextoPlano(compromiso.monto),
              fechaLimite: compromiso.fechaLimite,
              ocurrencias: String(compromiso.ocurrencias),
            }}
            textoBoton="Guardar cambios"
          />
        </div>
      </RegionDesplegable>
    </motion.li>
  );
}

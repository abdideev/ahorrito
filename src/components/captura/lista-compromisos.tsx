import { BotonEliminar } from "@/components/captura/boton-eliminar";
import { FormularioCompromiso } from "@/components/captura/formulario-compromiso";
import type { CompromisoGuardado } from "@/ports/repositorio";
import { centavosATextoPlano } from "@/lib/dinero";
import { formatearPesos } from "@/lib/dinero";
import type { EstadoCaptura } from "@/lib/captura/estado";

interface Props {
  compromisos: readonly CompromisoGuardado[];
  actualizar: (estado: EstadoCaptura, formulario: FormData) => Promise<EstadoCaptura>;
  eliminar: (estado: EstadoCaptura, formulario: FormData) => Promise<EstadoCaptura>;
}

/**
 * Lista de compromisos capturados, con su modificación y su baja (RF-04).
 *
 * La edición vive dentro de un `<details>` nativo: se abre con Enter o Espacio, no
 * necesita JavaScript propio y no saca al usuario de la página, que es lo que haría una
 * ventana modal. Componente de servidor: solo los formularios son de cliente.
 */
export function ListaCompromisos({ compromisos, actualizar, eliminar }: Props) {
  if (compromisos.length === 0) {
    return (
      <p className="mt-4 rounded border border-dashed border-zinc-400 p-4 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300">
        Todavía no registras ningún pago. Agrega al menos uno para generar tu plan.
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {compromisos.map((compromiso) => (
        <li
          key={compromiso.id}
          className="rounded border border-zinc-300 p-4 dark:border-zinc-700"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium">{compromiso.denominacion}</p>
            <p className="text-zinc-700 dark:text-zinc-300">
              {formatearPesos(compromiso.monto)}
              <span className="text-zinc-600 dark:text-zinc-400">
                {" · "}
                {compromiso.ocurrencias === 1
                  ? `vence el ${compromiso.fechaLimite}`
                  : `desde el ${compromiso.fechaLimite}, ${compromiso.ocurrencias} meses`}
              </span>
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <details className="w-full">
              <summary className="cursor-pointer rounded px-1 py-1 text-sm underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">
                Editar<span className="sr-only"> {compromiso.denominacion}</span>
              </summary>
              <div className="mt-3">
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
            </details>
            <BotonEliminar accion={eliminar} id={compromiso.id} descripcion={compromiso.denominacion} />
          </div>
        </li>
      ))}
    </ul>
  );
}

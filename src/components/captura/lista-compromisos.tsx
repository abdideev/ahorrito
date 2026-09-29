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
      <p className="mt-5 rounded-xl border border-dashed border-borde bg-superficie p-4 text-texto-suave">
        Todavía no registras ningún pago. Agrega al menos uno para generar tu plan.
      </p>
    );
  }

  return (
    <ul className="mt-5 space-y-4">
      {compromisos.map((compromiso) => (
        <li
          key={compromiso.id}
          className="elevado p-5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-bold text-texto">{compromiso.denominacion}</p>
            <p className="text-texto">
              {formatearPesos(compromiso.monto)}
              <span className="text-texto-suave">
                {" · "}
                {compromiso.ocurrencias === 1
                  ? `vence el ${compromiso.fechaLimite}`
                  : `desde el ${compromiso.fechaLimite}, ${compromiso.ocurrencias} meses`}
              </span>
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <details className="w-full">
              <summary className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-borde bg-fondo px-4 py-2 text-sm font-bold text-texto">
                Editar<span className="sr-only"> {compromiso.denominacion}</span>
              </summary>
              <div className="mt-4 border-t border-borde pt-4">
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

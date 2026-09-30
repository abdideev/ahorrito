import { FilaCompromiso } from "@/components/captura/fila-compromiso";
import type { CompromisoGuardado } from "@/ports/repositorio";
import { centavos } from "@/core/tipos";
import { formatearPesos } from "@/lib/dinero";
import type { EstadoCaptura } from "@/lib/captura/estado";

interface Props {
  compromisos: readonly CompromisoGuardado[];
  actualizar: (estado: EstadoCaptura, formulario: FormData) => Promise<EstadoCaptura>;
  eliminar: (estado: EstadoCaptura, formulario: FormData) => Promise<EstadoCaptura>;
}

/**
 * Lista compacta de compromisos capturados, con su modificación y su baja (RF-04).
 *
 * Componente de servidor: solo cada fila es de cliente, por el estado de su edición.
 * El pie suma cada pago por todas sus ocurrencias; es una cifra de captura, no del plan,
 * que además descarta las que caen fuera del horizonte.
 */
export function ListaCompromisos({ compromisos, actualizar, eliminar }: Props) {
  if (compromisos.length === 0) {
    return (
      <p className="mt-5 rounded-2xl border border-dashed border-borde-fuerte p-5 text-center text-texto-suave">
        Todavía no registras ningún pago. Usa &quot;Agregar pago&quot; para generar tu plan.
      </p>
    );
  }

  const total = compromisos.reduce(
    (suma, compromiso) => suma + compromiso.monto * compromiso.ocurrencias,
    0,
  );

  return (
    <>
      <ul className="mt-5 space-y-2">
        {compromisos.map((compromiso) => (
          <FilaCompromiso
            key={compromiso.id}
            compromiso={compromiso}
            actualizar={actualizar}
            eliminar={eliminar}
          />
        ))}
      </ul>
      <p className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-borde pt-4 text-sm text-texto-suave">
        <span>
          {compromisos.length} {compromisos.length === 1 ? "pago registrado" : "pagos registrados"}
        </span>
        <span>
          <strong className="text-base text-texto tabular-nums">{formatearPesos(centavos(total))}</strong>{" "}
          contando cada mes
        </span>
      </p>
    </>
  );
}

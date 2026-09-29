import type { AsignacionSemanal, Plan } from "@/core/tipos";
import type { Denominaciones } from "@/lib/plan/advertencias";
import { formatearPesos } from "@/lib/dinero";

interface Props {
  plan: Plan;
  denominaciones: Denominaciones;
}

/**
 * Asignaciones semanales del plan (RF-07, RF-08).
 *
 * Es una tabla real, no una cuadrícula de divisiones: los datos son tabulares y un
 * lector de pantalla necesita los encabezados para anunciar "Semana 3, apartar 200" en
 * lugar de leer números sueltos (RNF-11).
 *
 * Las semanas marcadas no se distinguen solo por color: llevan una palabra en su celda
 * de estado, porque el color por sí solo no es perceptible para todos.
 */
export function TablaSemanas({ plan, denominaciones }: Props) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Plan semanal del {plan.inicioHorizonte} al {plan.finHorizonte}: cuánto apartar cada
          semana y qué vence en ella.
        </caption>
        <thead>
          <tr className="border-b border-zinc-400 text-left dark:border-zinc-600">
            <th scope="col" className="py-2 pr-3">
              Semana
            </th>
            <th scope="col" className="py-2 pr-3">
              Disponible
            </th>
            <th scope="col" className="py-2 pr-3">
              Apartar
            </th>
            <th scope="col" className="py-2 pr-3">
              Para tu meta
            </th>
            <th scope="col" className="py-2 pr-3">
              Te queda
            </th>
            <th scope="col" className="py-2">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {plan.asignaciones.map((semana) => (
            <FilaSemana key={semana.numeroSemana} semana={semana} denominaciones={denominaciones} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilaSemana({
  semana,
  denominaciones,
}: {
  semana: AsignacionSemanal;
  denominaciones: Denominaciones;
}) {
  const vencimientos = semana.vencimientos.map(
    (vencimiento) =>
      `${denominaciones[vencimiento.compromisoId] ?? "Pago"} ${formatearPesos(vencimiento.monto)}`,
  );

  return (
    <tr className="border-b border-zinc-200 align-top dark:border-zinc-800">
      <th scope="row" className="py-2 pr-3 text-left font-medium">
        {semana.numeroSemana}
        <span className="block font-normal text-zinc-600 dark:text-zinc-400">
          {semana.fechaInicio}
        </span>
      </th>
      <td className="py-2 pr-3">{formatearPesos(semana.montoDisponible)}</td>
      <td className="py-2 pr-3">
        {formatearPesos(semana.montoApartado)}
        {vencimientos.length > 0 && (
          <span className="block text-zinc-600 dark:text-zinc-400">
            Vence: {vencimientos.join(", ")}
          </span>
        )}
      </td>
      <td className="py-2 pr-3">{semana.aporteMeta > 0 ? formatearPesos(semana.aporteMeta) : "—"}</td>
      <td className="py-2 pr-3">{formatearPesos(semana.remanente)}</td>
      <td className="py-2">
        {semana.enDeficit ? (
          <span className="rounded bg-red-100 px-2 py-0.5 font-medium text-red-900 dark:bg-red-950 dark:text-red-200">
            No alcanza
          </span>
        ) : semana.sobrecargada ? (
          <span className="rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-100">
            Carga alta
          </span>
        ) : (
          <span className="text-zinc-600 dark:text-zinc-400">Al día</span>
        )}
      </td>
    </tr>
  );
}

"use client";

import type { AsignacionSemanal, Plan } from "@/core/tipos";
import type { Denominaciones } from "@/lib/plan/advertencias";
import { formatearPesos } from "@/lib/dinero";
import type { EstadoAlcancia } from "@/lib/huevo/secuencia";

interface Props {
  plan: Plan;
  denominaciones: Denominaciones;
  /** SC-02: presente solo cuando el plan cuadra al centavo (RF-14). */
  alcancia?: EstadoAlcancia | null;
  alDepositar?: (numeroSemana: number) => void;
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
export function TablaSemanas({ plan, denominaciones, alcancia = null, alDepositar }: Props) {
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
            <FilaSemana
              key={semana.numeroSemana}
              semana={semana}
              denominaciones={denominaciones}
              alcancia={alcancia}
              alDepositar={alDepositar}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilaSemana({
  semana,
  denominaciones,
  alcancia,
  alDepositar,
}: {
  semana: AsignacionSemanal;
  denominaciones: Denominaciones;
  alcancia: EstadoAlcancia | null;
  alDepositar?: (numeroSemana: number) => void;
}) {
  const vencimientos = semana.vencimientos.map(
    (vencimiento) =>
      `${denominaciones[vencimiento.compromisoId] ?? "Pago"} ${formatearPesos(vencimiento.monto)}`,
  );
  const depositada = alcancia !== null && semana.numeroSemana <= alcancia.depositadas;

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
      <td className="py-2 pr-3">
        {alcancia === null || alDepositar === undefined ? (
          formatearPesos(semana.remanente)
        ) : (
          // SC-02: con el plan cuadrado al centavo, cada "queda" se vuelve una moneda.
          // Es un botón real, así que la secuencia se completa también con teclado (CA-13).
          <button
            type="button"
            aria-pressed={depositada}
            onClick={() => alDepositar(semana.numeroSemana)}
            className="rounded px-1 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:hover:bg-amber-900/40"
          >
            {depositada ? (
              <>
                <span aria-hidden="true">🪙</span>
                <span className="sr-only">{formatearPesos(semana.remanente)}, depositada</span>
              </>
            ) : (
              formatearPesos(semana.remanente)
            )}
          </button>
        )}
      </td>
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

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
    <div className="mt-5">
      <p className="mb-2 text-sm font-medium text-texto-suave sm:hidden">
        Desliza horizontalmente para ver todas las columnas.
      </p>
      <div className="relative">
        <div className="overflow-x-auto rounded-xl border border-borde">
          <table className="min-w-184 w-full border-collapse bg-fondo text-sm">
            <caption className="sr-only">
              Plan semanal del {plan.inicioHorizonte} al {plan.finHorizonte}: cuánto apartar cada
              semana y qué vence en ella.
            </caption>
            <thead className="bg-superficie-hundida">
              <tr className="border-b border-borde text-left">
                <th scope="col" className="px-4 py-3 font-bold">
                  Semana
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Disponible
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Apartar
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Para tu meta
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Te queda
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-px right-px w-7 rounded-r-xl bg-linear-to-l from-superficie to-transparent sm:hidden"
        />
      </div>
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
    <tr className="border-b border-borde align-top last:border-b-0">
      <th scope="row" className="px-4 py-3 text-left font-bold">
        {semana.numeroSemana}
        <span className="block font-normal text-texto-suave">{semana.fechaInicio}</span>
      </th>
      <td className="px-4 py-3 tabular-nums">{formatearPesos(semana.montoDisponible)}</td>
      <td className="px-4 py-3 tabular-nums">
        {formatearPesos(semana.montoApartado)}
        {vencimientos.length > 0 && (
          <span className="block text-texto-suave">Vence: {vencimientos.join(", ")}</span>
        )}
      </td>
      <td className="px-4 py-3 tabular-nums">
        {semana.aporteMeta > 0 ? formatearPesos(semana.aporteMeta) : "—"}
      </td>
      <td className="px-4 py-3 tabular-nums">
        {alcancia === null || alDepositar === undefined ? (
          formatearPesos(semana.remanente)
        ) : (
          // SC-02: con el plan cuadrado al centavo, cada "queda" se vuelve una moneda.
          // Es un botón real, así que la secuencia se completa también con teclado (CA-13).
          <button
            type="button"
            aria-pressed={depositada}
            onClick={() => alDepositar(semana.numeroSemana)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-borde bg-superficie px-3 py-2 font-bold hover:bg-superficie-hundida"
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
      <td className="px-4 py-3">
        {semana.enDeficit ? (
          <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 font-bold text-red-900 dark:bg-red-950 dark:text-red-200">
            No alcanza
          </span>
        ) : semana.sobrecargada ? (
          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-100">
            Carga alta
          </span>
        ) : (
          <span className="inline-flex rounded-full border border-borde bg-superficie-hundida px-2.5 py-1 font-medium text-texto">
            Al día
          </span>
        )}
      </td>
    </tr>
  );
}

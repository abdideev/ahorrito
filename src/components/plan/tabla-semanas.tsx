"use client";

import type { AsignacionSemanal, Plan } from "@/core/tipos";
import type { Denominaciones } from "@/lib/plan/advertencias";
import { formatearPesos } from "@/lib/dinero";
import { formatearFechaCorta } from "@/lib/fecha";
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
  const encabezado = "px-4 py-3 text-xs font-bold tracking-wide text-texto-suave uppercase";
  return (
    <div className="mt-4">
      <p className="mb-2 px-1 text-sm font-medium text-texto-suave sm:hidden">
        Desliza horizontalmente para ver todas las columnas.
      </p>
      <div className="relative">
        <div className="overflow-x-auto rounded-2xl border border-borde">
          <table className="w-full min-w-184 border-collapse text-sm">
            <caption className="sr-only">
              Plan semanal del {plan.inicioHorizonte} al {plan.finHorizonte}: cuánto apartar cada
              semana y qué vence en ella.
            </caption>
            <thead className="bg-superficie-hundida">
              <tr className="border-b border-borde">
                <th scope="col" className={`${encabezado} text-left`}>
                  Semana
                </th>
                <th scope="col" className={`${encabezado} text-right`}>
                  Disponible
                </th>
                <th scope="col" className={`${encabezado} text-right`}>
                  Apartar
                </th>
                <th scope="col" className={`${encabezado} text-right`}>
                  Para tu meta
                </th>
                <th scope="col" className={`${encabezado} text-right`}>
                  Te queda
                </th>
                <th scope="col" className={`${encabezado} text-left`}>
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
          className="pointer-events-none absolute inset-y-px right-px w-7 rounded-r-2xl bg-linear-to-l from-tarjeta to-transparent sm:hidden"
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
  const celda = "px-4 py-3.5 text-right tabular-nums";

  return (
    <tr className="border-b border-borde align-top last:border-b-0 hover:bg-superficie-hundida/60">
      <th scope="row" className="px-4 py-3.5 text-left font-bold text-texto">
        Semana {semana.numeroSemana}
        <span className="block text-xs font-medium text-texto-suave">
          {formatearFechaCorta(semana.fechaInicio)} – {formatearFechaCorta(semana.fechaFin)}
        </span>
      </th>
      <td className={celda}>{formatearPesos(semana.montoDisponible)}</td>
      <td className={celda}>
        <span className="font-semibold">{formatearPesos(semana.montoApartado)}</span>
        {vencimientos.length > 0 && (
          <span className="mt-0.5 ml-auto block max-w-56 text-xs text-texto-suave">
            Vence: {vencimientos.join(", ")}
          </span>
        )}
      </td>
      <td className={`${celda} ${semana.aporteMeta > 0 ? "text-verde-texto" : "text-texto-suave"}`}>
        {semana.aporteMeta > 0 ? formatearPesos(semana.aporteMeta) : "—"}
      </td>
      <td className={celda}>
        {alcancia === null || alDepositar === undefined ? (
          <span className={semana.remanente < 0 ? "font-semibold text-error" : "font-semibold"}>
            {formatearPesos(semana.remanente)}
          </span>
        ) : (
          // SC-02: con el plan cuadrado al centavo, cada "queda" se vuelve una moneda.
          // Es un botón real, así que la secuencia se completa también con teclado (CA-13).
          <button
            type="button"
            aria-pressed={depositada}
            onClick={() => alDepositar(semana.numeroSemana)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-borde bg-tarjeta px-3 py-2 font-bold hover:border-borde-fuerte hover:bg-superficie-hundida aria-pressed:border-primario aria-pressed:bg-primario-suave"
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
      <td className="px-4 py-3.5">
        {semana.enDeficit ? (
          <span className="chip chip-error">No alcanza</span>
        ) : semana.sobrecargada ? (
          <span className="chip chip-alerta">Carga alta</span>
        ) : (
          <span className="chip chip-exito">Al día</span>
        )}
      </td>
    </tr>
  );
}

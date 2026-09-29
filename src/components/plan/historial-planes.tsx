"use client";

import { useEffect, useState } from "react";
import { Descargo } from "@/components/plan/descargo";
import { TablaSemanas } from "@/components/plan/tabla-semanas";
import type { Plan } from "@/core/tipos";
import { describirAdvertencias, type Denominaciones } from "@/lib/plan/advertencias";
import { conDenominaciones } from "@/lib/plan/etiquetas";
import { formatearPesos } from "@/lib/dinero";
import type { PlanGuardado, ResumenPlan } from "@/ports/repositorio";

interface Props {
  denominaciones: Denominaciones;
}

/**
 * Historial de planes guardados (RF-12).
 *
 * Consume `GET /api/planes` y `GET /api/planes/{id}`, que son las operaciones que I-01
 * define. Podría leer el repositorio directamente desde el servidor, pero entonces esas
 * dos operaciones del contrato quedarían sin uso real y sin verificar.
 */
export function HistorialPlanes({ denominaciones }: Props) {
  const [resumenes, setResumenes] = useState<ResumenPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<PlanGuardado | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    fetch("/api/planes")
      .then(async (respuesta) => {
        if (!respuesta.ok) {
          throw new Error(String(respuesta.status));
        }
        const datos = (await respuesta.json()) as { planes: ResumenPlan[] };
        if (vigente) {
          setResumenes(datos.planes);
        }
      })
      .catch(() => {
        if (vigente) {
          setError("No pudimos cargar tus planes guardados.");
        }
      });
    // Evita escribir estado si el usuario se fue antes de que llegara la respuesta.
    return () => {
      vigente = false;
    };
  }, []);

  async function abrir(id: string) {
    setCargandoDetalle(id);
    setError(null);
    try {
      const respuesta = await fetch(`/api/planes/${id}`);
      if (!respuesta.ok) {
        setError(respuesta.status === 404 ? "Ese plan ya no existe." : "No pudimos abrir ese plan.");
        return;
      }
      setAbierto((await respuesta.json()) as PlanGuardado);
    } catch {
      setError("Se interrumpió la conexión. Intenta de nuevo.");
    } finally {
      setCargandoDetalle(null);
    }
  }

  if (error !== null && resumenes === null) {
    return (
      <p role="alert" className="rounded border border-red-600 p-3 text-sm text-red-700 dark:text-red-400">
        {error}
      </p>
    );
  }

  if (resumenes === null) {
    return <p className="text-zinc-600 dark:text-zinc-400">Cargando tus planes…</p>;
  }

  if (resumenes.length === 0) {
    return (
      <p className="rounded border border-dashed border-zinc-400 p-4 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300">
        Todavía no has generado ningún plan.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {resumenes.map((resumen) => (
          <li
            key={resumen.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded border border-zinc-300 p-4 dark:border-zinc-700"
          >
            <div>
              <p className="font-medium">
                {new Date(resumen.generadoEn).toLocaleString("es-MX", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {resumen.semanas} semanas, del {resumen.inicioHorizonte} al {resumen.finHorizonte}
                {resumen.metaViable !== null &&
                  (resumen.metaViable ? " · meta alcanzable" : " · meta no alcanzable")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => abrir(resumen.id)}
              disabled={cargandoDetalle !== null}
              aria-expanded={abierto?.id === resumen.id}
              className="rounded border border-zinc-400 px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-60 dark:border-zinc-600"
            >
              {cargandoDetalle === resumen.id ? "Abriendo…" : "Ver el plan"}
            </button>
          </li>
        ))}
      </ul>

      {error !== null && (
        <p role="alert" className="rounded border border-red-600 p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {abierto !== null && <DetallePlan guardado={abierto} denominaciones={denominaciones} />}
    </div>
  );
}

function DetallePlan({
  guardado,
  denominaciones,
}: {
  guardado: PlanGuardado;
  denominaciones: Denominaciones;
}) {
  const plan: Plan = guardado.plan;
  const advertencias = describirAdvertencias(plan.advertencias, denominaciones);

  return (
    <section aria-label="Plan guardado" className="space-y-4 border-t border-zinc-300 pt-6 dark:border-zinc-700">
      <Descargo />

      <p className="text-zinc-700 dark:text-zinc-300">
        Generado el{" "}
        {new Date(guardado.generadoEn).toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" })}.
        {plan.evaluacionMeta !== null && (
          <>
            {" "}
            Meta de {formatearPesos(plan.evaluacionMeta.montoObjetivo)}:{" "}
            {plan.evaluacionMeta.viable ? "alcanzable" : "no alcanzable"}.
          </>
        )}
      </p>

      {advertencias.length > 0 && (
        <ul className="space-y-2">
          {advertencias.map((advertencia, indice) => (
            <li
              key={`${advertencia.tipo}-${indice}`}
              className={
                advertencia.gravedad === "alta"
                  ? "rounded border border-red-600 p-3 text-sm text-red-800 dark:text-red-300"
                  : "rounded border border-amber-600 p-3 text-sm text-amber-900 dark:text-amber-200"
              }
            >
              {advertencia.texto}
            </li>
          ))}
        </ul>
      )}

      <TablaSemanas plan={plan} denominaciones={denominaciones} />

      <section aria-labelledby="titulo-explicacion-guardada">
        <h3 id="titulo-explicacion-guardada" className="font-semibold">
          Qué significa este plan
        </h3>
        {guardado.explicacion === null ? (
          <p className="mt-2 rounded border border-zinc-400 p-3 text-sm dark:border-zinc-600">
            Este plan se guardó sin explicación.
          </p>
        ) : (
          conDenominaciones(guardado.explicacion, plan, denominaciones)
            .split("\n\n")
            .map((parrafo, indice) => (
              <p key={indice} className="mt-2 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
                {parrafo}
              </p>
            ))
        )}
      </section>
    </section>
  );
}

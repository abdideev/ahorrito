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
      <p
        role="alert"
        className="rounded-xl border border-error bg-error/6 p-4 text-sm font-semibold text-error"
      >
        {error}
      </p>
    );
  }

  if (resumenes === null) {
    return <p className="text-texto-suave">Cargando tus planes…</p>;
  }

  if (resumenes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-borde bg-superficie p-5 text-texto-suave">
        Todavía no has generado ningún plan.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <ul className="space-y-4">
        {resumenes.map((resumen) => (
          <li
            key={resumen.id}
            className="elevado flex flex-wrap items-center justify-between gap-4 p-5"
          >
            <div>
              <p className="font-bold text-texto">
                {new Date(resumen.generadoEn).toLocaleString("es-MX", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
              <p className="mt-1 text-sm leading-6 text-texto-suave">
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
              className="boton-secundario text-sm"
            >
              {cargandoDetalle === resumen.id ? "Abriendo…" : "Ver el plan"}
            </button>
          </li>
        ))}
      </ul>

      {error !== null && (
        <p
          role="alert"
          className="rounded-xl border border-error bg-error/6 p-4 text-sm font-semibold text-error"
        >
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
    <section aria-label="Plan guardado" className="superficie space-y-6 p-5 sm:p-7">
      <Descargo />

      <p className="text-lg leading-8 text-texto">
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
        <ul className="space-y-3">
          {advertencias.map((advertencia, indice) => (
            <li
              key={`${advertencia.tipo}-${indice}`}
              className={`flex items-start gap-3 rounded-xl border border-borde border-l-4 bg-fondo p-4 text-sm leading-6 text-texto ${
                advertencia.gravedad === "alta" ? "border-l-error" : "border-l-alerta"
              }`}
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-black ${
                  advertencia.gravedad === "alta"
                    ? "border-error text-error"
                    : "border-alerta text-alerta"
                }`}
              >
                !
              </span>
              <span>{advertencia.texto}</span>
            </li>
          ))}
        </ul>
      )}

      <TablaSemanas plan={plan} denominaciones={denominaciones} />

      <section aria-labelledby="titulo-explicacion-guardada" className="border-t border-borde pt-6">
        <h3 id="titulo-explicacion-guardada" className="text-lg font-bold text-texto">
          Qué significa este plan
        </h3>
        {guardado.explicacion === null ? (
          <p className="mt-3 rounded-xl border border-borde bg-fondo p-4 text-sm">
            Este plan se guardó sin explicación.
          </p>
        ) : (
          conDenominaciones(guardado.explicacion, plan, denominaciones)
            .split("\n\n")
            .map((parrafo, indice) => (
              <p key={indice} className="mt-3 whitespace-pre-line leading-7 text-texto">
                {parrafo}
              </p>
            ))
        )}
      </section>
    </section>
  );
}

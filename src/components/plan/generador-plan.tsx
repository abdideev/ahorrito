"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Descargo } from "@/components/plan/descargo";
import { TablaSemanas } from "@/components/plan/tabla-semanas";
import type { Plan } from "@/core/tipos";
import { describirAdvertencias, type Denominaciones } from "@/lib/plan/advertencias";
import { conDenominaciones } from "@/lib/plan/etiquetas";
import { leerFlujo, mensajeDeError } from "@/lib/plan/flujo";
import { formatearPesos } from "@/lib/dinero";

interface Props {
  denominaciones: Denominaciones;
  /** Falta el presupuesto o los compromisos: no hay nada que calcular (regla de negocio 6). */
  faltanDatos: boolean;
}

type EstadoExplicacion = "sin-pedir" | "esperando" | "lista" | "no-disponible";

/**
 * Generación y presentación del plan (RF-07, RF-08, RF-11, RNF-01, RNF-03).
 *
 * Consume el flujo NDJSON de `POST /api/planes`: pinta el plan en cuanto llega la
 * primera línea y deja la explicación para la segunda. Esa es la razón de que la vista
 * sea de cliente: el plan debe aparecer sin esperar al modelo de lenguaje.
 */
export function GeneradorPlan({ denominaciones, faltanDatos }: Props) {
  const router = useRouter();
  const resultado = useRef<HTMLElement>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [explicacion, setExplicacion] = useState<string | null>(null);
  const [estadoExplicacion, setEstadoExplicacion] = useState<EstadoExplicacion>("sin-pedir");
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CA-07 exige que el descargo se vea sin desplazamiento en la pantalla del plan. Como
  // el panel reúne captura y resultado, al llegar un plan nuevo se lleva el foco a su
  // sección: el descargo queda arriba de todo lo demás y el lector de pantalla anuncia
  // dónde quedó el usuario. Se hace en un efecto y no al recibir la línea, porque la
  // sección todavía no está montada en ese momento.
  useEffect(() => {
    if (plan !== null) {
      resultado.current?.focus();
    }
  }, [plan]);

  /**
   * RF-13: al recalcular se rehacen las cifras y **no** se pide la explicación, salvo
   * que el usuario lo pida de forma expresa. Es la resolución del conflicto 4 de la
   * sección 2.9: explicar cada recálculo multiplicaría las llamadas al modelo y
   * agotaría antes la cuota gratuita (RSG-01).
   */
  async function generar(explicar: boolean) {
    setGenerando(true);
    setError(null);
    setExplicacion(null);
    setEstadoExplicacion(explicar ? "esperando" : "sin-pedir");

    let planRecibido: Plan | null = null;

    try {
      const respuesta = await fetch("/api/planes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ explicar }),
      });
      if (!respuesta.ok) {
        setError(mensajeDeError(respuesta.status));
        setEstadoExplicacion("sin-pedir");
        return;
      }
      for await (const linea of leerFlujo(respuesta)) {
        if (linea.tipo === "plan") {
          planRecibido = linea.plan;
          setPlan(linea.plan);
          // El plan ya está en pantalla; la explicación sigue en camino (RNF-01).
          setGenerando(false);
          // Ya existe un plan: el servidor puede revelar la captura opcional, que la
          // regla de negocio 6 pide mostrar después del primer plan.
          router.refresh();
        } else {
          // El modelo escribe "Compromiso 1" porque nunca conoció las denominaciones
          // (RNF-10). Aquí se deshace la sustitución con el mismo etiquetado.
          setExplicacion(
            linea.explicacion === null || planRecibido === null
              ? linea.explicacion
              : conDenominaciones(linea.explicacion, planRecibido, denominaciones),
          );
          setEstadoExplicacion(linea.explicacion === null ? "no-disponible" : "lista");
        }
      }
    } catch {
      // Falla de red o conexión interrumpida: el mensaje no describe el detalle técnico.
      setError("Se interrumpió la conexión. Intenta de nuevo.");
      setEstadoExplicacion("sin-pedir");
    } finally {
      setGenerando(false);
    }
  }

  const advertencias = plan === null ? [] : describirAdvertencias(plan.advertencias, denominaciones);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => generar(plan === null)}
          disabled={generando || faltanDatos}
          className="rounded bg-zinc-900 px-5 py-2.5 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {generando ? "Calculando…" : plan === null ? "Generar mi plan" : "Recalcular con mis datos"}
        </button>

        {plan !== null && (
          <button
            type="button"
            onClick={() => generar(true)}
            disabled={generando}
            className="rounded border border-zinc-400 px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-60 dark:border-zinc-600"
          >
            Recalcular y explicar
          </button>
        )}
      </div>
      {faltanDatos && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Captura tu presupuesto y al menos un pago para generar el plan.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded border border-red-600 p-3 text-sm text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {plan !== null && (
        <section
          ref={resultado}
          tabIndex={-1}
          aria-live="polite"
          className="mt-6 scroll-mt-4 space-y-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
        >
          <h3 className="sr-only">Resultado de tu plan</h3>
          <Descargo />

          <p className="text-zinc-700 dark:text-zinc-300">
            Plan del <strong>{plan.inicioHorizonte}</strong> al <strong>{plan.finHorizonte}</strong>,{" "}
            {plan.asignaciones.length} semanas.
            {plan.evaluacionMeta !== null && (
              <>
                {" "}
                Tu meta de {formatearPesos(plan.evaluacionMeta.montoObjetivo)}{" "}
                {plan.evaluacionMeta.viable ? (
                  <strong>sí es alcanzable</strong>
                ) : (
                  <>
                    <strong>no se alcanza</strong>: faltan{" "}
                    {formatearPesos(plan.evaluacionMeta.faltante)}
                  </>
                )}
                .
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

          <section aria-labelledby="titulo-explicacion">
            <h3 id="titulo-explicacion" className="font-semibold">
              Qué significa tu plan
            </h3>
            <div aria-live="polite" className="mt-2 text-zinc-700 dark:text-zinc-300">
              {estadoExplicacion === "sin-pedir" && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Este plan se recalculó sin pedir explicación. Usa &quot;Recalcular y explicar&quot;
                  si quieres el texto que la acompaña.
                </p>
              )}
              {estadoExplicacion === "esperando" && <p>Preparando la explicación…</p>}
              {estadoExplicacion === "no-disponible" && (
                <p className="rounded border border-zinc-400 p-3 text-sm dark:border-zinc-600">
                  La explicación no está disponible en este momento. Tu plan y sus cifras están
                  completos: solo falta el texto que los acompaña.
                </p>
              )}
              {estadoExplicacion === "lista" &&
                explicacion
                  ?.split("\n\n")
                  .map((parrafo, indice) => (
                    <p key={indice} className="mt-2 whitespace-pre-line">
                      {parrafo}
                    </p>
                  ))}
            </div>
          </section>
        </section>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DialogoCreditos } from "@/components/creditos/dialogo-creditos";
import { Descargo } from "@/components/plan/descargo";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { TablaSemanas } from "@/components/plan/tabla-semanas";
import type { Plan } from "@/core/tipos";
import { describirAdvertencias, type Denominaciones } from "@/lib/plan/advertencias";
import { conDenominaciones } from "@/lib/plan/etiquetas";
import { leerFlujo, mensajeDeError } from "@/lib/plan/flujo";
import { formatearPesos } from "@/lib/dinero";
import {
  crearAlcancia,
  depositarMoneda,
  esCuadrePerfecto,
  type EstadoAlcancia,
} from "@/lib/huevo/secuencia";

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
  // SC-02 (RF-14): la alcancía solo existe mientras el plan mostrado cuadra al centavo.
  const [alcancia, setAlcancia] = useState<EstadoAlcancia | null>(null);
  const [creditosAbiertos, setCreditosAbiertos] = useState(false);

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
  /** SC-02: deposita la moneda de una semana; fuera de orden, la alcancía se reinicia. */
  function depositar(numeroSemana: number) {
    if (alcancia === null) {
      return;
    }
    const { estado, resultado } = depositarMoneda(alcancia, numeroSemana);
    if (resultado === "completa") {
      setAlcancia(crearAlcancia(estado.totalSemanas));
      setCreditosAbiertos(true);
    } else {
      setAlcancia(estado);
    }
  }

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
          setAlcancia(
            esCuadrePerfecto(linea.plan) ? crearAlcancia(linea.plan.asignaciones.length) : null,
          );
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
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <InteractiveHoverButton
          type="button"
          onClick={() => generar(plan === null)}
          disabled={generando || faltanDatos}
        >
          {generando ? "Calculando…" : plan === null ? "Generar mi plan" : "Recalcular con mis datos"}
        </InteractiveHoverButton>

        {plan !== null && (
          <button
            type="button"
            onClick={() => generar(true)}
            disabled={generando}
            className="boton-secundario text-sm"
          >
            Recalcular y explicar
          </button>
        )}
      </div>
      {faltanDatos && (
        <p className="mt-3 text-sm text-texto-suave">
          Captura tu presupuesto y al menos un pago para generar el plan.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-error bg-error/6 p-4 text-sm font-semibold text-error"
        >
          {error}
        </p>
      )}

      {plan !== null && (
        <section
          ref={resultado}
          tabIndex={-1}
          aria-live="polite"
          className="superficie mt-8 scroll-mt-4 space-y-6 p-5 sm:p-7"
        >
          <h3 className="sr-only">Resultado de tu plan</h3>
          <Descargo />

          <p className="text-lg leading-8 text-texto">
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

          <TablaSemanas
            plan={plan}
            denominaciones={denominaciones}
            alcancia={alcancia}
            alDepositar={depositar}
          />

          <section aria-labelledby="titulo-explicacion" className="border-t border-borde pt-6">
            <h3 id="titulo-explicacion" className="text-lg font-bold text-texto">
              Qué significa tu plan
            </h3>
            <div aria-live="polite" className="mt-3 leading-7 text-texto">
              {estadoExplicacion === "sin-pedir" && (
                <p className="text-sm text-texto-suave">
                  Este plan se recalculó sin pedir explicación. Usa &quot;Recalcular y explicar&quot;
                  si quieres el texto que la acompaña.
                </p>
              )}
              {estadoExplicacion === "esperando" && (
                <p>
                  <AnimatedShinyText>Preparando la explicación…</AnimatedShinyText>
                </p>
              )}
              {estadoExplicacion === "no-disponible" && (
                <p className="rounded-xl border border-borde bg-fondo p-4 text-sm">
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

      <DialogoCreditos abierto={creditosAbiertos} onCerrar={() => setCreditosAbiertos(false)} />
    </div>
  );
}

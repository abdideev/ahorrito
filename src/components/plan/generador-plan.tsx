"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DialogoCreditos } from "@/components/creditos/dialogo-creditos";
import { enfocarAlInicio } from "@/components/plan/enfocar";
import { VistaPlan } from "@/components/plan/vista-plan";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Aparecer } from "@/components/ui/movimiento";
import { IconoDestello, IconoHistorial } from "@/components/ui/iconos";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import type { Plan } from "@/core/tipos";
import type { Denominaciones } from "@/lib/plan/advertencias";
import { conDenominaciones } from "@/lib/plan/etiquetas";
import { leerFlujo, mensajeDeError } from "@/lib/plan/flujo";
import {
  crearAlcancia,
  depositarMoneda,
  esCuadrePerfecto,
  hayCuadreParcial,
  type EstadoAlcancia,
} from "@/lib/huevo/secuencia";

interface Props {
  denominaciones: Denominaciones;
  /** Falta el presupuesto o los compromisos: no hay nada que calcular (regla de negocio 6). */
  faltanDatos: boolean;
  /** Planes guardados hasta la carga de la página, para el enlace al historial (RF-12). */
  cantidadPlanes: number;
}

type EstadoExplicacion = "sin-pedir" | "esperando" | "lista" | "no-disponible";

/**
 * Generación y presentación del plan (RF-07, RF-08, RF-11, RNF-01, RNF-03).
 *
 * Consume el flujo NDJSON de `POST /api/planes`: pinta el plan en cuanto llega la
 * primera línea y deja la explicación para la segunda. Esa es la razón de que la vista
 * sea de cliente: el plan debe aparecer sin esperar al modelo de lenguaje.
 *
 * Devuelve celdas de la cuadrícula Bento del panel: la tarjeta de control y, cuando hay
 * plan, la sección de resultado con sus propias celdas.
 */
export function GeneradorPlan({ denominaciones, faltanDatos, cantidadPlanes }: Props) {
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
      enfocarAlInicio(resultado.current);
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

  return (
    <>
      <Aparecer como="section" indice={3} aria-labelledby="titulo-plan" className="tarjeta p-6 sm:p-8 md:col-span-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="titulo-plan" className="flex items-center gap-3 text-xl font-bold text-texto">
              <span className="paso">3</span>
              Tu plan semanal
            </h2>
            <p className="mt-2 max-w-xl leading-7 text-texto-suave">
              Ahorrito reparte tu presupuesto para que cada pago llegue a tiempo.
            </p>
            {faltanDatos && (
              <p className="mt-2 text-sm font-semibold text-texto">
                Captura tu presupuesto y al menos un pago para generar el plan.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <InteractiveHoverButton
              type="button"
              onClick={() => generar(plan === null)}
              disabled={generando || faltanDatos}
              className="px-6 text-base"
            >
              {generando ? "Calculando…" : plan === null ? "Generar mi plan" : "Recalcular con mis datos"}
            </InteractiveHoverButton>

            {plan !== null && (
              <button
                type="button"
                onClick={() => generar(true)}
                disabled={generando}
                className="boton-secundario"
              >
                <IconoDestello />
                Recalcular y explicar
              </button>
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-error/40 bg-error-suave p-4 text-sm font-semibold text-error">
            {error}
          </p>
        )}

        {cantidadPlanes > 0 && (
          <p className="mt-5 border-t border-borde pt-4 text-sm">
            <Link
              href="/planes"
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-texto underline underline-offset-4"
            >
              <IconoHistorial className="size-4" />
              Ver mis {cantidadPlanes === 1 ? "plan guardado" : `${cantidadPlanes} planes guardados`}
            </Link>
          </p>
        )}
      </Aparecer>

      {plan !== null && (
        <section
          ref={resultado}
          tabIndex={-1}
          aria-live="polite"
          aria-label="Resultado de tu plan"
          className="bento scroll-mt-4 rounded-3xl md:col-span-6"
        >
          <VistaPlan
            plan={plan}
            denominaciones={denominaciones}
            alcancia={alcancia}
            alDepositar={depositar}
            explicacionGenerada={estadoExplicacion === "lista"}
            pista={
              hayCuadreParcial(plan)
                ? "Algunas semanas cierran justo en $0.00. ¿Qué pasaría si todas lo hicieran?"
                : undefined
            }
            explicacion={
              <>
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
                  <p className="rounded-xl border border-borde bg-superficie-hundida p-4 text-sm">
                    La explicación no está disponible en este momento. Tu plan y sus cifras están
                    completos: solo falta el texto que los acompaña.
                  </p>
                )}
                {estadoExplicacion === "lista" &&
                  explicacion
                    ?.split("\n\n")
                    .map((parrafo, indice) => (
                      <p key={indice} className="mt-2 whitespace-pre-line first:mt-0">
                        {parrafo}
                      </p>
                    ))}
              </>
            }
          />
        </section>
      )}

      <DialogoCreditos abierto={creditosAbiertos} onCerrar={() => setCreditosAbiertos(false)} />
    </>
  );
}

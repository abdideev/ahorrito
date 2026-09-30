"use client";

/**
 * SC-02 (RF-14). Plan de créditos: la recompensa del huevo de Pascua «Cuadre perfecto».
 *
 * Presenta los créditos con el mismo lenguaje visual del plan semanal: cada fila es un
 * rol del proyecto con sus horas documentadas, y el total cuadra con la estimación de
 * la sección 1.8.5.
 *
 * Accesibilidad (RNF-11): <dialog> nativo abierto con showModal, que confina el foco,
 * se cierra con Esc y devuelve el foco al elemento que lo abrió. El confeti se omite si
 * el sistema pide reducir el movimiento.
 */

import { useEffect, useRef } from "react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";
import { CREDITOS, HORAS_ESTIMADAS, ROLES, totalHoras } from "@/lib/huevo/creditos";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

const OPCIONES_GLOBALES = { resize: true, useWorker: true, disableForReducedMotion: true };

export function DialogoCreditos({ abierto, onCerrar }: Props) {
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const confetiRef = useRef<ConfettiRef>(null);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (dialogo === null) {
      return;
    }
    if (abierto && !dialogo.open) {
      dialogo.showModal();
      // Dos cañones laterales. El lienzo vive dentro del diálogo: un modal se pinta en
      // la capa superior del navegador y taparía cualquier lienzo externo.
      void confetiRef.current?.fire({ particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } });
      void confetiRef.current?.fire({ particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } });
    } else if (!abierto && dialogo.open) {
      dialogo.close();
    }
  }, [abierto]);

  const celda = "px-3 py-2.5";
  const horas = totalHoras(ROLES);

  return (
    <dialog
      ref={dialogoRef}
      onClose={onCerrar}
      aria-labelledby="titulo-creditos"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-borde bg-fondo p-4 text-texto shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm sm:p-6"
    >
      <Confetti
        ref={confetiRef}
        manualstart
        globalOptions={OPCIONES_GLOBALES}
        className="pointer-events-none fixed inset-0 z-10 size-full"
        aria-hidden="true"
      />

      <div className="grid gap-3 sm:grid-cols-6">
        <header className="tarjeta p-5 sm:col-span-6">
          <p className="chip chip-exito">
            <AnimatedShinyText unaVez>Cuadre perfecto: cada centavo encontró su lugar.</AnimatedShinyText>
          </p>
          <h2 id="titulo-creditos" className="mt-3 text-2xl font-extrabold tracking-tight">
            Plan de créditos · {CREDITOS.proyecto}
          </h2>
        </header>

        <div className="tarjeta overflow-hidden sm:col-span-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-xl border-collapse text-sm">
              <thead>
                <tr className="border-b border-borde bg-superficie-hundida text-left text-xs tracking-wide text-texto-suave uppercase">
                  <th className={celda}>Semana</th>
                  <th className={celda}>Rol</th>
                  <th className={celda}>Aportación</th>
                  <th className={`${celda} text-right`}>Horas</th>
                </tr>
              </thead>
              <tbody>
                {ROLES.map((rol, indice) => (
                  <tr key={rol.rol} className="border-b border-borde">
                    <td className={celda}>{indice + 1}</td>
                    <td className={celda}>
                      <span className="font-semibold">{rol.rol}</span>
                      <span className="block text-texto-suave">{rol.responsable}</span>
                    </td>
                    <td className={celda}>{rol.aportacion}</td>
                    <td className={`${celda} text-right tabular-nums`}>{rol.horas}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td className={celda} colSpan={3}>
                    Total apartado
                  </td>
                  <td className={`${celda} text-right tabular-nums`}>{horas} h</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="tarjeta-invertida p-5 sm:col-span-3">
          <p className="text-sm opacity-80">Meta de ahorro</p>
          <p className="mt-1 text-2xl font-extrabold">
            {horas === HORAS_ESTIMADAS ? "Alcanzable" : "En revisión"}
          </p>
          <p className="mt-1 text-sm opacity-80">Entrega el {CREDITOS.entrega}.</p>
        </div>

        <div className="tarjeta p-5 sm:col-span-3">
          <p className="rotulo">Asignatura</p>
          <p className="mt-1 font-semibold">
            {CREDITOS.asignatura} · grupo {CREDITOS.grupo}
          </p>
          <p className="mt-1 text-sm text-texto-suave">{CREDITOS.norma}</p>
        </div>

        <dl className="tarjeta grid gap-x-4 gap-y-2 p-5 text-sm sm:col-span-6 sm:grid-cols-[auto_1fr]">
          <dt className="font-semibold">Cliente</dt>
          <dd className="text-texto-suave">{CREDITOS.cliente}</dd>
          <dt className="font-semibold">Docente</dt>
          <dd className="text-texto-suave">{CREDITOS.docente}</dd>
          <dt className="font-semibold">Validación</dt>
          <dd className="text-texto-suave">{CREDITOS.evaluadores}</dd>
          <dt className="font-semibold">Institución</dt>
          <dd className="text-texto-suave">{CREDITOS.institucion}</dd>
          <dt className="font-semibold">Tecnologías</dt>
          <dd className="text-texto-suave">{CREDITOS.tecnologias.join(" · ")}</dd>
          <dt className="font-semibold">Asistencia de desarrollo</dt>
          <dd className="text-texto-suave">{CREDITOS.asistencia}</dd>
          <dt className="font-semibold">Componentes</dt>
          <dd className="text-texto-suave">{CREDITOS.componentes}</dd>
        </dl>
      </div>

      <button type="button" autoFocus onClick={onCerrar} className="boton-invertido mt-4 w-full">
        Cerrar
      </button>
    </dialog>
  );
}

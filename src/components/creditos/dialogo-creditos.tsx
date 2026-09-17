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

  const celda = "py-2 pr-3";

  return (
    <dialog
      ref={dialogoRef}
      onClose={onCerrar}
      aria-labelledby="titulo-creditos"
      className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-lg bg-white p-6 text-zinc-900 shadow-xl backdrop:bg-black/60 dark:bg-zinc-900 dark:text-zinc-100"
    >
      <Confetti
        ref={confetiRef}
        manualstart
        globalOptions={OPCIONES_GLOBALES}
        className="pointer-events-none fixed inset-0 z-10 size-full"
        aria-hidden="true"
      />

      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
        Cuadre perfecto: cada centavo encontró su lugar.
      </p>
      <h2 id="titulo-creditos" className="mt-1 text-2xl font-semibold">
        Plan de créditos · {CREDITOS.proyecto}
      </h2>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-400 text-left dark:border-zinc-600">
              <th className={celda}>Semana</th>
              <th className={celda}>Rol</th>
              <th className={celda}>Aportación</th>
              <th className={`${celda} text-right`}>Horas</th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map((rol, indice) => (
              <tr key={rol.rol} className="border-b border-zinc-200 dark:border-zinc-800">
                <td className={celda}>{indice + 1}</td>
                <td className={celda}>
                  <span className="font-medium">{rol.rol}</span>
                  <span className="block text-zinc-600 dark:text-zinc-400">{rol.responsable}</span>
                </td>
                <td className={celda}>{rol.aportacion}</td>
                <td className={`${celda} text-right tabular-nums`}>{rol.horas}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className={celda} colSpan={3}>
                Total apartado
              </td>
              <td className={`${celda} text-right tabular-nums`}>{totalHoras(ROLES)} h</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-4">
        <strong>Meta de ahorro:</strong>{" "}
        {totalHoras(ROLES) === HORAS_ESTIMADAS ? "alcanzable" : "en revisión"}. Entrega el{" "}
        {CREDITOS.entrega}.
      </p>

      <dl className="mt-4 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
        <dt className="font-medium">Cliente</dt>
        <dd>{CREDITOS.cliente}</dd>
        <dt className="font-medium">Docente</dt>
        <dd>{CREDITOS.docente}</dd>
        <dt className="font-medium">Validación</dt>
        <dd>{CREDITOS.evaluadores}</dd>
        <dt className="font-medium">Asignatura</dt>
        <dd>
          {CREDITOS.asignatura} · grupo {CREDITOS.grupo}
        </dd>
        <dt className="font-medium">Institución</dt>
        <dd>{CREDITOS.institucion}</dd>
        <dt className="font-medium">Norma</dt>
        <dd>{CREDITOS.norma}</dd>
        <dt className="font-medium">Tecnologías</dt>
        <dd>{CREDITOS.tecnologias.join(" · ")}</dd>
        <dt className="font-medium">Asistencia de desarrollo</dt>
        <dd>{CREDITOS.asistencia}</dd>
        <dt className="font-medium">Componentes</dt>
        <dd>{CREDITOS.componentes}</dd>
      </dl>

      <button
        type="button"
        autoFocus
        onClick={onCerrar}
        className="mt-6 rounded bg-zinc-900 px-5 py-2.5 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Cerrar
      </button>
    </dialog>
  );
}

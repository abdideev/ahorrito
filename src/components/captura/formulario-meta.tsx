"use client";

import { useActionState, useId } from "react";
import { CampoCaptura, describedBy } from "@/components/captura/campo-captura";
import { campo, mensaje as claseMensaje } from "@/components/captura/estilos";
import { ESTADO_CAPTURA_INICIAL, type EstadoCaptura } from "@/lib/captura/estado";

interface Props {
  accion: (estado: EstadoCaptura, formulario: FormData) => Promise<EstadoCaptura>;
  /** Acción sin estado: quitar la meta no puede fallar de forma que el usuario deba corregir. */
  quitar: () => Promise<void>;
  montoObjetivo: string;
  fechaObjetivo: string;
  /** Fecha mínima seleccionable, calculada en el servidor (I-01: posterior a hoy). */
  fechaMinima: string;
}

/**
 * Meta de ahorro (RF-06). Es opcional: un plan sin meta es un estado válido y el motor
 * lo refleja con `evaluacionMeta` nula.
 */
export function FormularioMeta({ accion, quitar, montoObjetivo, fechaObjetivo, fechaMinima }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, ESTADO_CAPTURA_INICIAL);
  const prefijo = useId();
  const idMonto = `${prefijo}-montoObjetivo`;
  const idFecha = `${prefijo}-fechaObjetivo`;
  const hayMeta = montoObjetivo !== "";

  return (
    <div className="mt-4 space-y-3">
      <form action={enviar} noValidate className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <CampoCaptura
            idCampo={idMonto}
            etiqueta="¿Cuánto quieres ahorrar?"
            mensajeError={estado.errores.montoObjetivo}
          >
            <input
              id={idMonto}
              name="montoObjetivo"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              required
              defaultValue={estado.valores.montoObjetivo ?? montoObjetivo}
              aria-invalid={Boolean(estado.errores.montoObjetivo)}
              aria-describedby={describedBy(idMonto, { error: Boolean(estado.errores.montoObjetivo) })}
              className={campo}
            />
          </CampoCaptura>

          <CampoCaptura
            idCampo={idFecha}
            etiqueta="¿Para cuándo?"
            mensajeError={estado.errores.fechaObjetivo}
          >
            <input
              id={idFecha}
              name="fechaObjetivo"
              type="date"
              min={fechaMinima}
              required
              defaultValue={estado.valores.fechaObjetivo ?? fechaObjetivo}
              aria-invalid={Boolean(estado.errores.fechaObjetivo)}
              aria-describedby={describedBy(idFecha, { error: Boolean(estado.errores.fechaObjetivo) })}
              className={campo}
            />
          </CampoCaptura>
        </div>

        {estado.mensaje && (
          <p role={estado.tipo === "error" ? "alert" : "status"} className={claseMensaje(estado.tipo)}>
            {estado.mensaje}
          </p>
        )}

        <button
          type="submit"
          disabled={pendiente}
          className="rounded border border-zinc-400 px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-60 dark:border-zinc-600"
        >
          {pendiente ? "Guardando…" : hayMeta ? "Actualizar meta" : "Guardar meta"}
        </button>
      </form>

      {hayMeta && (
        <form action={quitar}>
          <button
            type="submit"
            className="rounded px-2 py-1 text-sm underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            Quitar la meta de ahorro
          </button>
        </form>
      )}
    </div>
  );
}

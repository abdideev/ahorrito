"use client";

import { useActionState, useId } from "react";
import { CampoCaptura, describedBy } from "@/components/captura/campo-captura";
import { botonGuardar, botonSecundario, campo, mensaje as claseMensaje, campoPesos, prefijoPesos } from "@/components/captura/estilos";
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
    <div className="mt-6 space-y-4">
      <form action={enviar} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <CampoCaptura
            idCampo={idMonto}
            etiqueta="¿Cuánto quieres ahorrar?"
            mensajeError={estado.errores.montoObjetivo}
          >
            <div className="relative">
              <span aria-hidden="true" className={prefijoPesos}>
                $
              </span>
              <input
                id={idMonto}
                name="montoObjetivo"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                required
                defaultValue={estado.valores.montoObjetivo ?? montoObjetivo}
                aria-invalid={Boolean(estado.errores.montoObjetivo)}
                aria-describedby={describedBy(idMonto, { error: Boolean(estado.errores.montoObjetivo) })}
                className={campoPesos}
              />
            </div>
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
          className={botonGuardar}
        >
          {pendiente ? "Guardando…" : hayMeta ? "Actualizar meta" : "Guardar meta"}
        </button>
      </form>

      {hayMeta && (
        <form action={quitar}>
          <button
            type="submit"
            className={`${botonSecundario} px-4 py-2 text-sm hover:border-error hover:text-error`}
          >
            Quitar la meta de ahorro
          </button>
        </form>
      )}
    </div>
  );
}

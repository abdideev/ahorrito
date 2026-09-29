"use client";

import { useActionState, useId } from "react";
import { BotonEliminar } from "@/components/captura/boton-eliminar";
import { CampoCaptura, describedBy } from "@/components/captura/campo-captura";
import { campo, mensaje as claseMensaje } from "@/components/captura/estilos";
import { ESTADO_CAPTURA_INICIAL, type EstadoCaptura } from "@/lib/captura/estado";
import { formatearPesos } from "@/lib/dinero";
import type { IngresoExtra } from "@/core/tipos";

type Accion = (estado: EstadoCaptura, formulario: FormData) => Promise<EstadoCaptura>;

interface Props {
  ingresos: readonly IngresoExtra[];
  agregar: Accion;
  eliminar: Accion;
}

/**
 * Ingresos extraordinarios (RF-05). Son opcionales: la regla de negocio 6 solo exige el
 * presupuesto y un compromiso, y este dato se pide después del primer plan.
 */
export function SeccionIngresos({ ingresos, agregar, eliminar }: Props) {
  const [estado, enviar, pendiente] = useActionState(agregar, ESTADO_CAPTURA_INICIAL);
  const prefijo = useId();
  const idMonto = `${prefijo}-monto`;
  const idFecha = `${prefijo}-fecha`;

  return (
    <div className="mt-4">
      {ingresos.length > 0 && (
        <ul className="mb-4 space-y-2">
          {ingresos.map((ingreso) => (
            <li
              key={ingreso.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-300 px-4 py-3 dark:border-zinc-700"
            >
              <span>
                {formatearPesos(ingreso.monto)}
                <span className="text-zinc-600 dark:text-zinc-400"> · {ingreso.fecha}</span>
              </span>
              <BotonEliminar
                accion={eliminar}
                id={ingreso.id}
                descripcion={`el ingreso de ${formatearPesos(ingreso.monto)}`}
              />
            </li>
          ))}
        </ul>
      )}

      <form action={enviar} noValidate className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <CampoCaptura idCampo={idMonto} etiqueta="¿De cuánto?" mensajeError={estado.errores.monto}>
            <input
              id={idMonto}
              name="monto"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              required
              defaultValue={estado.valores.monto ?? ""}
              aria-invalid={Boolean(estado.errores.monto)}
              aria-describedby={describedBy(idMonto, { error: Boolean(estado.errores.monto) })}
              className={campo}
            />
          </CampoCaptura>

          <CampoCaptura idCampo={idFecha} etiqueta="¿Qué día lo recibes?" mensajeError={estado.errores.fecha}>
            <input
              id={idFecha}
              name="fecha"
              type="date"
              required
              defaultValue={estado.valores.fecha ?? ""}
              aria-invalid={Boolean(estado.errores.fecha)}
              aria-describedby={describedBy(idFecha, { error: Boolean(estado.errores.fecha) })}
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
          {pendiente ? "Guardando…" : "Agregar ingreso"}
        </button>
      </form>
    </div>
  );
}

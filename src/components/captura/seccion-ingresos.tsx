"use client";

import { useActionState, useId } from "react";
import { BotonEliminar } from "@/components/captura/boton-eliminar";
import { CampoCaptura, describedBy } from "@/components/captura/campo-captura";
import { botonGuardar, campo, mensaje as claseMensaje, campoPesos, prefijoPesos } from "@/components/captura/estilos";
import { ESTADO_CAPTURA_INICIAL, type EstadoCaptura } from "@/lib/captura/estado";
import { formatearPesos } from "@/lib/dinero";
import { formatearFechaLarga } from "@/lib/fecha";
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
    <div className="mt-6">
      {ingresos.length > 0 && (
        <ul className="mb-4 space-y-2">
          {ingresos.map((ingreso) => (
            <li
              key={ingreso.id}
              className="elevado flex flex-wrap items-center justify-between gap-3 px-4 py-2"
            >
              <span>
                <span className="font-bold tabular-nums">{formatearPesos(ingreso.monto)}</span>
                <span className="text-texto-suave"> · {formatearFechaLarga(ingreso.fecha)}</span>
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

      <form action={enviar} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <CampoCaptura idCampo={idMonto} etiqueta="¿De cuánto?" mensajeError={estado.errores.monto}>
            <div className="relative">
              <span aria-hidden="true" className={prefijoPesos}>
                $
              </span>
              <input
                id={idMonto}
                name="monto"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                required
                defaultValue={estado.valores.monto ?? ""}
                aria-invalid={Boolean(estado.errores.monto)}
                aria-describedby={describedBy(idMonto, { error: Boolean(estado.errores.monto) })}
                className={campoPesos}
              />
            </div>
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
          className={botonGuardar}
        >
          {pendiente ? "Guardando…" : "Agregar ingreso"}
        </button>
      </form>
    </div>
  );
}

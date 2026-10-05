"use client";

import { useActionState } from "react";
import { DIAS_SEMANA } from "@/lib/captura/dias";
import { ESTADO_CAPTURA_INICIAL, type EstadoCaptura } from "@/lib/captura/estado";
import {
  ayuda as claseAyuda,
  botonGuardar,
  campo,
  error as claseError,
  etiqueta,
  mensaje as claseMensaje,
  campoPesos,
  prefijoPesos,
} from "@/components/captura/estilos";

interface Props {
  accion: (estado: EstadoCaptura, formulario: FormData) => Promise<EstadoCaptura>;
  /** Valores guardados, ya formateados; vacíos la primera vez (RF-02). */
  montoSemanal: string;
  diaInicioSemana: number;
}

/**
 * Captura del presupuesto semanal (RF-02).
 *
 * Accesibilidad (RNF-11): cada control tiene etiqueta, los errores se asocian con
 * `aria-describedby` y `aria-invalid`, y el resultado se anuncia con `role="alert"` o
 * `role="status"`. `noValidate` deja la validación al servidor, de modo que los mensajes
 * sean los mismos con JavaScript y sin él.
 *
 * El campo del monto usa `inputMode="decimal"` en lugar de `type="number"`: este último
 * permite la rueda del ratón y las flechas, que cambian una cantidad de dinero sin que
 * el usuario lo note.
 */
export function FormularioPresupuesto({ accion, montoSemanal, diaInicioSemana }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, ESTADO_CAPTURA_INICIAL);

  const valorMonto = estado.valores.montoSemanal ?? montoSemanal;
  const valorDia = estado.valores.diaInicioSemana ?? String(diaInicioSemana);
  const errorMonto = estado.errores.montoSemanal;
  const errorDia = estado.errores.diaInicioSemana;

  return (
    <form action={enviar} noValidate className="space-y-5">
      <div className="grid gap-5">
        <div>
          <label htmlFor="montoSemanal" className={etiqueta}>
            ¿Cuánto dinero recibes cada semana?
          </label>
          <div className="relative">
            <span aria-hidden="true" className={prefijoPesos}>
              $
            </span>
            <input
              id="montoSemanal"
              name="montoSemanal"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="1200.00"
              required
              defaultValue={valorMonto}
              aria-invalid={Boolean(errorMonto)}
              aria-describedby={["ayuda-monto", errorMonto ? "error-monto" : null].filter(Boolean).join(" ")}
              className={campoPesos}
            />
          </div>
          <p id="ayuda-monto" className={claseAyuda}>
            En pesos, con hasta dos decimales. Por ejemplo, 1200.50
          </p>
          {errorMonto && (
            <p id="error-monto" className={claseError}>
              {errorMonto}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="diaInicioSemana" className={etiqueta}>
            ¿Qué día inicia tu semana?
          </label>
          <select
            id="diaInicioSemana"
            name="diaInicioSemana"
            defaultValue={valorDia}
            aria-invalid={Boolean(errorDia)}
            aria-describedby={errorDia ? "error-dia" : undefined}
            className={campo}
          >
            {DIAS_SEMANA.map((dia) => (
              <option key={dia.valor} value={dia.valor}>
                {dia.nombre}
              </option>
            ))}
          </select>
          {errorDia && (
            <p id="error-dia" className={claseError}>
              {errorDia}
            </p>
          )}
        </div>
      </div>

      {estado.mensaje && (
        <p role={estado.tipo === "error" ? "alert" : "status"} className={claseMensaje(estado.tipo)}>
          {estado.mensaje}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className={`${botonGuardar} sm:w-full`}
      >
        {pendiente ? "Guardando…" : "Guardar presupuesto"}
      </button>
    </form>
  );
}

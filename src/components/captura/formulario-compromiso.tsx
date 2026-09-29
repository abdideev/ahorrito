"use client";

import { useActionState, useId } from "react";
import { CampoCaptura, describedBy } from "@/components/captura/campo-captura";
import { campo, mensaje as claseMensaje } from "@/components/captura/estilos";
import { ESTADO_CAPTURA_INICIAL, type EstadoCaptura } from "@/lib/captura/estado";
import { LONGITUD_MAXIMA_DENOMINACION, OCURRENCIAS_MAXIMAS } from "@/lib/captura/validacion";

export interface ValoresCompromiso {
  readonly denominacion: string;
  readonly monto: string;
  readonly fechaLimite: string;
  readonly ocurrencias: string;
}

interface Props {
  accion: (estado: EstadoCaptura, formulario: FormData) => Promise<EstadoCaptura>;
  /** Presente al modificar; ausente al dar de alta (RF-03 y RF-04). */
  id?: string;
  iniciales: ValoresCompromiso;
  textoBoton: string;
}

/**
 * Captura de un compromiso de pago, compartida por el alta y la modificación (RF-03, RF-04).
 *
 * Accesibilidad (RNF-11): cada campo tiene etiqueta propia, los errores se asocian con
 * `aria-describedby` y el resultado se anuncia con `role="alert"` o `role="status"`.
 * `useId` evita que los identificadores choquen cuando la página muestra un formulario
 * por cada compromiso.
 */
export function FormularioCompromiso({ accion, id, iniciales, textoBoton }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, ESTADO_CAPTURA_INICIAL);
  const prefijo = useId();

  const valor = (nombre: keyof ValoresCompromiso) => estado.valores[nombre] ?? iniciales[nombre];
  const idDe = (nombre: keyof ValoresCompromiso) => `${prefijo}-${nombre}`;
  const errorDe = (nombre: keyof ValoresCompromiso) => estado.errores[nombre];

  return (
    <form action={enviar} noValidate className="space-y-3">
      {id && <input type="hidden" name="id" value={id} />}

      <CampoCaptura
        idCampo={idDe("denominacion")}
        etiqueta="¿Qué pago es?"
        mensajeError={errorDe("denominacion")}
        ayuda="Como lo reconoces tú. Por ejemplo, Renta o Tarjeta."
      >
        <input
          id={idDe("denominacion")}
          name="denominacion"
          type="text"
          maxLength={LONGITUD_MAXIMA_DENOMINACION}
          autoComplete="off"
          required
          defaultValue={valor("denominacion")}
          aria-invalid={Boolean(errorDe("denominacion"))}
          aria-describedby={describedBy(idDe("denominacion"), {
            ayuda: true,
            error: Boolean(errorDe("denominacion")),
          })}
          className={campo}
        />
      </CampoCaptura>

      <div className="grid gap-3 sm:grid-cols-3">
        <CampoCaptura idCampo={idDe("monto")} etiqueta="Monto de cada pago" mensajeError={errorDe("monto")}>
          <input
            id={idDe("monto")}
            name="monto"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            required
            defaultValue={valor("monto")}
            aria-invalid={Boolean(errorDe("monto"))}
            aria-describedby={describedBy(idDe("monto"), { error: Boolean(errorDe("monto")) })}
            className={campo}
          />
        </CampoCaptura>

        <CampoCaptura idCampo={idDe("fechaLimite")} etiqueta="Fecha límite" mensajeError={errorDe("fechaLimite")}>
          <input
            id={idDe("fechaLimite")}
            name="fechaLimite"
            type="date"
            required
            defaultValue={valor("fechaLimite")}
            aria-invalid={Boolean(errorDe("fechaLimite"))}
            aria-describedby={describedBy(idDe("fechaLimite"), { error: Boolean(errorDe("fechaLimite")) })}
            className={campo}
          />
        </CampoCaptura>

        <CampoCaptura idCampo={idDe("ocurrencias")} etiqueta="¿Cuántos meses?" mensajeError={errorDe("ocurrencias")}>
          <select
            id={idDe("ocurrencias")}
            name="ocurrencias"
            defaultValue={valor("ocurrencias")}
            aria-invalid={Boolean(errorDe("ocurrencias"))}
            aria-describedby={describedBy(idDe("ocurrencias"), { error: Boolean(errorDe("ocurrencias")) })}
            className={campo}
          >
            {Array.from({ length: OCURRENCIAS_MAXIMAS }, (_, indice) => indice + 1).map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "Una sola vez" : `${n} meses seguidos`}
              </option>
            ))}
          </select>
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
        className="rounded bg-zinc-900 px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pendiente ? "Guardando…" : textoBoton}
      </button>
    </form>
  );
}

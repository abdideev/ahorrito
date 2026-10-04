"use client";

import { useActionState } from "react";
import {
  ayuda as claseAyuda,
  campoConIcono,
  error as claseError,
  etiqueta,
  iconoCampo,
  mensaje as claseMensaje,
} from "@/components/captura/estilos";
import { AvisoSimplificado } from "@/components/privacidad/aviso-simplificado";
import { IconoCandado, IconoCorreo } from "@/components/ui/iconos";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { ESTADO_INICIAL, type EstadoFormulario } from "@/lib/autenticacion/estado";
import { VALOR_ACEPTA_AVISO } from "@/lib/privacidad/aviso";

interface Props {
  accion: (estado: EstadoFormulario, formulario: FormData) => Promise<EstadoFormulario>;
  textoBoton: string;
  autocompletarContrasena: "new-password" | "current-password";
  ayudaContrasena?: string;
  /** Ruta a la que volver después de iniciar sesión. El servidor la valida de nuevo. */
  siguiente?: string;
  /** Registro: muestra el aviso simplificado y la casilla de consentimiento (RF-15). */
  pedirConsentimiento?: boolean;
}

/**
 * Formulario de correo y contraseña compartido por el registro y el inicio de sesión.
 *
 * Accesibilidad (RNF-11): cada campo tiene etiqueta, los errores se asocian con
 * aria-describedby y aria-invalid, y el mensaje general se anuncia con role="alert"
 * o role="status". `noValidate` deja la validación al servidor para que los mensajes
 * sean los mismos con o sin JavaScript.
 */
export function FormularioCredenciales({
  accion,
  textoBoton,
  autocompletarContrasena,
  ayudaContrasena,
  siguiente,
  pedirConsentimiento = false,
}: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, ESTADO_INICIAL);

  const describeContrasena =
    [ayudaContrasena ? "ayuda-contrasena" : null, estado.errores.contrasena ? "error-contrasena" : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <form action={enviar} noValidate className="mt-6 space-y-5">
      {siguiente && <input type="hidden" name="siguiente" value={siguiente} />}

      <div>
        <label htmlFor="correo" className={etiqueta}>
          Correo electrónico
        </label>
        <div className="relative">
          <IconoCorreo className={iconoCampo} />
          <input
            id="correo"
            name="correo"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            required
            defaultValue={estado.correo}
            aria-invalid={Boolean(estado.errores.correo)}
            aria-describedby={estado.errores.correo ? "error-correo" : undefined}
            className={campoConIcono}
          />
        </div>
        {estado.errores.correo && (
          <p id="error-correo" className={claseError}>
            {estado.errores.correo}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contrasena" className={etiqueta}>
          Contraseña
        </label>
        <div className="relative">
          <IconoCandado className={iconoCampo} />
          <input
            id="contrasena"
            name="contrasena"
            type="password"
            autoComplete={autocompletarContrasena}
            placeholder={autocompletarContrasena === "new-password" ? "Crea una contraseña" : "Tu contraseña"}
            required
            aria-invalid={Boolean(estado.errores.contrasena)}
            aria-describedby={describeContrasena}
            className={campoConIcono}
          />
        </div>
        {ayudaContrasena && (
          <p id="ayuda-contrasena" className={claseAyuda}>
            {ayudaContrasena}
          </p>
        )}
        {estado.errores.contrasena && (
          <p id="error-contrasena" className={claseError}>
            {estado.errores.contrasena}
          </p>
        )}
      </div>

      {pedirConsentimiento && (
        <div className="space-y-3">
          <AvisoSimplificado id="aviso-simplificado" />
          {/* El servidor rechaza el registro sin la casilla (CA-26); `required` no basta
              porque el formulario usa `noValidate` y se puede enviar sin la interfaz. */}
          <div className="flex items-start gap-3">
            <input
              id="acepta-aviso"
              name="acepta_aviso"
              type="checkbox"
              value={VALOR_ACEPTA_AVISO}
              required
              defaultChecked={estado.aceptaAviso}
              aria-invalid={Boolean(estado.errores.aviso)}
              aria-describedby={["aviso-simplificado", estado.errores.aviso ? "error-aviso" : null]
                .filter(Boolean)
                .join(" ")}
              className="mt-0.5 size-6 shrink-0 accent-terciario"
            />
            <label htmlFor="acepta-aviso" className="text-sm leading-6 font-semibold text-texto">
              He leído el aviso de privacidad y consiento el tratamiento de mis datos, incluidos los patrimoniales,
              para las finalidades descritas.
            </label>
          </div>
          {estado.errores.aviso && (
            <p id="error-aviso" className={claseError}>
              {estado.errores.aviso}
            </p>
          )}
        </div>
      )}

      {estado.mensaje && (
        <p
          role={estado.tipo === "error" ? "alert" : "status"}
          className={claseMensaje(estado.tipo)}
        >
          {estado.mensaje}
        </p>
      )}

      <InteractiveHoverButton type="submit" disabled={pendiente} className="w-full">
        {pendiente ? "Procesando…" : textoBoton}
      </InteractiveHoverButton>
    </form>
  );
}

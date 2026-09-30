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
import { IconoCandado, IconoCorreo } from "@/components/ui/iconos";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { ESTADO_INICIAL, type EstadoFormulario } from "@/lib/autenticacion/estado";

interface Props {
  accion: (estado: EstadoFormulario, formulario: FormData) => Promise<EstadoFormulario>;
  textoBoton: string;
  autocompletarContrasena: "new-password" | "current-password";
  ayudaContrasena?: string;
  /** Ruta a la que volver después de iniciar sesión. El servidor la valida de nuevo. */
  siguiente?: string;
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

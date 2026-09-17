"use client";

import { useActionState } from "react";
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

  const etiqueta = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";
  const campo =
    "mt-1 w-full rounded border border-zinc-400 bg-white px-3 py-2 text-zinc-900 aria-[invalid=true]:border-red-600 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";
  const error = "mt-1 text-sm text-red-700 dark:text-red-400";

  const describeContrasena =
    [ayudaContrasena ? "ayuda-contrasena" : null, estado.errores.contrasena ? "error-contrasena" : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <form action={enviar} noValidate className="mt-6 space-y-4">
      {siguiente && <input type="hidden" name="siguiente" value={siguiente} />}

      <div>
        <label htmlFor="correo" className={etiqueta}>
          Correo electrónico
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="email"
          required
          defaultValue={estado.correo}
          aria-invalid={Boolean(estado.errores.correo)}
          aria-describedby={estado.errores.correo ? "error-correo" : undefined}
          className={campo}
        />
        {estado.errores.correo && (
          <p id="error-correo" className={error}>
            {estado.errores.correo}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contrasena" className={etiqueta}>
          Contraseña
        </label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          autoComplete={autocompletarContrasena}
          required
          aria-invalid={Boolean(estado.errores.contrasena)}
          aria-describedby={describeContrasena}
          className={campo}
        />
        {ayudaContrasena && (
          <p id="ayuda-contrasena" className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {ayudaContrasena}
          </p>
        )}
        {estado.errores.contrasena && (
          <p id="error-contrasena" className={error}>
            {estado.errores.contrasena}
          </p>
        )}
      </div>

      {estado.mensaje && (
        <p
          role={estado.tipo === "error" ? "alert" : "status"}
          className={
            estado.tipo === "error"
              ? "rounded border border-red-600 p-3 text-sm text-red-700 dark:text-red-400"
              : "rounded border border-emerald-600 p-3 text-sm text-emerald-800 dark:text-emerald-300"
          }
        >
          {estado.mensaje}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded bg-zinc-900 px-5 py-2.5 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pendiente ? "Procesando…" : textoBoton}
      </button>
    </form>
  );
}

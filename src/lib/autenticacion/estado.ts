import type { ErroresCredenciales } from "./validacion";

/**
 * Estado que las acciones de autenticación devuelven a su formulario.
 * Conserva el correo para no obligar a reescribirlo; la contraseña nunca regresa.
 */
export interface EstadoFormulario {
  readonly tipo: "error" | "exito" | null;
  readonly mensaje: string | null;
  readonly errores: ErroresCredenciales;
  readonly correo: string;
}

export const ESTADO_INICIAL: EstadoFormulario = {
  tipo: null,
  mensaje: null,
  errores: {},
  correo: "",
};

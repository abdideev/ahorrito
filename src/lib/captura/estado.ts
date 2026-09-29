/**
 * Estado que las acciones de captura devuelven a su formulario (RF-02 a RF-06).
 *
 * Los errores por campo viajan aparte del mensaje general: el campo los muestra junto
 * a la entrada que falló y el mensaje se anuncia una sola vez (RNF-11).
 */

export interface EstadoCaptura {
  readonly tipo: "error" | "exito" | null;
  readonly mensaje: string | null;
  /** Mensaje por campo, con el nombre del campo del formulario como clave. */
  readonly errores: Readonly<Record<string, string | undefined>>;
  /** Valores tal como los escribió el usuario, para no obligarlo a repetirlos. */
  readonly valores: Readonly<Record<string, string>>;
}

export const ESTADO_CAPTURA_INICIAL: EstadoCaptura = {
  tipo: null,
  mensaje: null,
  errores: {},
  valores: {},
};

/** Lee un campo del formulario como texto, sin confiar en su tipo. */
export function texto(formulario: FormData, campo: string): string {
  const valor = formulario.get(campo);
  return typeof valor === "string" ? valor : "";
}

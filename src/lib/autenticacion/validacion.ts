/**
 * Validación de credenciales en el servidor (RF-01, sección 3.6.2).
 *
 * La validación del servidor es el control de seguridad; la del navegador, una
 * comodidad que puede omitirse enviando la petición directamente.
 *
 * Límites de la contraseña (RNF-05):
 * - Mínimo de 8 caracteres, igual que la configuración de Supabase Auth.
 * - Máximo de 72 bytes en UTF-8. bcrypt, el algoritmo con el que Supabase deriva la
 *   contraseña, ignora todo lo que exceda 72 bytes: dos contraseñas que solo difieren
 *   después de ese límite serían equivalentes. Se mide en bytes, no en caracteres,
 *   porque una "ñ" ocupa 2 bytes y un emoji 4.
 */

export const LONGITUD_MINIMA_CONTRASENA = 8;
export const BYTES_MAXIMOS_CONTRASENA = 72;
const LONGITUD_MAXIMA_CORREO = 254;
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ErroresCredenciales {
  readonly correo?: string;
  readonly contrasena?: string;
}

export type ResultadoValidacion =
  | { readonly valido: true; readonly correo: string; readonly contrasena: string }
  | { readonly valido: false; readonly correo: string; readonly errores: ErroresCredenciales };

function normalizarCorreo(valor: unknown): string {
  return typeof valor === "string" ? valor.trim().toLowerCase() : "";
}

function errorDeCorreo(correo: string): string | undefined {
  if (correo === "") {
    return "Escribe tu correo electrónico.";
  }
  if (correo.length > LONGITUD_MAXIMA_CORREO || !PATRON_CORREO.test(correo)) {
    return "Escribe un correo electrónico válido.";
  }
  return undefined;
}

/** Registro: aplica la política completa de contraseñas. */
export function validarRegistro(correoRecibido: unknown, contrasenaRecibida: unknown): ResultadoValidacion {
  const correo = normalizarCorreo(correoRecibido);
  // La contraseña no se recorta: los espacios pueden ser parte de ella.
  const contrasena = typeof contrasenaRecibida === "string" ? contrasenaRecibida : "";

  let errorContrasena: string | undefined;
  if ([...contrasena].length < LONGITUD_MINIMA_CONTRASENA) {
    errorContrasena = `La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`;
  } else if (new TextEncoder().encode(contrasena).length > BYTES_MAXIMOS_CONTRASENA) {
    errorContrasena = "La contraseña es demasiado larga. Usa una más corta o con menos símbolos especiales.";
  }

  const errores: ErroresCredenciales = { correo: errorDeCorreo(correo), contrasena: errorContrasena };
  if (errores.correo || errores.contrasena) {
    return { valido: false, correo, errores };
  }
  return { valido: true, correo, contrasena };
}

/**
 * Inicio de sesión: solo exige que ambos campos existan. No se aplica la política de
 * contraseñas, porque anunciarla aquí no protege nada y un cambio futuro de política
 * impediría entrar a cuentas creadas antes.
 */
export function validarInicioSesion(correoRecibido: unknown, contrasenaRecibida: unknown): ResultadoValidacion {
  const correo = normalizarCorreo(correoRecibido);
  const contrasena = typeof contrasenaRecibida === "string" ? contrasenaRecibida : "";

  const errores: ErroresCredenciales = {
    correo: errorDeCorreo(correo),
    contrasena: contrasena === "" ? "Escribe tu contraseña." : undefined,
  };
  if (errores.correo || errores.contrasena) {
    return { valido: false, correo, errores };
  }
  return { valido: true, correo, contrasena };
}

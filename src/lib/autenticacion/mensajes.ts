/**
 * Traducción de los códigos de error de Supabase Auth a mensajes para el usuario.
 *
 * Nunca se muestra el mensaje original de Supabase: puede estar en inglés y revelar
 * detalles internos. Los mensajes de credenciales no distinguen si falló el correo o
 * la contraseña, para no confirmar qué cuentas existen (enumeración de cuentas).
 */

const MENSAJES: Readonly<Record<string, string>> = {
  invalid_credentials: "Correo o contraseña incorrectos.",
  email_not_confirmed: "Confirma tu correo antes de iniciar sesión. Revisa el enlace que te enviamos.",
  weak_password: "La contraseña es demasiado débil. Usa al menos 8 caracteres.",
  over_email_send_rate_limit: "Se alcanzó el límite de envío de correos. Espera unos minutos e inténtalo de nuevo.",
  over_request_rate_limit: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  email_address_not_authorized:
    "Este correo no puede recibir mensajes de confirmación en el entorno de pruebas.",
  signup_disabled: "El registro de cuentas nuevas está deshabilitado.",
};

export const MENSAJE_GENERICO = "No fue posible completar la operación. Inténtalo más tarde.";

export function mensajeDeErrorAutenticacion(codigo: string | undefined): string {
  // Object.hasOwn y no MENSAJES[codigo]: el código llega en una respuesta de red, y un
  // valor como "toString" devolvería la función heredada de Object.prototype.
  return codigo !== undefined && Object.hasOwn(MENSAJES, codigo) ? MENSAJES[codigo] : MENSAJE_GENERICO;
}

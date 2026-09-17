import { describe, expect, it } from "vitest";
import { MENSAJE_GENERICO, mensajeDeErrorAutenticacion } from "./mensajes";

describe("mensajeDeErrorAutenticacion", () => {
  it("traduce los codigos conocidos de Supabase Auth", () => {
    expect(mensajeDeErrorAutenticacion("email_not_confirmed")).toMatch(/Confirma tu correo/);
    expect(mensajeDeErrorAutenticacion("over_request_rate_limit")).toMatch(/Demasiados intentos/);
  });

  it("no revela si fallo el correo o la contraseña", () => {
    expect(mensajeDeErrorAutenticacion("invalid_credentials")).toBe("Correo o contraseña incorrectos.");
  });

  it("usa un mensaje generico ante codigos desconocidos o ausentes", () => {
    expect(mensajeDeErrorAutenticacion("codigo_inexistente")).toBe(MENSAJE_GENERICO);
    expect(mensajeDeErrorAutenticacion(undefined)).toBe(MENSAJE_GENERICO);
    // Una propiedad heredada de Object no debe tomarse como mensaje.
    expect(mensajeDeErrorAutenticacion("toString")).toBe(MENSAJE_GENERICO);
  });
});

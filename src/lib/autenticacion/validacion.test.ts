import { describe, expect, it } from "vitest";
import { validarInicioSesion, validarRegistro } from "./validacion";

describe("validarRegistro", () => {
  it("acepta credenciales validas y normaliza el correo", () => {
    expect(validarRegistro("  Abdiel@Ejemplo.MX ", "contrasena-segura")).toEqual({
      valido: true,
      correo: "abdiel@ejemplo.mx",
      contrasena: "contrasena-segura",
    });
  });

  it("no recorta la contraseña: los espacios forman parte de ella", () => {
    const resultado = validarRegistro("a@b.mx", "  ocho  ");
    expect(resultado.valido && resultado.contrasena).toBe("  ocho  ");
  });

  it("rechaza correos ausentes o mal formados", () => {
    for (const correo of ["", "   ", "sin-arroba", "a@b", "a b@c.mx", null, 7]) {
      const resultado = validarRegistro(correo, "contrasena-segura");
      expect(resultado.valido, String(correo)).toBe(false);
    }
  });

  it("exige al menos 8 caracteres, contados como caracteres y no como bytes", () => {
    expect(validarRegistro("a@b.mx", "1234567").valido).toBe(false);
    expect(validarRegistro("a@b.mx", "12345678").valido).toBe(true);
    // Ocho letras "ñ" son 8 caracteres aunque ocupen 16 bytes.
    expect(validarRegistro("a@b.mx", "ñññññññ").valido).toBe(false);
    expect(validarRegistro("a@b.mx", "ññññññññ").valido).toBe(true);
  });

  it("limita la contraseña a 72 bytes, el maximo que bcrypt considera (RNF-05)", () => {
    expect(validarRegistro("a@b.mx", "a".repeat(72)).valido).toBe(true);
    expect(validarRegistro("a@b.mx", "a".repeat(73)).valido).toBe(false);
    // 36 "ñ" ocupan exactamente 72 bytes; 37 ocupan 74.
    expect(validarRegistro("a@b.mx", "ñ".repeat(36)).valido).toBe(true);
    expect(validarRegistro("a@b.mx", "ñ".repeat(37)).valido).toBe(false);
    // 20 emojis son solo 20 caracteres, pero 80 bytes.
    expect(validarRegistro("a@b.mx", "🪙".repeat(20)).valido).toBe(false);
  });

  it("informa ambos errores a la vez y conserva el correo normalizado", () => {
    const resultado = validarRegistro(" MAL ", "corta");
    expect(resultado.valido).toBe(false);
    if (!resultado.valido) {
      expect(resultado.correo).toBe("mal");
      expect(resultado.errores.correo).toBeDefined();
      expect(resultado.errores.contrasena).toBeDefined();
    }
  });
});

describe("validarInicioSesion", () => {
  it("solo exige que los campos existan, sin aplicar la politica de contraseñas", () => {
    expect(validarInicioSesion("a@b.mx", "corta").valido).toBe(true);
  });

  it("rechaza una contraseña vacia o un correo invalido", () => {
    expect(validarInicioSesion("a@b.mx", "").valido).toBe(false);
    expect(validarInicioSesion("correo", "cualquiera").valido).toBe(false);
  });
});

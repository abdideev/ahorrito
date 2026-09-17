import { describe, expect, it } from "vitest";
import { leerConfiguracionSupabase } from "./entorno";

const CLAVE = "clave-publica-de-prueba";

describe("leerConfiguracionSupabase", () => {
  it("acepta una URL HTTPS y conserva solo el origen", () => {
    expect(
      leerConfiguracionSupabase({ url: " https://proyecto.supabase.co/ ", clavePublica: CLAVE }),
    ).toEqual({ url: "https://proyecto.supabase.co", clavePublica: CLAVE });
  });

  it("rechaza HTTP contra un servidor remoto (RNF-05)", () => {
    expect(() =>
      leerConfiguracionSupabase({ url: "http://proyecto.supabase.co", clavePublica: CLAVE }),
    ).toThrow(/HTTPS/);
  });

  it("admite HTTP solo contra una instancia local", () => {
    expect(leerConfiguracionSupabase({ url: "http://127.0.0.1:54321", clavePublica: CLAVE }).url).toBe(
      "http://127.0.0.1:54321",
    );
    expect(leerConfiguracionSupabase({ url: "http://localhost:54321", clavePublica: CLAVE }).url).toBe(
      "http://localhost:54321",
    );
  });

  it("rechaza variables ausentes, vacias o una URL mal formada", () => {
    expect(() => leerConfiguracionSupabase({ clavePublica: CLAVE })).toThrow(/Faltan/);
    expect(() => leerConfiguracionSupabase({ url: "https://proyecto.supabase.co", clavePublica: "  " })).toThrow(
      /Faltan/,
    );
    expect(() => leerConfiguracionSupabase({ url: "no es una url", clavePublica: CLAVE })).toThrow(/valida/);
  });

  it("nunca incluye el valor de la clave en los mensajes de error", () => {
    try {
      leerConfiguracionSupabase({ url: "http://proyecto.supabase.co", clavePublica: CLAVE });
      expect.fail("Debio lanzar un error");
    } catch (error) {
      expect(String(error)).not.toContain(CLAVE);
    }
  });
});

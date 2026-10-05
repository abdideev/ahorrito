import { describe, expect, it } from "vitest";
import { FECHA_AVISO, VERSION_AVISO, constanciaDeConsentimiento } from "./aviso";

describe("RF-15 · datos del aviso de privacidad", () => {
  it("la fecha del aviso es una fecha ISO valida", () => {
    expect(FECHA_AVISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(new Date(`${FECHA_AVISO}T00:00:00Z`).getTime())).toBe(false);
  });

  it("la constancia registra la version vigente y el instante de la aceptacion", () => {
    const ahora = new Date("2026-10-03T23:50:00.000Z");

    expect(constanciaDeConsentimiento(ahora)).toEqual({
      aviso_privacidad_version: VERSION_AVISO,
      aviso_privacidad_aceptado_en: "2026-10-03T23:50:00.000Z",
    });
  });
});

import { describe, expect, it } from "vitest";
import { centavos } from "@/core/tipos";
import { centavosATextoPlano, formatearPesos, pesosACentavos } from "./dinero";

describe("pesosACentavos", () => {
  it.each([
    [500, 50_000],
    ["500.55", 50_055],
    [1234.29, 123_429],
    ["  12.10  ", 1_210],
  ])("convierte %j a %i centavos", (pesos, esperado) => {
    expect(pesosACentavos(pesos)).toBe(esperado);
  });

  it("rechaza una cantidad que no es un numero", () => {
    expect(() => pesosACentavos("mil")).toThrow(RangeError);
  });
});

describe("centavosATextoPlano", () => {
  it.each([
    [50_000, "500.00"],
    [50_055, "500.55"],
    [1, "0.01"],
    [0, "0.00"],
    [-40_000, "-400.00"],
  ])("escribe %i centavos como %s", (importe, esperado) => {
    expect(centavosATextoPlano(centavos(importe))).toBe(esperado);
  });

  it("da la vuelta completa sin perder centavos", () => {
    expect(pesosACentavos(centavosATextoPlano(centavos(123_429)))).toBe(123_429);
  });
});

describe("formatearPesos", () => {
  it("presenta el importe con simbolo y dos decimales", () => {
    // El espacio antes del simbolo puede ser un espacio estrecho segun la plataforma.
    expect(formatearPesos(centavos(123_450)).replace(/\s/g, " ")).toMatch(/^\$?1,234\.50$/);
  });
});

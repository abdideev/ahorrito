import { describe, expect, it } from "vitest";
import { centavos, restarCentavos, sumarCentavos } from "./tipos";

describe("centavos", () => {
  it("acepta enteros positivos, cero y negativos", () => {
    expect(centavos(60000)).toBe(60000);
    expect(centavos(0)).toBe(0);
    expect(centavos(-150)).toBe(-150);
  });

  it("rechaza importes con decimales, que delatan un monto en pesos", () => {
    expect(() => centavos(600.5)).toThrow(RangeError);
    expect(() => centavos(0.1 + 0.2)).toThrow(RangeError);
  });

  it("rechaza valores no finitos y enteros fuera del rango seguro", () => {
    expect(() => centavos(Number.NaN)).toThrow(RangeError);
    expect(() => centavos(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => centavos(2 ** 53)).toThrow(RangeError);
  });
});

describe("sumarCentavos y restarCentavos", () => {
  it("suma una lista de importes y devuelve cero si esta vacia", () => {
    expect(sumarCentavos([centavos(20000), centavos(20000), centavos(20001)])).toBe(60001);
    expect(sumarCentavos([])).toBe(0);
  });

  it("resta importes y admite resultado negativo", () => {
    expect(restarCentavos(centavos(50000), centavos(70000))).toBe(-20000);
  });

  it("detecta el desbordamiento del rango seguro", () => {
    const grande = centavos(Number.MAX_SAFE_INTEGER);
    expect(() => sumarCentavos([grande, centavos(1)])).toThrow(RangeError);
  });
});

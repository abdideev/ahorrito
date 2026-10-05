import { describe, expect, it } from "vitest";
import { textoEnlaceHistorial } from "./enlace-historial";

describe("textoEnlaceHistorial", () => {
  it("con un solo plan usa el posesivo en singular (defecto #37)", () => {
    expect(textoEnlaceHistorial(1)).toBe("Ver mi plan guardado");
  });

  it("con varios planes usa el plural y la cantidad", () => {
    expect(textoEnlaceHistorial(2)).toBe("Ver mis 2 planes guardados");
    expect(textoEnlaceHistorial(19)).toBe("Ver mis 19 planes guardados");
  });
});

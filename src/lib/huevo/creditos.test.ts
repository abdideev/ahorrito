import { describe, expect, it } from "vitest";
import { HORAS_ESTIMADAS, ROLES, totalHoras } from "./creditos";

describe("creditos", () => {
  it("las horas de los roles cuadran con la estimacion de la seccion 1.8.5", () => {
    expect(totalHoras(ROLES)).toBe(HORAS_ESTIMADAS);
  });

  it("cada rol tiene responsable, aportacion y horas positivas", () => {
    for (const rol of ROLES) {
      expect(rol.responsable.length, rol.rol).toBeGreaterThan(0);
      expect(rol.aportacion.length, rol.rol).toBeGreaterThan(0);
      expect(Number.isInteger(rol.horas) && rol.horas > 0, rol.rol).toBe(true);
    }
  });
});

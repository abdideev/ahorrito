import { describe, expect, it } from "vitest";
import { fechaIso } from "@/core/calendario";
import { calcularPlan } from "@/core/plan";
import { centavos, type EntradaPlan } from "@/core/tipos";
import { crearAlcancia, depositarMoneda, esCuadrePerfecto } from "./secuencia";

function entrada(presupuestoPesos: number): EntradaPlan {
  return {
    fechaReferencia: fechaIso("2026-09-14"),
    presupuesto: { montoSemanal: centavos(presupuestoPesos * 100), diaInicioSemana: 1 },
    compromisos: [
      { id: "tarjeta", monto: centavos(60000), fechaLimite: fechaIso("2026-09-30"), ocurrencias: 1 },
    ],
  };
}

describe("esCuadrePerfecto", () => {
  it("reconoce el plan en el que todas las semanas terminan en cero", () => {
    // 600 que vencen en la tercera semana con 200 semanales: se apartan 200 cada semana.
    expect(esCuadrePerfecto(calcularPlan(entrada(200)))).toBe(true);
  });

  it("rechaza un plan con remanente en cualquier semana", () => {
    expect(esCuadrePerfecto(calcularPlan(entrada(201)))).toBe(false);
    expect(esCuadrePerfecto(calcularPlan(entrada(199)))).toBe(false);
  });

  it("rechaza un plan sin semanas", () => {
    const plan = calcularPlan(entrada(200));
    expect(esCuadrePerfecto({ ...plan, asignaciones: [] })).toBe(false);
  });
});

describe("alcancia", () => {
  it("se completa al depositar todas las monedas en orden", () => {
    let estado = crearAlcancia(3);
    const resultados = [1, 2, 3].map((semana) => {
      const paso = depositarMoneda(estado, semana);
      estado = paso.estado;
      return paso.resultado;
    });
    expect(resultados).toEqual(["depositada", "depositada", "completa"]);
  });

  it("se reinicia con una moneda fuera de orden", () => {
    const tras1 = depositarMoneda(crearAlcancia(3), 1).estado;
    const salto = depositarMoneda(tras1, 3);
    expect(salto.resultado).toBe("reiniciada");
    expect(salto.estado.depositadas).toBe(0);
  });

  it("se reinicia al repetir una moneda ya depositada", () => {
    const tras1 = depositarMoneda(crearAlcancia(3), 1).estado;
    expect(depositarMoneda(tras1, 1).resultado).toBe("reiniciada");
  });

  it("un plan de una sola semana se completa con la primera moneda", () => {
    expect(depositarMoneda(crearAlcancia(1), 1).resultado).toBe("completa");
  });

  it("rechaza un numero de semanas invalido", () => {
    expect(() => crearAlcancia(0)).toThrow(RangeError);
    expect(() => crearAlcancia(2.5)).toThrow(RangeError);
  });
});

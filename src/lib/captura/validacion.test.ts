import { describe, expect, it } from "vitest";
import {
  PESOS_MAXIMOS,
  validarDiaSemana,
  validarFecha,
  validarImporte,
  validarPresupuesto,
} from "./validacion";

describe("validarImporte", () => {
  it.each([
    ["500", 50_000],
    ["500.5", 50_050],
    ["500.55", 50_055],
    ["  1,234.50  ", 123_450],
    ["$980", 98_000],
    ["0.01", 1],
  ])("acepta %j y devuelve %i centavos", (texto, esperado) => {
    expect(validarImporte(texto, "tu presupuesto semanal")).toEqual({ valido: true, monto: esperado });
  });

  it("no pierde centavos en un importe que el punto flotante altera", () => {
    // 0.29 * 100 da 28.999999999999996 en punto flotante.
    expect(validarImporte("1234.29", "el monto")).toEqual({ valido: true, monto: 123_429 });
  });

  it.each([
    ["vacío", ""],
    ["solo espacios", "   "],
    ["texto", "quinientos"],
    ["tres decimales", "500.555"],
    ["negativo", "-500"],
    ["cero", "0"],
    ["cero con decimales", "0.00"],
    ["notación científica", "5e3"],
    ["no es texto", 500],
  ])("rechaza %s", (_caso, valor) => {
    const resultado = validarImporte(valor, "tu presupuesto semanal");
    expect(resultado.valido).toBe(false);
    expect(resultado.valido === false && resultado.error.length).toBeGreaterThan(0);
  });

  it("rechaza un importe fuera del rango de numeric(12,2)", () => {
    expect(validarImporte(String(PESOS_MAXIMOS + 1), "el monto").valido).toBe(false);
    expect(validarImporte(String(PESOS_MAXIMOS), "el monto").valido).toBe(true);
  });
});

describe("validarDiaSemana", () => {
  it.each(["0", "1", "6"])("acepta el día %s", (texto) => {
    expect(validarDiaSemana(texto)).toEqual({ valido: true, dia: Number(texto) });
  });

  it.each([["7"], ["-1"], [""], ["lunes"], [1]])("rechaza %j", (valor) => {
    expect(validarDiaSemana(valor).valido).toBe(false);
  });
});

describe("validarFecha", () => {
  it("acepta una fecha existente", () => {
    expect(validarFecha("2026-09-30", "la fecha límite")).toEqual({ valido: true, fecha: "2026-09-30" });
  });

  it("acepta el 29 de febrero de un año bisiesto", () => {
    expect(validarFecha("2028-02-29", "la fecha límite").valido).toBe(true);
  });

  it.each([
    ["día inexistente", "2026-02-31"],
    ["29 de febrero de un año no bisiesto", "2026-02-29"],
    ["mes 13", "2026-13-01"],
    ["formato distinto", "30/09/2026"],
    ["vacío", ""],
  ])("rechaza %s", (_caso, valor) => {
    expect(validarFecha(valor, "la fecha límite").valido).toBe(false);
  });
});

describe("validarPresupuesto (RF-02)", () => {
  it("construye el presupuesto con el monto en centavos y el día elegido", () => {
    expect(validarPresupuesto("500", "1")).toEqual({
      valido: true,
      presupuesto: { montoSemanal: 50_000, diaInicioSemana: 1 },
    });
  });

  it("informa los dos errores a la vez, no solo el primero", () => {
    const resultado = validarPresupuesto("", "9");

    expect(resultado.valido).toBe(false);
    if (resultado.valido) return;
    expect(resultado.errores.montoSemanal).toBeDefined();
    expect(resultado.errores.diaInicioSemana).toBeDefined();
  });

  it("acepta el domingo como inicio de semana (día 0)", () => {
    expect(validarPresupuesto("1200.75", "0")).toEqual({
      valido: true,
      presupuesto: { montoSemanal: 120_075, diaInicioSemana: 0 },
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  LONGITUD_MAXIMA_DENOMINACION,
  PESOS_MAXIMOS,
  validarCompromiso,
  validarDiaSemana,
  validarFecha,
  validarImporte,
  validarIngreso,
  validarMeta,
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

describe("validarCompromiso (RF-03)", () => {
  const valido = () => validarCompromiso("Tarjeta de credito", "600", "2026-10-30", "3");

  it("construye el compromiso con el monto en centavos", () => {
    expect(valido()).toEqual({
      valido: true,
      datos: {
        denominacion: "Tarjeta de credito",
        monto: 60_000,
        fechaLimite: "2026-10-30",
        ocurrencias: 3,
      },
    });
  });

  it("recorta los espacios de la denominacion", () => {
    const resultado = validarCompromiso("  Renta  ", "700", "2026-10-05", "1");
    expect(resultado.valido && resultado.datos.denominacion).toBe("Renta");
  });

  it("acepta una fecha limite ya vencida, que el motor señala con una advertencia", () => {
    expect(validarCompromiso("Renta", "700", "2020-01-31", "1").valido).toBe(true);
  });

  it.each([
    ["denominacion vacia", ["", "600", "2026-10-30", "3"], "denominacion"],
    ["denominacion de solo espacios", ["   ", "600", "2026-10-30", "3"], "denominacion"],
    ["denominacion demasiado larga", ["x".repeat(LONGITUD_MAXIMA_DENOMINACION + 1), "600", "2026-10-30", "3"], "denominacion"],
    ["monto cero", ["Renta", "0", "2026-10-30", "3"], "monto"],
    ["monto con tres decimales", ["Renta", "600.555", "2026-10-30", "3"], "monto"],
    ["fecha inexistente", ["Renta", "600", "2026-02-31", "3"], "fechaLimite"],
    ["cero ocurrencias", ["Renta", "600", "2026-10-30", "0"], "ocurrencias"],
    ["siete ocurrencias, fuera de la regla de negocio 2", ["Renta", "600", "2026-10-30", "7"], "ocurrencias"],
    ["ocurrencias con decimales", ["Renta", "600", "2026-10-30", "1.5"], "ocurrencias"],
  ])("rechaza %s y marca el campo", (_caso, entrada, campo) => {
    const [denominacion, monto, fecha, ocurrencias] = entrada as string[];
    const resultado = validarCompromiso(denominacion, monto, fecha, ocurrencias);

    expect(resultado.valido).toBe(false);
    if (resultado.valido) return;
    expect(resultado.errores[campo as keyof typeof resultado.errores]).toBeDefined();
  });

  it("informa todos los campos invalidos a la vez", () => {
    const resultado = validarCompromiso("", "", "", "");

    expect(resultado.valido).toBe(false);
    if (resultado.valido) return;
    expect(Object.values(resultado.errores).filter(Boolean)).toHaveLength(4);
  });
});

describe("validarIngreso (RF-05)", () => {
  it("acepta monto y fecha validos", () => {
    expect(validarIngreso("1200.75", "2026-10-10")).toEqual({
      valido: true,
      monto: 120_075,
      fecha: "2026-10-10",
    });
  });

  it("acepta una fecha lejana: el motor avisa si queda fuera del horizonte", () => {
    expect(validarIngreso("500", "2030-01-01").valido).toBe(true);
  });

  it.each([
    ["monto vacio", "", "2026-10-10", "monto"],
    ["monto negativo", "-100", "2026-10-10", "monto"],
    ["fecha inexistente", "500", "2026-02-30", "fecha"],
  ])("rechaza %s", (_caso, monto, fecha, campo) => {
    const resultado = validarIngreso(monto, fecha);
    expect(resultado.valido).toBe(false);
    if (resultado.valido) return;
    expect(resultado.errores[campo as keyof typeof resultado.errores]).toBeDefined();
  });
});

describe("validarMeta (RF-06)", () => {
  const HOY = "2026-09-29";

  it("acepta monto y fecha posterior a hoy", () => {
    expect(validarMeta("3000", "2026-12-31", HOY)).toEqual({
      valido: true,
      montoObjetivo: 300_000,
      fechaObjetivo: "2026-12-31",
    });
  });

  it("rechaza la fecha de hoy, porque el contrato exige una posterior", () => {
    const resultado = validarMeta("3000", HOY, HOY);
    expect(resultado.valido).toBe(false);
    if (resultado.valido) return;
    expect(resultado.errores.fechaObjetivo).toBe("Elige una fecha posterior a hoy.");
  });

  it("rechaza una fecha pasada", () => {
    expect(validarMeta("3000", "2026-01-01", HOY).valido).toBe(false);
  });

  it("acepta el dia siguiente", () => {
    expect(validarMeta("3000", "2026-09-30", HOY).valido).toBe(true);
  });

  it("informa los dos errores a la vez", () => {
    const resultado = validarMeta("0", "2020-01-01", HOY);
    expect(resultado.valido).toBe(false);
    if (resultado.valido) return;
    expect(resultado.errores.montoObjetivo).toBeDefined();
    expect(resultado.errores.fechaObjetivo).toBeDefined();
  });
});

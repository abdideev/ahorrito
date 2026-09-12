import { describe, expect, it } from "vitest";
import { fechaIso } from "./calendario";
import { centavos, type Compromiso } from "./tipos";
import {
  clasificarVencimientos,
  derivarTodosLosVencimientos,
  derivarVencimientos,
} from "./vencimientos";

const f = fechaIso;

function compromiso(id: string, pesos: number, fechaLimite: string, ocurrencias: number): Compromiso {
  return { id, monto: centavos(pesos * 100), fechaLimite: f(fechaLimite), ocurrencias };
}

describe("derivarVencimientos", () => {
  it("CA-03: 600 con vencimiento el dia 20 y 3 ocurrencias vence el 20 de tres meses seguidos", () => {
    expect(derivarVencimientos(compromiso("tarjeta", 600, "2026-09-20", 3))).toEqual([
      { compromisoId: "tarjeta", ocurrencia: 1, fecha: "2026-09-20", monto: 60000 },
      { compromisoId: "tarjeta", ocurrencia: 2, fecha: "2026-10-20", monto: 60000 },
      { compromisoId: "tarjeta", ocurrencia: 3, fecha: "2026-11-20", monto: 60000 },
    ]);
  });

  it("compromiso de 6 ocurrencias: seis vencimientos que cruzan el cambio de anio", () => {
    const vencimientos = derivarVencimientos(compromiso("renta", 1500, "2026-09-15", 6));
    expect(vencimientos.map((v) => v.fecha)).toEqual([
      "2026-09-15",
      "2026-10-15",
      "2026-11-15",
      "2026-12-15",
      "2027-01-15",
      "2027-02-15",
    ]);
    expect(vencimientos.map((v) => v.ocurrencia)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(vencimientos.every((v) => v.monto === 150000)).toBe(true);
  });

  it("compromiso con dia 31 vuelve al 31 despues de pasar por meses cortos", () => {
    const fechas = derivarVencimientos(compromiso("gimnasio", 350, "2026-01-31", 4)).map((v) => v.fecha);
    expect(fechas).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30"]);
  });

  it("usa el 29 de febrero cuando el anio es bisiesto", () => {
    const fechas = derivarVencimientos(compromiso("seguro", 200, "2027-12-31", 3)).map((v) => v.fecha);
    expect(fechas).toEqual(["2027-12-31", "2028-01-31", "2028-02-29"]);
  });

  it("un compromiso de una ocurrencia produce un solo vencimiento", () => {
    expect(derivarVencimientos(compromiso("inscripcion", 2500, "2026-10-01", 1))).toHaveLength(1);
  });

  it("no modifica el compromiso recibido", () => {
    const original = Object.freeze(compromiso("tarjeta", 600, "2026-09-20", 2));
    expect(() => derivarVencimientos(original)).not.toThrow();
    expect(original.ocurrencias).toBe(2);
  });

  it.each([0, 7, 2.5, Number.NaN])("rechaza %s ocurrencias", (ocurrencias) => {
    expect(() => derivarVencimientos(compromiso("x", 100, "2026-09-20", ocurrencias))).toThrow(RangeError);
  });

  it("rechaza montos no positivos o con decimales", () => {
    const base = compromiso("x", 100, "2026-09-20", 1);
    for (const monto of [0, -100, 10.5]) {
      expect(() => derivarVencimientos({ ...base, monto: monto as typeof base.monto })).toThrow(RangeError);
    }
  });

  it("rechaza una fecha limite invalida y un identificador vacio", () => {
    const base = compromiso("x", 100, "2026-09-20", 1);
    expect(() => derivarVencimientos({ ...base, fechaLimite: "2026-02-30" as typeof base.fechaLimite })).toThrow(
      RangeError,
    );
    expect(() => derivarVencimientos({ ...base, id: "" })).toThrow(RangeError);
  });
});

describe("derivarTodosLosVencimientos", () => {
  const renta = compromiso("renta", 1500, "2026-09-15", 2);
  const tarjeta = compromiso("tarjeta", 600, "2026-09-20", 2);
  const internet = compromiso("internet", 400, "2026-09-15", 1);

  it("ordena por fecha y resuelve los empates de fecha por identificador", () => {
    const resultado = derivarTodosLosVencimientos([tarjeta, renta, internet]);
    expect(resultado.map((v) => `${v.fecha} ${v.compromisoId}#${v.ocurrencia}`)).toEqual([
      "2026-09-15 internet#1",
      "2026-09-15 renta#1",
      "2026-09-20 tarjeta#1",
      "2026-10-15 renta#2",
      "2026-10-20 tarjeta#2",
    ]);
  });

  it("produce el mismo resultado sin importar el orden de los compromisos", () => {
    expect(derivarTodosLosVencimientos([internet, tarjeta, renta])).toEqual(
      derivarTodosLosVencimientos([renta, internet, tarjeta]),
    );
  });

  it("devuelve una lista vacia si no hay compromisos", () => {
    expect(derivarTodosLosVencimientos([])).toEqual([]);
  });

  it("rechaza identificadores duplicados", () => {
    expect(() => derivarTodosLosVencimientos([renta, { ...tarjeta, id: "renta" }])).toThrow(RangeError);
  });
});

describe("clasificarVencimientos", () => {
  const referencia = f("2026-09-11");
  const fin = f("2026-11-20");
  const vencimientos = derivarTodosLosVencimientos([
    compromiso("pasado", 100, "2026-09-10", 1),
    compromiso("primero", 100, "2026-09-11", 1),
    compromiso("ultimo", 100, "2026-11-20", 1),
    compromiso("fuera", 100, "2026-11-21", 1),
  ]);

  it("incluye los vencimientos del primer y del ultimo dia del horizonte", () => {
    const { dentro } = clasificarVencimientos(vencimientos, referencia, fin);
    expect(dentro.map((v) => v.compromisoId)).toEqual(["primero", "ultimo"]);
  });

  it("separa los anteriores a la referencia y los posteriores al fin", () => {
    const { anteriores, posteriores } = clasificarVencimientos(vencimientos, referencia, fin);
    expect(anteriores.map((v) => v.compromisoId)).toEqual(["pasado"]);
    expect(posteriores.map((v) => v.compromisoId)).toEqual(["fuera"]);
  });
});

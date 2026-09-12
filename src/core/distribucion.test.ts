import { describe, expect, it } from "vitest";
import { fechaIso, generarSemanas } from "./calendario";
import { distribuir, repartirEnPartesIguales } from "./distribucion";
import { centavos, type Centavos, type Compromiso, type IngresoExtra } from "./tipos";
import { derivarTodosLosVencimientos } from "./vencimientos";

const f = fechaIso;
const pesos = (cantidad: number): Centavos => centavos(Math.round(cantidad * 100));

// Lunes. Las semanas quedan: S1 14-20 sep, S2 21-27 sep, S3 28 sep-4 oct,
// S4 5-11 oct, S5 12-18 oct, S6 19-25 oct.
const REFERENCIA = f("2026-09-14");

function compromiso(id: string, monto: number, fechaLimite: string, ocurrencias = 1): Compromiso {
  return { id, monto: pesos(monto), fechaLimite: f(fechaLimite), ocurrencias };
}

function ingreso(id: string, monto: number, fecha: string): IngresoExtra {
  return { id, monto: pesos(monto), fecha: f(fecha) };
}

function escenario(
  presupuesto: number,
  compromisos: readonly Compromiso[],
  finHorizonte: string,
  ingresosExtra: readonly IngresoExtra[] = [],
) {
  const semanas = generarSemanas(REFERENCIA, 1, f(finHorizonte));
  return distribuir({
    semanas,
    vencimientos: derivarTodosLosVencimientos(compromisos),
    presupuestoSemanal: pesos(presupuesto),
    ingresosExtra,
  });
}

describe("repartirEnPartesIguales", () => {
  it("reparte exacto cuando el monto es divisible", () => {
    expect(repartirEnPartesIguales(pesos(600), 3)).toEqual([20000, 20000, 20000]);
  });

  it("redondeo de centavos: el sobrante va a las primeras partes", () => {
    expect(repartirEnPartesIguales(centavos(10), 3)).toEqual([4, 3, 3]);
    expect(repartirEnPartesIguales(centavos(1), 3)).toEqual([1, 0, 0]);
    expect(repartirEnPartesIguales(centavos(0), 2)).toEqual([0, 0]);
  });

  it("conserva el total repartido en cualquier combinacion", () => {
    for (let monto = 0; monto <= 400; monto += 7) {
      for (let partes = 1; partes <= 28; partes += 1) {
        const trozos = repartirEnPartesIguales(centavos(monto), partes);
        const suma = trozos.reduce((acumulado, trozo) => acumulado + trozo, 0);
        if (suma !== monto || trozos.length !== partes) {
          expect.fail(`Reparto incorrecto de ${monto} en ${partes} partes`);
        }
      }
    }
  });

  it("rechaza un numero de partes invalido y montos negativos", () => {
    expect(() => repartirEnPartesIguales(pesos(100), 0)).toThrow(RangeError);
    expect(() => repartirEnPartesIguales(pesos(100), 2.5)).toThrow(RangeError);
    expect(() => repartirEnPartesIguales(centavos(-1), 2)).toThrow(RangeError);
  });
});

describe("distribuir", () => {
  it("CA-04: con 500 semanales y 600 que vencen en la semana 3, aparta 200 cada semana", () => {
    const asignaciones = escenario(500, [compromiso("tarjeta", 600, "2026-09-30")], "2026-09-30");
    expect(asignaciones).toHaveLength(3);
    for (const asignacion of asignaciones) {
      expect(asignacion.montoApartado).toBe(pesos(200));
      expect(asignacion.remanente).toBe(pesos(300));
    }
    expect(asignaciones[2].montoVencimientos).toBe(pesos(600));
    expect(asignaciones[0].montoVencimientos).toBe(0);
  });

  it("holgura amplia: todas las semanas quedan con remanente positivo", () => {
    const asignaciones = escenario(2000, [compromiso("tarjeta", 600, "2026-09-30")], "2026-09-30");
    expect(asignaciones.every((a) => a.remanente > 0)).toBe(true);
  });

  it("deficit total: el apartado supera lo disponible en todas las semanas", () => {
    const asignaciones = escenario(100, [compromiso("tarjeta", 600, "2026-09-30")], "2026-09-30");
    for (const asignacion of asignaciones) {
      expect(asignacion.montoApartado).toBe(pesos(200));
      expect(asignacion.remanente).toBe(pesos(-100));
    }
  });

  it("presupuesto exactamente igual al total de compromisos: remanente cero", () => {
    const asignaciones = escenario(200, [compromiso("tarjeta", 600, "2026-09-30")], "2026-09-30");
    expect(asignaciones.map((a) => a.remanente)).toEqual([0, 0, 0]);
  });

  it("dos vencimientos en la misma semana se acumulan y se apartan por separado", () => {
    const asignaciones = escenario(
      500,
      [compromiso("tarjeta", 600, "2026-09-30"), compromiso("internet", 300, "2026-10-02")],
      "2026-10-02",
    );
    const tercera = asignaciones[2];
    expect(tercera.montoVencimientos).toBe(pesos(900));
    expect(tercera.vencimientos.map((v) => v.compromisoId)).toEqual(["tarjeta", "internet"]);
    expect(tercera.apartados.map((a) => [a.compromisoId, a.monto])).toEqual([
      ["internet", pesos(100)],
      ["tarjeta", pesos(200)],
    ]);
  });

  it("un vencimiento en la primera semana se aparta completo en esa semana", () => {
    const asignaciones = escenario(500, [compromiso("inscripcion", 400, "2026-09-16")], "2026-09-16");
    expect(asignaciones).toHaveLength(1);
    expect(asignaciones[0].montoApartado).toBe(pesos(400));
  });

  it("la segunda ocurrencia se aparta desde la semana siguiente al vencimiento anterior", () => {
    const asignaciones = escenario(1000, [compromiso("renta", 600, "2026-09-25", 2)], "2026-10-25");
    expect(asignaciones.map((a) => a.montoApartado)).toEqual([
      pesos(300), // S1 y S2 reunen la primera ocurrencia
      pesos(300),
      pesos(150), // S3 a S6 reunen la segunda
      pesos(150),
      pesos(150),
      pesos(150),
    ]);
    expect(asignaciones[5].montoVencimientos).toBe(pesos(600));
  });

  it("ingreso extraordinario: se suma a lo disponible de su semana", () => {
    const asignaciones = escenario(
      500,
      [compromiso("tarjeta", 700, "2026-09-27")],
      "2026-09-27",
      [ingreso("beca", 400, "2026-09-22")],
    );
    expect(asignaciones[0].montoDisponible).toBe(pesos(500));
    expect(asignaciones[1].ingresosExtra).toBe(pesos(400));
    expect(asignaciones[1].montoDisponible).toBe(pesos(900));
  });

  it("lo que sobra en una semana no pasa a la siguiente", () => {
    const asignaciones = escenario(500, [compromiso("colegiatura", 900, "2026-09-27")], "2026-09-27");
    expect(asignaciones[0].remanente).toBe(pesos(50));
    expect(asignaciones[1].montoDisponible).toBe(pesos(500));
  });

  it("lo apartado en el horizonte iguala el total de los vencimientos", () => {
    const asignaciones = escenario(
      800,
      [
        compromiso("renta", 600, "2026-09-25", 2),
        compromiso("tarjeta", 333.33, "2026-10-02", 1),
        compromiso("internet", 149.99, "2026-09-16", 2),
      ],
      "2026-10-25",
    );
    const apartado = asignaciones.reduce((total, a) => total + a.montoApartado, 0);
    const vencido = asignaciones.reduce((total, a) => total + a.montoVencimientos, 0);
    expect(apartado).toBe(vencido);
    expect(apartado).toBe(pesos(600 * 2 + 333.33 + 149.99 * 2));
  });

  it("es determinista y no modifica las entradas", () => {
    const semanas = generarSemanas(REFERENCIA, 1, f("2026-09-30"));
    const vencimientos = Object.freeze(
      derivarTodosLosVencimientos([compromiso("tarjeta", 600, "2026-09-30")]),
    );
    const entrada = { semanas, vencimientos, presupuestoSemanal: pesos(500) };
    expect(distribuir(entrada)).toEqual(distribuir(entrada));
    expect(vencimientos).toHaveLength(1);
  });

  it("rechaza un presupuesto no positivo y un ingreso invalido", () => {
    const semanas = generarSemanas(REFERENCIA, 1, f("2026-09-30"));
    expect(() => distribuir({ semanas, vencimientos: [], presupuestoSemanal: centavos(0) })).toThrow(
      RangeError,
    );
    expect(() =>
      distribuir({
        semanas,
        vencimientos: [],
        presupuestoSemanal: pesos(500),
        ingresosExtra: [ingreso("beca", -100, "2026-09-22")],
      }),
    ).toThrow(RangeError);
  });

  it("rechaza fechas fuera del horizonte recibido", () => {
    const semanas = generarSemanas(REFERENCIA, 1, f("2026-09-30"));
    expect(() =>
      distribuir({
        semanas,
        vencimientos: derivarTodosLosVencimientos([compromiso("tarde", 100, "2026-10-20")]),
        presupuestoSemanal: pesos(500),
      }),
    ).toThrow(RangeError);
  });
});

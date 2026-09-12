import { describe, expect, it } from "vitest";
import { fechaIso } from "./calendario";
import { calcularPlan } from "./plan";
import {
  centavos,
  type Centavos,
  type Compromiso,
  type EntradaPlan,
  type IngresoExtra,
  type MetaAhorro,
} from "./tipos";

const f = fechaIso;
const pesos = (cantidad: number): Centavos => centavos(Math.round(cantidad * 100));

// Lunes. S1 14-20 sep, S2 21-27 sep, S3 28 sep-4 oct, ...
const REFERENCIA = f("2026-09-14");

function compromiso(id: string, monto: number, fechaLimite: string, ocurrencias = 1): Compromiso {
  return { id, monto: pesos(monto), fechaLimite: f(fechaLimite), ocurrencias };
}

function entrada(
  compromisos: readonly Compromiso[],
  extras: {
    presupuesto?: number;
    diaInicioSemana?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    ingresosExtra?: readonly IngresoExtra[];
    metaAhorro?: MetaAhorro | null;
  } = {},
): EntradaPlan {
  return {
    fechaReferencia: REFERENCIA,
    presupuesto: {
      montoSemanal: pesos(extras.presupuesto ?? 500),
      diaInicioSemana: extras.diaInicioSemana ?? 1,
    },
    compromisos,
    ingresosExtra: extras.ingresosExtra,
    metaAhorro: extras.metaAhorro,
  };
}

describe("calcularPlan", () => {
  it("entrada sin meta de ahorro: entrega el plan numerico completo sin evaluacion de meta", () => {
    const plan = calcularPlan(entrada([compromiso("tarjeta", 600, "2026-09-30")]));

    expect(plan.evaluacionMeta).toBeNull();
    expect(plan.inicioHorizonte).toBe("2026-09-14");
    expect(plan.finHorizonte).toBe("2026-09-30");
    expect(plan.asignaciones).toHaveLength(3);
    expect(plan.asignaciones.map((a) => a.montoApartado)).toEqual([
      pesos(200),
      pesos(200),
      pesos(200),
    ]);
    expect(plan.asignaciones.every((a) => a.aporteMeta === 0)).toBe(true);
    expect(plan.advertencias.some((a) => a.tipo.startsWith("meta"))).toBe(false);
  });

  it("marca la semana sobrecargada y la informa con su excedente", () => {
    const plan = calcularPlan(entrada([compromiso("tarjeta", 600, "2026-09-30")]));

    expect(plan.asignaciones.map((a) => a.sobrecargada)).toEqual([false, false, true]);
    expect(plan.advertencias).toContainEqual({
      tipo: "semana-sobrecargada",
      numeroSemana: 3,
      excedente: pesos(100),
    });
  });

  it("compromiso que vence el primer dia del horizonte: se aparta completo en la semana 1", () => {
    const plan = calcularPlan(entrada([compromiso("inscripcion", 400, "2026-09-14")]));

    expect(plan.finHorizonte).toBe("2026-09-14");
    expect(plan.asignaciones).toHaveLength(1);
    expect(plan.asignaciones[0].montoApartado).toBe(pesos(400));
    expect(plan.asignaciones[0].montoVencimientos).toBe(pesos(400));
  });

  it("compromiso que vence el ultimo dia del horizonte: queda dentro y cierra el horizonte", () => {
    const plan = calcularPlan(entrada([compromiso("colegiatura", 1400, "2026-10-31")]));
    const ultima = plan.asignaciones[plan.asignaciones.length - 1];

    expect(plan.finHorizonte).toBe("2026-10-31");
    expect(ultima.fechaInicio <= "2026-10-31" && "2026-10-31" <= ultima.fechaFin).toBe(true);
    expect(ultima.montoVencimientos).toBe(pesos(1400));
    expect(plan.advertencias.some((a) => a.tipo === "vencimiento-fuera-de-horizonte")).toBe(false);
  });

  it("horizonte truncado a 6 meses: los vencimientos posteriores se informan y no se reparten", () => {
    const plan = calcularPlan(entrada([compromiso("renta", 1000, "2026-11-20", 6)]));

    expect(plan.finHorizonte).toBe("2027-03-14");
    expect(plan.advertencias.filter((a) => a.tipo === "vencimiento-fuera-de-horizonte")).toEqual([
      {
        tipo: "vencimiento-fuera-de-horizonte",
        compromisoId: "renta",
        ocurrencia: 5,
        fecha: "2027-03-20",
      },
      {
        tipo: "vencimiento-fuera-de-horizonte",
        compromisoId: "renta",
        ocurrencia: 6,
        fecha: "2027-04-20",
      },
    ]);
    const apartado = plan.asignaciones.reduce((total, a) => total + a.montoApartado, 0);
    expect(apartado).toBe(pesos(4000));
  });

  it("informa los vencimientos anteriores a la fecha de referencia sin repartirlos", () => {
    const plan = calcularPlan(
      entrada([compromiso("atrasado", 300, "2026-09-13"), compromiso("tarjeta", 600, "2026-09-30")]),
    );

    expect(plan.advertencias).toContainEqual({
      tipo: "vencimiento-anterior-a-referencia",
      compromisoId: "atrasado",
      ocurrencia: 1,
      fecha: "2026-09-13",
    });
    const apartado = plan.asignaciones.reduce((total, a) => total + a.montoApartado, 0);
    expect(apartado).toBe(pesos(600));
  });

  it("informa los ingresos fuera del horizonte y suma los de dentro", () => {
    const plan = calcularPlan(
      entrada([compromiso("tarjeta", 700, "2026-09-27")], {
        ingresosExtra: [
          { id: "beca", monto: pesos(400), fecha: f("2026-09-22") },
          { id: "aguinaldo", monto: pesos(2000), fecha: f("2026-12-20") },
        ],
      }),
    );

    expect(plan.asignaciones[1].montoDisponible).toBe(pesos(900));
    expect(plan.asignaciones[1].sobrecargada).toBe(false);
    expect(plan.advertencias).toContainEqual({
      tipo: "ingreso-fuera-de-horizonte",
      ingresoId: "aguinaldo",
      fecha: "2026-12-20",
    });
  });

  it("SC-01: la fecha objetivo de la meta extiende el horizonte mas alla del ultimo vencimiento", () => {
    const plan = calcularPlan(
      entrada([compromiso("tarjeta", 600, "2026-09-30")], {
        presupuesto: 1000,
        metaAhorro: { montoObjetivo: pesos(1000), fechaObjetivo: f("2026-11-15") },
      }),
    );

    expect(plan.finHorizonte).toBe("2026-11-15");
    expect(plan.evaluacionMeta?.viable).toBe(true);
    const aportado = plan.asignaciones.reduce((total, a) => total + a.aporteMeta, 0);
    expect(aportado).toBe(pesos(1000));
    expect(plan.advertencias.some((a) => a.tipo === "meta-no-alcanzable")).toBe(false);
  });

  it("meta no alcanzable: informa el faltante y reparte todo lo que se puede ahorrar", () => {
    const plan = calcularPlan(
      entrada([compromiso("tarjeta", 450, "2026-09-30")], {
        presupuesto: 500,
        metaAhorro: { montoObjetivo: pesos(2000), fechaObjetivo: f("2026-09-30") },
      }),
    );

    // Tres semanas con 500 disponibles y 150 apartados dejan 1050 de ahorro posible.
    expect(plan.evaluacionMeta?.viable).toBe(false);
    expect(plan.evaluacionMeta?.ahorroPosible).toBe(pesos(1050));
    expect(plan.evaluacionMeta?.faltante).toBe(pesos(950));
    expect(plan.advertencias).toContainEqual({
      tipo: "meta-no-alcanzable",
      faltante: pesos(950),
    });
    const aportado = plan.asignaciones.reduce((total, a) => total + a.aporteMeta, 0);
    expect(aportado).toBe(pesos(1050));
  });

  it("meta con fecha posterior al tope de seis meses: se evalua truncada y se advierte", () => {
    const plan = calcularPlan(
      entrada([compromiso("tarjeta", 600, "2026-09-30")], {
        metaAhorro: { montoObjetivo: pesos(100000), fechaObjetivo: f("2027-09-30") },
      }),
    );

    expect(plan.finHorizonte).toBe("2027-03-14");
    expect(plan.advertencias).toContainEqual({
      tipo: "meta-fuera-de-horizonte",
      fechaObjetivo: "2027-09-30",
      finHorizonte: "2027-03-14",
    });
    expect(plan.evaluacionMeta?.viable).toBe(false);
  });

  it("dia de inicio distinto de lunes: las semanas arrancan el dia configurado", () => {
    const plan = calcularPlan(
      entrada([compromiso("tarjeta", 600, "2026-09-30")], { diaInicioSemana: 4 }),
    );

    expect(plan.inicioHorizonte).toBe("2026-09-10");
    expect(plan.asignaciones.map((a) => a.fechaInicio)).toEqual([
      "2026-09-10",
      "2026-09-17",
      "2026-09-24",
    ]);
  });

  it("es determinista y no modifica la entrada recibida", () => {
    const datos = Object.freeze(
      entrada([compromiso("renta", 600, "2026-09-25", 2)], {
        metaAhorro: { montoObjetivo: pesos(300), fechaObjetivo: f("2026-10-25") },
      }),
    );

    expect(calcularPlan(datos)).toEqual(calcularPlan(datos));
    expect(datos.compromisos).toHaveLength(1);
  });

  it("rechaza una entrada sin compromisos o con fecha de referencia invalida", () => {
    expect(() => calcularPlan(entrada([]))).toThrow(RangeError);
    expect(() =>
      calcularPlan({
        ...entrada([compromiso("tarjeta", 600, "2026-09-30")]),
        fechaReferencia: "2026-02-30" as typeof REFERENCIA,
      }),
    ).toThrow(RangeError);
  });
});

import { describe, expect, it } from "vitest";
import { fechaIso, generarSemanas } from "./calendario";
import { distribuir } from "./distribucion";
import {
  construirAdvertencias,
  detectarSemanasEnDeficit,
  detectarSemanasSobrecargadas,
  evaluarMeta,
} from "./evaluacion";
import { centavos, type AsignacionCalculada, type Centavos } from "./tipos";
import { derivarTodosLosVencimientos } from "./vencimientos";

const f = fechaIso;
const pesos = (cantidad: number): Centavos => centavos(Math.round(cantidad * 100));

// Ocho semanas de lunes a domingo desde el 14 de septiembre de 2026.
const SEMANAS = generarSemanas(f("2026-09-14"), 1, f("2026-11-08"));

interface DatosSemana {
  readonly disponible: number;
  readonly apartado: number;
  readonly vence?: number;
}

function asignacion(numeroSemana: number, datos: DatosSemana): AsignacionCalculada {
  const semana = SEMANAS[numeroSemana - 1];
  return {
    numeroSemana,
    fechaInicio: semana.inicio,
    fechaFin: semana.fin,
    presupuesto: pesos(datos.disponible),
    ingresosExtra: centavos(0),
    montoDisponible: pesos(datos.disponible),
    montoApartado: pesos(datos.apartado),
    montoVencimientos: pesos(datos.vence ?? 0),
    remanente: centavos(pesos(datos.disponible) - pesos(datos.apartado)),
    apartados: [],
    vencimientos: [],
  };
}

/** Ocho semanas con 500 disponibles y 425 apartados: 75 de remanente cada una. */
function ochoSemanasConRemanente(remanentePorSemana = 75): AsignacionCalculada[] {
  return SEMANAS.map((semana) =>
    asignacion(semana.numero, { disponible: 500, apartado: 500 - remanentePorSemana }),
  );
}

describe("detectarSemanasSobrecargadas", () => {
  it("CA-05: una semana con 700 de vencimientos y 500 disponibles queda marcada", () => {
    const asignaciones = [
      asignacion(1, { disponible: 500, apartado: 350 }),
      asignacion(2, { disponible: 500, apartado: 350, vence: 700 }),
    ];
    expect(detectarSemanasSobrecargadas(asignaciones)).toEqual([2]);
  });

  it("no marca la semana cuando los vencimientos igualan lo disponible", () => {
    const asignaciones = [asignacion(1, { disponible: 500, apartado: 500, vence: 500 })];
    expect(detectarSemanasSobrecargadas(asignaciones)).toEqual([]);
  });

  it("ingreso extraordinario que rescata una semana: deja de estar sobrecargada", () => {
    const semanas = generarSemanas(f("2026-09-14"), 1, f("2026-09-27"));
    const vencimientos = derivarTodosLosVencimientos([
      { id: "tarjeta", monto: pesos(700), fechaLimite: f("2026-09-27"), ocurrencias: 1 },
    ]);
    const sinIngreso = distribuir({ semanas, vencimientos, presupuestoSemanal: pesos(500) });
    expect(detectarSemanasSobrecargadas(sinIngreso)).toEqual([2]);

    const conIngreso = distribuir({
      semanas,
      vencimientos,
      presupuestoSemanal: pesos(500),
      ingresosExtra: [{ id: "beca", monto: pesos(400), fecha: f("2026-09-22") }],
    });
    expect(detectarSemanasSobrecargadas(conIngreso)).toEqual([]);
    expect(conIngreso[1].montoDisponible).toBe(pesos(900));
  });
});

describe("detectarSemanasEnDeficit", () => {
  it("marca solo las semanas cuyo apartado supera lo disponible", () => {
    const asignaciones = [
      asignacion(1, { disponible: 500, apartado: 600 }),
      asignacion(2, { disponible: 500, apartado: 500 }),
      asignacion(3, { disponible: 500, apartado: 400 }),
    ];
    expect(detectarSemanasEnDeficit(asignaciones)).toEqual([1]);
  });

  it("una semana puede estar en deficit sin estar sobrecargada", () => {
    const asignaciones = [asignacion(1, { disponible: 500, apartado: 600, vence: 0 })];
    expect(detectarSemanasEnDeficit(asignaciones)).toEqual([1]);
    expect(detectarSemanasSobrecargadas(asignaciones)).toEqual([]);
  });
});

describe("evaluarMeta", () => {
  it("CA-06: meta de 1000 con 600 de excedente disponible no es alcanzable e indica el faltante", () => {
    const evaluacion = evaluarMeta(ochoSemanasConRemanente(75), {
      montoObjetivo: pesos(1000),
      fechaObjetivo: f("2026-11-08"),
    });
    expect(evaluacion.viable).toBe(false);
    expect(evaluacion.ahorroPosible).toBe(pesos(600));
    expect(evaluacion.faltante).toBe(pesos(400));
  });

  it("meta alcanzable: reparte el objetivo entre las semanas y no deja faltante", () => {
    const evaluacion = evaluarMeta(ochoSemanasConRemanente(75), {
      montoObjetivo: pesos(500),
      fechaObjetivo: f("2026-11-08"),
    });
    expect(evaluacion.viable).toBe(true);
    expect(evaluacion.faltante).toBe(0);
    expect(evaluacion.aportes).toHaveLength(8);
    expect(evaluacion.aportes.every((aporte) => aporte.monto === pesos(62.5))).toBe(true);
    const total = evaluacion.aportes.reduce((suma, aporte) => suma + aporte.monto, 0);
    expect(total).toBe(pesos(500));
  });

  it("completa la meta cuando la capacidad esta concentrada en una sola semana", () => {
    const asignaciones = [
      asignacion(1, { disponible: 1500, apartado: 500 }),
      ...SEMANAS.slice(1).map((semana) =>
        asignacion(semana.numero, { disponible: 500, apartado: 500 }),
      ),
    ];
    const evaluacion = evaluarMeta(asignaciones, {
      montoObjetivo: pesos(800),
      fechaObjetivo: f("2026-11-08"),
    });
    expect(evaluacion.viable).toBe(true);
    expect(evaluacion.aportes).toEqual([{ numeroSemana: 1, monto: pesos(800) }]);
  });

  it("ignora las semanas que inician despues de la fecha objetivo", () => {
    const evaluacion = evaluarMeta(ochoSemanasConRemanente(75), {
      montoObjetivo: pesos(1000),
      fechaObjetivo: f("2026-09-30"),
    });
    // Solo las semanas 1 a 3 inician antes del 30 de septiembre.
    expect(evaluacion.ahorroPosible).toBe(pesos(225));
    expect(evaluacion.faltante).toBe(pesos(775));
  });

  it("una fecha objetivo anterior al horizonte deja el ahorro en cero", () => {
    const evaluacion = evaluarMeta(ochoSemanasConRemanente(75), {
      montoObjetivo: pesos(1000),
      fechaObjetivo: f("2026-09-13"),
    });
    expect(evaluacion.ahorroPosible).toBe(0);
    expect(evaluacion.aportes).toEqual([]);
    expect(evaluacion.faltante).toBe(pesos(1000));
  });

  it("las semanas en deficit no aportan al ahorro", () => {
    const asignaciones = [
      asignacion(1, { disponible: 500, apartado: 800 }),
      asignacion(2, { disponible: 500, apartado: 300 }),
    ];
    const evaluacion = evaluarMeta(asignaciones, {
      montoObjetivo: pesos(300),
      fechaObjetivo: f("2026-11-08"),
    });
    expect(evaluacion.ahorroPosible).toBe(pesos(200));
    expect(evaluacion.aportes).toEqual([{ numeroSemana: 2, monto: pesos(200) }]);
  });

  it("reparte sin exceder el objetivo cuando no divide exacto entre las semanas", () => {
    const evaluacion = evaluarMeta(ochoSemanasConRemanente(75), {
      montoObjetivo: centavos(103),
      fechaObjetivo: f("2026-11-08"),
    });
    const total = evaluacion.aportes.reduce((suma, aporte) => suma + aporte.monto, 0);
    expect(total).toBe(103);
    expect(evaluacion.aportes.map((aporte) => aporte.monto)).toEqual([13, 13, 13, 13, 13, 13, 13, 12]);
  });

  it("lo repartido iguala siempre el ahorro comprometido y respeta cada remanente", () => {
    const capacidadesPorCaso = [
      [75, 75, 75, 75, 75, 75, 75, 75],
      [1000, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1000],
      [10, 200, 0, 45, 0, 300, 7, 1],
    ];
    for (const capacidades of capacidadesPorCaso) {
      const asignaciones = capacidades.map((remanente, indice) =>
        asignacion(indice + 1, { disponible: 1000, apartado: 1000 - remanente }),
      );
      for (const objetivo of [1, 37, 103, 250, 600, 1000, 5000]) {
        const evaluacion = evaluarMeta(asignaciones, {
          montoObjetivo: pesos(objetivo),
          fechaObjetivo: f("2026-11-08"),
        });
        const total = evaluacion.aportes.reduce((suma, aporte) => suma + aporte.monto, 0);
        const comprometido = Math.min(pesos(objetivo), evaluacion.ahorroPosible);
        if (total !== comprometido) {
          expect.fail(`Objetivo ${objetivo}: reparte ${total} y deberia repartir ${comprometido}`);
        }
        for (const aporte of evaluacion.aportes) {
          const disponible = pesos(capacidades[aporte.numeroSemana - 1]);
          if (aporte.monto > disponible) {
            expect.fail(`Semana ${aporte.numeroSemana}: aporta ${aporte.monto} con ${disponible}`);
          }
        }
      }
    }
  });

  it("rechaza una meta con monto no positivo o fecha invalida", () => {
    const asignaciones = ochoSemanasConRemanente();
    expect(() =>
      evaluarMeta(asignaciones, { montoObjetivo: centavos(0), fechaObjetivo: f("2026-11-08") }),
    ).toThrow(RangeError);
    expect(() =>
      evaluarMeta(asignaciones, {
        montoObjetivo: pesos(100),
        fechaObjetivo: "2026-11-31" as ReturnType<typeof f>,
      }),
    ).toThrow(RangeError);
  });
});

describe("construirAdvertencias", () => {
  const finHorizonte = f("2026-11-08");

  it("informa sobrecarga y deficit con su importe, en orden de semana", () => {
    const asignaciones = [
      asignacion(1, { disponible: 500, apartado: 600, vence: 700 }),
      asignacion(2, { disponible: 500, apartado: 400 }),
    ];
    expect(construirAdvertencias(asignaciones, null, finHorizonte)).toEqual([
      { tipo: "semana-sobrecargada", numeroSemana: 1, excedente: pesos(200) },
      { tipo: "semana-en-deficit", numeroSemana: 1, faltante: pesos(100) },
    ]);
  });

  it("no genera advertencias de meta cuando la entrada no trae meta de ahorro", () => {
    const asignaciones = ochoSemanasConRemanente();
    expect(construirAdvertencias(asignaciones, null, finHorizonte)).toEqual([]);
  });

  it("informa la meta no alcanzable y la fecha objetivo fuera del horizonte", () => {
    const asignaciones = ochoSemanasConRemanente(75);
    const evaluacion = evaluarMeta(asignaciones, {
      montoObjetivo: pesos(1000),
      fechaObjetivo: f("2026-12-20"),
    });
    expect(construirAdvertencias(asignaciones, evaluacion, finHorizonte)).toEqual([
      { tipo: "meta-no-alcanzable", faltante: pesos(400) },
      {
        tipo: "meta-fuera-de-horizonte",
        fechaObjetivo: "2026-12-20",
        finHorizonte: "2026-11-08",
      },
    ]);
  });

  it("no advierte nada cuando la meta es viable y esta dentro del horizonte", () => {
    const asignaciones = ochoSemanasConRemanente(75);
    const evaluacion = evaluarMeta(asignaciones, {
      montoObjetivo: pesos(500),
      fechaObjetivo: finHorizonte,
    });
    expect(construirAdvertencias(asignaciones, evaluacion, finHorizonte)).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { fechaIso } from "@/core/calendario";
import { calcularPlan } from "@/core/plan";
import { centavos, type EntradaPlan } from "@/core/tipos";
import {
  esUuid,
  filaAResumen,
  filasAEntrada,
  filasAPlan,
  planAFilas,
  type FilaPlanLeida,
} from "./filas";

const f = fechaIso;
const pesos = (cantidad: number) => centavos(Math.round(cantidad * 100));

const ESCENARIOS: Record<string, EntradaPlan> = {
  "sin meta y con semana sobrecargada": {
    fechaReferencia: f("2026-09-14"),
    presupuesto: { montoSemanal: pesos(500), diaInicioSemana: 1 },
    compromisos: [{ id: "tarjeta", monto: pesos(600), fechaLimite: f("2026-09-30"), ocurrencias: 1 }],
  },
  "con meta viable, ingresos y centavos repartidos": {
    fechaReferencia: f("2026-09-14"),
    presupuesto: { montoSemanal: pesos(500), diaInicioSemana: 1 },
    compromisos: [
      { id: "tarjeta", monto: pesos(600), fechaLimite: f("2026-09-30"), ocurrencias: 3 },
      { id: "internet", monto: pesos(333.33), fechaLimite: f("2026-10-05"), ocurrencias: 2 },
    ],
    ingresosExtra: [{ id: "beca", monto: pesos(750.5), fecha: f("2026-10-01") }],
    metaAhorro: { montoObjetivo: pesos(1000), fechaObjetivo: f("2026-11-30") },
  },
  "con deficit, meta no alcanzable y advertencias de horizonte": {
    fechaReferencia: f("2026-09-10"),
    presupuesto: { montoSemanal: pesos(100), diaInicioSemana: 3 },
    compromisos: [
      { id: "renta", monto: pesos(1500), fechaLimite: f("2026-10-20"), ocurrencias: 6 },
      { id: "atrasado", monto: pesos(200), fechaLimite: f("2026-09-01"), ocurrencias: 1 },
    ],
    ingresosExtra: [{ id: "aguinaldo", monto: pesos(3000), fecha: f("2027-12-20") }],
    metaAhorro: { montoObjetivo: pesos(50000), fechaObjetivo: f("2027-12-31") },
  },
};

/**
 * Simula lo que devuelve PostgREST: serializa las filas a JSON, como jsonb y como
 * respuesta HTTP, y altera el orden de las semanas, que la consulta no garantiza.
 */
function comoLecturaDeBaseDeDatos(entrada: EntradaPlan): FilaPlanLeida {
  const filas = planAFilas(calcularPlan(entrada));
  const serializadas = JSON.parse(JSON.stringify(filas)) as typeof filas;
  return {
    ...serializadas.plan,
    id: "0b9e8d6a-2f4c-4f7a-9b1e-3c5d7e9f1a2b",
    generado_en: "2026-09-17T18:00:00+00:00",
    explicacion: null,
    asignaciones_semanales: [...serializadas.asignaciones].reverse(),
  };
}

describe("planAFilas y filasAPlan", () => {
  it.each(Object.entries(ESCENARIOS))("el plan %s vuelve identico de la base de datos", (_nombre, entrada) => {
    expect(filasAPlan(comoLecturaDeBaseDeDatos(entrada))).toEqual(calcularPlan(entrada));
  });

  it("los escenarios cubren los casos que la conversion debe preservar", () => {
    const planes = Object.values(ESCENARIOS).map((entrada) => calcularPlan(entrada));
    const asignaciones = planes.flatMap((plan) => plan.asignaciones);
    expect(planes.some((plan) => plan.evaluacionMeta === null)).toBe(true);
    expect(planes.some((plan) => plan.evaluacionMeta?.viable === true)).toBe(true);
    expect(planes.some((plan) => plan.evaluacionMeta?.viable === false)).toBe(true);
    expect(asignaciones.some((asignacion) => asignacion.remanente < 0)).toBe(true);
    expect(asignaciones.some((asignacion) => asignacion.ingresosExtra > 0)).toBe(true);
    expect(planes.flatMap((plan) => plan.advertencias).length).toBeGreaterThan(3);
  });

  it("escribe los importes como texto con dos decimales para la funcion guardar_plan", () => {
    const { plan, asignaciones } = planAFilas(calcularPlan(ESCENARIOS["con meta viable, ingresos y centavos repartidos"]));
    expect(plan.meta_monto_objetivo).toBe("1000.00");
    for (const asignacion of asignaciones) {
      for (const importe of [asignacion.monto_apartado, asignacion.remanente, asignacion.aporte_meta]) {
        expect(importe).toMatch(/^-?\d+\.\d{2}$/);
      }
    }
  });

  it("rechaza una fila con importes, fechas o advertencias corruptas", () => {
    const valida = comoLecturaDeBaseDeDatos(ESCENARIOS["sin meta y con semana sobrecargada"]);
    const [primera, ...resto] = valida.asignaciones_semanales;

    expect(() =>
      filasAPlan({ ...valida, asignaciones_semanales: [{ ...primera, remanente: "300.5" }, ...resto] }),
    ).toThrow(RangeError);
    expect(() => filasAPlan({ ...valida, fecha_referencia: "2026-02-30" })).toThrow(RangeError);
    expect(() =>
      filasAPlan({ ...valida, advertencias: [{ tipo: "desconocida" }] as unknown as FilaPlanLeida["advertencias"] }),
    ).toThrow(RangeError);
  });

  it("rechaza un plan con meta evaluada pero sin sus importes", () => {
    const conMeta = comoLecturaDeBaseDeDatos(ESCENARIOS["con meta viable, ingresos y centavos repartidos"]);
    expect(() => filasAPlan({ ...conMeta, ahorro_posible: null })).toThrow(/ahorro_posible/);
  });
});

describe("filaAResumen", () => {
  it("toma el numero de semanas del conteo agregado", () => {
    const resumen = filaAResumen({
      id: "0b9e8d6a-2f4c-4f7a-9b1e-3c5d7e9f1a2b",
      generado_en: "2026-09-17T18:00:00+00:00",
      fecha_referencia: "2026-09-14",
      inicio_horizonte: "2026-09-14",
      fin_horizonte: "2026-09-30",
      meta_viable: null,
      asignaciones_semanales: [{ count: 3 }],
    });
    expect(resumen.semanas).toBe(3);
    expect(resumen.metaViable).toBeNull();
  });
});

describe("filasAEntrada", () => {
  const presupuesto = { monto_semanal: "500.00", dia_inicio_semana: 1 };
  const compromisos = [{ id: "c1", monto: "600.00", fecha_limite: "2026-09-30", ocurrencias: 3 }];

  it("reconstruye una entrada que el motor acepta", () => {
    const entrada = filasAEntrada(
      f("2026-09-14"),
      presupuesto,
      compromisos,
      [{ id: "i1", monto: "750.50", fecha: "2026-10-01" }],
      { monto_objetivo: "1000.00", fecha_objetivo: "2026-11-30" },
    );
    expect(entrada?.presupuesto.montoSemanal).toBe(50000);
    expect(entrada?.ingresosExtra?.[0].monto).toBe(75050);
    expect(() => calcularPlan(entrada as EntradaPlan)).not.toThrow();
  });

  it("devuelve null sin presupuesto o sin compromisos (regla de negocio 6)", () => {
    expect(filasAEntrada(f("2026-09-14"), null, compromisos, [], null)).toBeNull();
    expect(filasAEntrada(f("2026-09-14"), presupuesto, [], [], null)).toBeNull();
  });

  it("rechaza un dia de inicio de semana fuera de rango", () => {
    expect(() =>
      filasAEntrada(f("2026-09-14"), { ...presupuesto, dia_inicio_semana: 7 }, compromisos, [], null),
    ).toThrow(RangeError);
  });
});

describe("esUuid", () => {
  it("distingue identificadores validos antes de consultar la base de datos", () => {
    expect(esUuid("0b9e8d6a-2f4c-4f7a-9b1e-3c5d7e9f1a2b")).toBe(true);
    expect(esUuid("123")).toBe(false);
    expect(esUuid("0b9e8d6a-2f4c-4f7a-9b1e-3c5d7e9f1a2b' or '1'='1")).toBe(false);
  });
});

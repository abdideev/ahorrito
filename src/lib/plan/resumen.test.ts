import { describe, expect, it } from "vitest";
import { fechaIso } from "@/core/calendario";
import { calcularPlan } from "@/core/plan";
import { centavos, type EntradaPlan } from "@/core/tipos";
import { resumirPlan } from "./resumen";

const BASE: EntradaPlan = {
  fechaReferencia: fechaIso("2026-09-14"),
  presupuesto: { montoSemanal: centavos(50_000), diaInicioSemana: 1 },
  compromisos: [
    { id: "renta", monto: centavos(60_000), fechaLimite: fechaIso("2026-09-30"), ocurrencias: 3 },
    { id: "internet", monto: centavos(40_000), fechaLimite: fechaIso("2026-10-05"), ocurrencias: 2 },
  ],
};

describe("resumirPlan", () => {
  it("coincide con la suma de la tabla semanal", () => {
    const plan = calcularPlan(BASE);
    const resumen = resumirPlan(plan);

    expect(resumen.semanas).toBe(plan.asignaciones.length);
    expect(resumen.totalApartado).toBe(
      plan.asignaciones.reduce((total, semana) => total + semana.montoApartado, 0),
    );
    expect(resumen.primeraSemana).toBe(plan.asignaciones[0]);
  });

  it("reparte cada semana en una sola categoria de estado", () => {
    const resumen = resumirPlan(calcularPlan(BASE));

    expect(resumen.semanasAlDia + resumen.semanasCargaAlta + resumen.semanasSinAlcance).toBe(
      resumen.semanas,
    );
  });

  it("cuenta como sin alcance las semanas en deficit", () => {
    const plan = calcularPlan({
      ...BASE,
      presupuesto: { montoSemanal: centavos(10_000), diaInicioSemana: 1 },
    });

    expect(resumirPlan(plan).semanasSinAlcance).toBe(
      plan.asignaciones.filter((semana) => semana.enDeficit).length,
    );
    expect(resumirPlan(plan).semanasSinAlcance).toBeGreaterThan(0);
  });

  it("sin meta de ahorro deja el avance en nulo y el aporte en cero", () => {
    const resumen = resumirPlan(calcularPlan(BASE));

    expect(resumen.avanceMeta).toBeNull();
    expect(resumen.totalMeta).toBe(0);
  });

  it("limita el avance de una meta holgada a 1", () => {
    const plan = calcularPlan({
      ...BASE,
      metaAhorro: { montoObjetivo: centavos(100), fechaObjetivo: fechaIso("2026-11-30") },
    });

    expect(resumirPlan(plan).avanceMeta).toBe(1);
  });

  it("expresa una meta inalcanzable como fraccion menor que 1", () => {
    const plan = calcularPlan({
      ...BASE,
      metaAhorro: { montoObjetivo: centavos(100_000_000), fechaObjetivo: fechaIso("2026-11-30") },
    });
    const avance = resumirPlan(plan).avanceMeta;

    expect(avance).not.toBeNull();
    expect(avance).toBeGreaterThanOrEqual(0);
    expect(avance).toBeLessThan(1);
  });
});

import { describe, expect, it } from "vitest";
import { fechaIso } from "@/core/calendario";
import { calcularPlan } from "@/core/plan";
import { centavos, type Centavos, type Compromiso, type EntradaPlan } from "@/core/tipos";
import { conDenominaciones, etiquetasDeCompromisos } from "./etiquetas";

const f = fechaIso;
const pesos = (cantidad: number): Centavos => centavos(Math.round(cantidad * 100));

const RENTA = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
const TARJETA = "3f2b8c1e-9a4d-4e7b-b1c2-5d6e7f8a9b0c";

function compromiso(id: string, monto: number, fechaLimite: string, ocurrencias = 1): Compromiso {
  return { id, monto: pesos(monto), fechaLimite: f(fechaLimite), ocurrencias };
}

function entrada(compromisos: readonly Compromiso[]): EntradaPlan {
  return {
    fechaReferencia: f("2026-09-14"),
    presupuesto: { montoSemanal: pesos(500), diaInicioSemana: 1 },
    compromisos,
  };
}

describe("etiquetasDeCompromisos", () => {
  it("numera por orden de primera aparicion en el plan", () => {
    // La renta vence antes, así que aparece primero aunque se registre después.
    const plan = calcularPlan(entrada([compromiso(TARJETA, 600, "2026-09-30"), compromiso(RENTA, 700, "2026-09-16")]));

    expect([...etiquetasDeCompromisos(plan).entries()]).toEqual([
      [RENTA, "Compromiso 1"],
      [TARJETA, "Compromiso 2"],
    ]);
  });

  it("da la misma etiqueta al mismo compromiso en todas las semanas", () => {
    const plan = calcularPlan(entrada([compromiso(TARJETA, 600, "2026-09-30", 3)]));

    expect(etiquetasDeCompromisos(plan).get(TARJETA)).toBe("Compromiso 1");
    expect(etiquetasDeCompromisos(plan).size).toBe(1);
  });

  it("incluye los compromisos que solo aparecen en las advertencias", () => {
    const plan = calcularPlan(entrada([compromiso(RENTA, 700, "2026-09-10")]));

    expect(plan.advertencias.some((a) => a.tipo === "vencimiento-anterior-a-referencia")).toBe(true);
    expect(etiquetasDeCompromisos(plan).get(RENTA)).toBe("Compromiso 1");
  });
});

describe("conDenominaciones", () => {
  const plan = calcularPlan(entrada([compromiso(RENTA, 700, "2026-09-16"), compromiso(TARJETA, 600, "2026-09-30")]));
  const denominaciones = { [RENTA]: "Renta del cuarto", [TARJETA]: "Tarjeta departamental" };

  it("sustituye la etiqueta por la denominacion del usuario", () => {
    const texto = "Aparta 350 para el Compromiso 1 y 200 para el Compromiso 2.";

    expect(conDenominaciones(texto, plan, denominaciones)).toBe(
      'Aparta 350 para el "Renta del cuarto" y 200 para el "Tarjeta departamental".',
    );
  });

  it("sustituye todas las apariciones de la misma etiqueta", () => {
    const texto = "Compromiso 1 vence pronto; prioriza Compromiso 1.";

    expect(conDenominaciones(texto, plan, denominaciones)).toBe(
      '"Renta del cuarto" vence pronto; prioriza "Renta del cuarto".',
    );
  });

  it("deja intacto el texto si no menciona etiquetas", () => {
    const texto = "Tu plan cubre todos los pagos a tiempo.";

    expect(conDenominaciones(texto, plan, denominaciones)).toBe(texto);
  });

  it("conserva la etiqueta cuando el compromiso ya no existe en la captura", () => {
    expect(conDenominaciones("Revisa el Compromiso 2.", plan, { [RENTA]: "Renta del cuarto" })).toBe(
      "Revisa el Compromiso 2.",
    );
  });

  it("no confunde Compromiso 1 con Compromiso 12", () => {
    const muchos = Array.from({ length: 12 }, (_, indice) =>
      compromiso(`${indice}`.padStart(8, "0") + "-0000-4000-8000-000000000000", 100, "2026-09-16"),
    );
    const planMuchos = calcularPlan(entrada(muchos));
    const ids = [...etiquetasDeCompromisos(planMuchos).keys()];
    const nombres = { [ids[0]]: "Primero", [ids[11]]: "Doceavo" };

    expect(conDenominaciones("Compromiso 12 y Compromiso 1", planMuchos, nombres)).toBe(
      '"Doceavo" y "Primero"',
    );
  });
});

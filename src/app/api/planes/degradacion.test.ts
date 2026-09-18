/**
 * Degradación del orquestador cuando el servicio de IA falla (RNF-03, CA-09).
 *
 * Criterio de aceptación: "Con la clave del servicio de inteligencia artificial
 * deshabilitada, 5 de 5 solicitudes devuelven el plan numérico con el aviso
 * correspondiente." El aviso es la línea `explicacion` con valor null.
 *
 * Se usa el adaptador real de Gemini con `fetch` simulado, para que la prueba recorra
 * el mismo camino que en producción: orquestador → adaptador → null.
 */

import { describe, expect, it, vi } from "vitest";
import { crearServicioGemini } from "@/adapters/ia/gemini";
import { fechaIso } from "@/core/calendario";
import { calcularPlan } from "@/core/plan";
import { centavos, type EntradaPlan } from "@/core/tipos";
import type { ServicioExplicacion } from "@/ports/explicacion";
import type { RepositorioPlanes } from "@/ports/repositorio";
import { generarPlan, type LineaFlujo } from "./orquestador";

const REFERENCIA = fechaIso("2026-09-14");
const ID_PLAN = "5b1c0e7a-2d4f-4a8b-9c3e-6f7a8b9c0d1e";

const ENTRADA: EntradaPlan = {
  fechaReferencia: REFERENCIA,
  presupuesto: { montoSemanal: centavos(50_000), diaInicioSemana: 1 },
  compromisos: [
    { id: "c1", monto: centavos(60_000), fechaLimite: fechaIso("2026-09-30"), ocurrencias: 3 },
    { id: "c2", monto: centavos(70_000), fechaLimite: fechaIso("2026-09-16"), ocurrencias: 1 },
  ],
  metaAhorro: { montoObjetivo: centavos(300_000), fechaObjetivo: fechaIso("2026-11-30") },
};
const PLAN_ESPERADO = calcularPlan(ENTRADA);

function repositorioFalso() {
  return {
    obtenerDatosEntrada: vi.fn(async () => ENTRADA),
    guardarPlan: vi.fn(async () => ID_PLAN),
    guardarExplicacion: vi.fn(async () => true),
    listarPlanes: vi.fn(async () => []),
    obtenerPlan: vi.fn(async () => null),
  } satisfies RepositorioPlanes;
}

/** Ejecuta una solicitud completa y devuelve todas las líneas del flujo. */
async function solicitar(
  explicacion: ServicioExplicacion,
  repositorio: RepositorioPlanes = repositorioFalso(),
  registrarFallo?: (mensaje: string, error: unknown) => void,
): Promise<LineaFlujo[]> {
  const resultado = await generarPlan(
    { repositorio, explicacion, registrarFallo },
    { fechaReferencia: REFERENCIA, explicar: true },
  );
  if (resultado.estado !== "generado") throw new Error("se esperaba un plan");
  const texto = await new Response(resultado.flujo).text();
  return texto
    .trim()
    .split("\n")
    .map((linea) => JSON.parse(linea) as LineaFlujo);
}

const PLAN_COMPLETO_SIN_EXPLICACION: LineaFlujo[] = [
  { tipo: "plan", id: ID_PLAN, plan: PLAN_ESPERADO },
  { tipo: "explicacion", explicacion: null },
];

const sinRegistro = () => {};

describe("CA-09 · plan numerico con el servicio de IA deshabilitado", () => {
  it("5 de 5 solicitudes sin clave entregan el plan completo y la explicacion nula", async () => {
    const fetchSimulado = vi.fn<typeof fetch>();
    const servicio = crearServicioGemini({ claveApi: undefined, fetch: fetchSimulado, registrar: sinRegistro });

    const ejecuciones = await Promise.all(Array.from({ length: 5 }, () => solicitar(servicio)));

    for (const lineas of ejecuciones) {
      expect(lineas).toEqual(PLAN_COMPLETO_SIN_EXPLICACION);
    }
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it.each([
    ["clave rechazada (HTTP 403)", 403],
    ["cuota agotada (HTTP 429, RSG-01)", 429],
    ["servicio caido (HTTP 503)", 503],
  ])("con %s entrega el plan completo y la explicacion nula", async (_caso, estado) => {
    const servicio = crearServicioGemini({
      claveApi: "clave-de-prueba",
      fetch: vi.fn<typeof fetch>(async () => new Response("{}", { status: estado })),
      registrar: sinRegistro,
    });

    expect(await solicitar(servicio)).toEqual(PLAN_COMPLETO_SIN_EXPLICACION);
  });

  it("con error de red entrega el plan completo y la explicacion nula", async () => {
    const servicio = crearServicioGemini({
      claveApi: "clave-de-prueba",
      fetch: vi.fn<typeof fetch>(async () => {
        throw new TypeError("fetch failed");
      }),
      registrar: sinRegistro,
    });

    expect(await solicitar(servicio)).toEqual(PLAN_COMPLETO_SIN_EXPLICACION);
  });

  it("cuando el servicio excede el limite, el plan ya se entrego y la explicacion llega nula", async () => {
    const colgado = vi.fn<typeof fetch>(
      (_url, init) =>
        new Promise<Response>((_resolver, rechazar) => {
          init?.signal?.addEventListener("abort", () => rechazar(init.signal?.reason));
        }),
    );
    const servicio = crearServicioGemini({
      claveApi: "clave-de-prueba",
      tiempoLimiteMs: 100,
      fetch: colgado,
      registrar: sinRegistro,
    });
    const resultado = await generarPlan(
      { repositorio: repositorioFalso(), explicacion: servicio },
      { fechaReferencia: REFERENCIA, explicar: true },
    );
    if (resultado.estado !== "generado") throw new Error("se esperaba un plan");
    const lector = resultado.flujo.getReader();
    const decodificador = new TextDecoder();

    const inicio = Date.now();
    const primera = JSON.parse(decodificador.decode((await lector.read()).value)) as LineaFlujo;
    const tiempoPlan = Date.now() - inicio;
    const segunda = JSON.parse(decodificador.decode((await lector.read()).value)) as LineaFlujo;

    expect(primera).toEqual({ tipo: "plan", id: ID_PLAN, plan: PLAN_ESPERADO });
    // El plan no espera al límite de la IA.
    expect(tiempoPlan).toBeLessThan(100);
    expect(segunda).toEqual({ tipo: "explicacion", explicacion: null });
  });

  it("sin explicacion no intenta guardar nada en el plan", async () => {
    const repositorio = repositorioFalso();

    await solicitar({ explicarPlan: async () => null }, repositorio);

    expect(repositorio.guardarExplicacion).not.toHaveBeenCalled();
  });
});

describe("degradacion en el guardado y en la conexion", () => {
  it("si falla el guardado de la explicacion, el usuario igual la recibe y el fallo se registra", async () => {
    const repositorio = repositorioFalso();
    repositorio.guardarExplicacion.mockRejectedValueOnce(new Error("sin conexion"));
    const registrarFallo = vi.fn();

    const lineas = await solicitar({ explicarPlan: async () => "Texto" }, repositorio, registrarFallo);

    expect(lineas).toEqual([
      { tipo: "plan", id: ID_PLAN, plan: PLAN_ESPERADO },
      { tipo: "explicacion", explicacion: "Texto" },
    ]);
    expect(registrarFallo).toHaveBeenCalledTimes(1);
  });

  it("si el cliente cierra la conexion, la explicacion se guarda de todos modos y no hay error", async () => {
    const repositorio = repositorioFalso();
    let responder: (valor: string | null) => void = () => {};
    const explicacion: ServicioExplicacion = {
      explicarPlan: () =>
        new Promise((resolve) => {
          responder = resolve;
        }),
    };
    const resultado = await generarPlan(
      { repositorio, explicacion },
      { fechaReferencia: REFERENCIA, explicar: true },
    );
    if (resultado.estado !== "generado") throw new Error("se esperaba un plan");
    const lector = resultado.flujo.getReader();
    await lector.read();

    await lector.cancel();
    responder("Texto");
    await vi.waitFor(() => expect(repositorio.guardarExplicacion).toHaveBeenCalledWith(ID_PLAN, "Texto"));
  });
});

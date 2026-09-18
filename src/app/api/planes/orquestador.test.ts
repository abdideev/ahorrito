import { describe, expect, it, vi } from "vitest";
import { fechaIso } from "@/core/calendario";
import { calcularPlan } from "@/core/plan";
import { centavos, type EntradaPlan } from "@/core/tipos";
import type { ServicioExplicacion } from "@/ports/explicacion";
import type { RepositorioPlanes } from "@/ports/repositorio";
import {
  fechaDeHoyEnMexico,
  generarPlan,
  validarCuerpo,
  type LineaFlujo,
} from "./orquestador";

const REFERENCIA = fechaIso("2026-09-14");
const ID_PLAN = "5b1c0e7a-2d4f-4a8b-9c3e-6f7a8b9c0d1e";

const ENTRADA: EntradaPlan = {
  fechaReferencia: REFERENCIA,
  presupuesto: { montoSemanal: centavos(50_000), diaInicioSemana: 1 },
  compromisos: [{ id: "c1", monto: centavos(60_000), fechaLimite: fechaIso("2026-09-30"), ocurrencias: 1 }],
};

function repositorioFalso(entrada: EntradaPlan | null = ENTRADA) {
  return {
    obtenerDatosEntrada: vi.fn(async () => entrada),
    guardarPlan: vi.fn(async () => ID_PLAN),
    guardarExplicacion: vi.fn(async () => true),
    listarPlanes: vi.fn(async () => []),
    obtenerPlan: vi.fn(async () => null),
  } satisfies RepositorioPlanes;
}

/** Explicación que no resuelve hasta que la prueba lo decide. */
function explicacionControlada() {
  let resolver: (valor: string | null) => void = () => {};
  const servicio = {
    explicarPlan: vi.fn<ServicioExplicacion["explicarPlan"]>(
      () =>
        new Promise<string | null>((resolve) => {
          resolver = resolve;
        }),
    ),
  } satisfies ServicioExplicacion;
  return { servicio, responder: (valor: string | null) => resolver(valor) };
}

async function leerLinea(lector: ReadableStreamDefaultReader<Uint8Array>): Promise<LineaFlujo | null> {
  const { value, done } = await lector.read();
  return done ? null : (JSON.parse(new TextDecoder().decode(value)) as LineaFlujo);
}

describe("generarPlan: secuencia de la Figura 8", () => {
  it("toma la entrada del repositorio con la fecha de referencia recibida (SC-05)", async () => {
    const repositorio = repositorioFalso();
    const { servicio } = explicacionControlada();

    await generarPlan({ repositorio, explicacion: servicio }, { fechaReferencia: REFERENCIA, explicar: true });

    expect(repositorio.obtenerDatosEntrada).toHaveBeenCalledWith(REFERENCIA);
  });

  it("guarda el plan calculado por el motor", async () => {
    const repositorio = repositorioFalso();
    const { servicio } = explicacionControlada();

    await generarPlan({ repositorio, explicacion: servicio }, { fechaReferencia: REFERENCIA, explicar: true });

    expect(repositorio.guardarPlan).toHaveBeenCalledWith(calcularPlan(ENTRADA));
  });

  it("entrega el plan antes de que la explicacion responda (RNF-01)", async () => {
    const repositorio = repositorioFalso();
    const { servicio, responder } = explicacionControlada();

    const resultado = await generarPlan(
      { repositorio, explicacion: servicio },
      { fechaReferencia: REFERENCIA, explicar: true },
    );
    if (resultado.estado !== "generado") throw new Error("se esperaba un plan");
    const lector = resultado.flujo.getReader();

    // La explicación sigue pendiente y el plan ya se puede leer.
    const primera = await leerLinea(lector);
    expect(primera).toEqual({ tipo: "plan", id: ID_PLAN, plan: calcularPlan(ENTRADA) });
    expect(servicio.explicarPlan).toHaveBeenCalledTimes(1);

    responder("Aparta 200 cada semana.");
    expect(await leerLinea(lector)).toEqual({ tipo: "explicacion", explicacion: "Aparta 200 cada semana." });
    expect(await leerLinea(lector)).toBeNull();
  });

  it("guarda la explicacion en el plan recien creado", async () => {
    const repositorio = repositorioFalso();
    const { servicio, responder } = explicacionControlada();

    const resultado = await generarPlan(
      { repositorio, explicacion: servicio },
      { fechaReferencia: REFERENCIA, explicar: true },
    );
    if (resultado.estado !== "generado") throw new Error("se esperaba un plan");
    const lector = resultado.flujo.getReader();
    await leerLinea(lector);
    responder("Texto");
    await leerLinea(lector);

    expect(repositorio.guardarExplicacion).toHaveBeenCalledWith(ID_PLAN, "Texto");
  });

  it("con explicar false entrega solo el plan y no llama al modelo (conflicto 4)", async () => {
    const repositorio = repositorioFalso();
    const { servicio } = explicacionControlada();

    const resultado = await generarPlan(
      { repositorio, explicacion: servicio },
      { fechaReferencia: REFERENCIA, explicar: false },
    );
    if (resultado.estado !== "generado") throw new Error("se esperaba un plan");
    const lector = resultado.flujo.getReader();

    expect((await leerLinea(lector))?.tipo).toBe("plan");
    expect(await leerLinea(lector)).toBeNull();
    expect(servicio.explicarPlan).not.toHaveBeenCalled();
  });

  it("sin datos obligatorios no calcula ni guarda nada (regla de negocio 6)", async () => {
    const repositorio = repositorioFalso(null);
    const { servicio } = explicacionControlada();

    const resultado = await generarPlan(
      { repositorio, explicacion: servicio },
      { fechaReferencia: REFERENCIA, explicar: true },
    );

    expect(resultado).toEqual({ estado: "sin-datos" });
    expect(repositorio.guardarPlan).not.toHaveBeenCalled();
    expect(servicio.explicarPlan).not.toHaveBeenCalled();
  });

  it("propaga el fallo de la base de datos y no pide la explicacion (seccion 3.7.2)", async () => {
    const repositorio = repositorioFalso();
    repositorio.guardarPlan.mockRejectedValueOnce(new Error("sin conexion"));
    const { servicio } = explicacionControlada();

    await expect(
      generarPlan({ repositorio, explicacion: servicio }, { fechaReferencia: REFERENCIA, explicar: true }),
    ).rejects.toThrow("sin conexion");
    expect(servicio.explicarPlan).not.toHaveBeenCalled();
  });
});

describe("validarCuerpo", () => {
  it.each([
    ["", true],
    ["   ", true],
    ["{}", true],
    ['{"explicar": true}', true],
    ['{"explicar": false}', false],
  ])("acepta %j con explicar = %s", (texto, explicar) => {
    expect(validarCuerpo(texto)).toEqual({ valido: true, explicar });
  });

  it.each([
    ["JSON mal formado", "{explicar: false"],
    ["un arreglo", "[]"],
    ["null", "null"],
    ["explicar que no es booleano", '{"explicar": "no"}'],
    ["la captura del contrato anterior a SC-05", '{"presupuesto": {"monto": 500}}'],
  ])("rechaza %s", (_caso, texto) => {
    expect(validarCuerpo(texto)).toEqual({ valido: false });
  });
});

describe("fechaDeHoyEnMexico", () => {
  it("usa la fecha del centro de Mexico y no la de UTC", () => {
    // 19 sep 03:00 UTC son las 21:00 del 18 sep en la Ciudad de Mexico (UTC-6).
    expect(fechaDeHoyEnMexico(new Date("2026-09-19T03:00:00Z"))).toBe("2026-09-18");
    expect(fechaDeHoyEnMexico(new Date("2026-09-19T06:00:00Z"))).toBe("2026-09-19");
  });
});

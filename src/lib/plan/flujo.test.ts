import { describe, expect, it } from "vitest";
import { leerFlujo, mensajeDeError, type LineaPlan } from "./flujo";

function respuestaCon(trozos: readonly string[]): Response {
  const codificador = new TextEncoder();
  const flujo = new ReadableStream<Uint8Array>({
    start(controlador) {
      trozos.forEach((trozo) => controlador.enqueue(codificador.encode(trozo)));
      controlador.close();
    },
  });
  return new Response(flujo);
}

async function recolectar(respuesta: Response): Promise<LineaPlan[]> {
  const lineas: LineaPlan[] = [];
  for await (const linea of leerFlujo(respuesta)) {
    lineas.push(linea);
  }
  return lineas;
}

const PLAN = '{"tipo":"plan","id":"abc","plan":{"asignaciones":[]}}';
const EXPLICACION = '{"tipo":"explicacion","explicacion":"Aparta 200 cada semana."}';

describe("leerFlujo", () => {
  it("entrega las dos lineas del flujo en orden", async () => {
    const lineas = await recolectar(respuestaCon([`${PLAN}\n`, `${EXPLICACION}\n`]));

    expect(lineas.map((linea) => linea.tipo)).toEqual(["plan", "explicacion"]);
  });

  it("reensambla una linea partida entre dos trozos de red", async () => {
    const mitad = Math.floor(PLAN.length / 2);
    const lineas = await recolectar(
      respuestaCon([PLAN.slice(0, mitad), `${PLAN.slice(mitad)}\n${EXPLICACION}\n`]),
    );

    expect(lineas).toHaveLength(2);
    expect(lineas[0].tipo === "plan" && lineas[0].id).toBe("abc");
  });

  it("separa dos lineas que llegan en el mismo trozo", async () => {
    const lineas = await recolectar(respuestaCon([`${PLAN}\n${EXPLICACION}\n`]));

    expect(lineas).toHaveLength(2);
  });

  it("no pierde la ultima linea si el servidor cierra sin salto final", async () => {
    const lineas = await recolectar(respuestaCon([`${PLAN}\n`, EXPLICACION]));

    expect(lineas).toHaveLength(2);
  });

  it("acepta la explicacion nula, que es el caso degradado de RNF-03", async () => {
    const lineas = await recolectar(
      respuestaCon([`${PLAN}\n{"tipo":"explicacion","explicacion":null}\n`]),
    );

    expect(lineas[1]).toEqual({ tipo: "explicacion", explicacion: null });
  });

  it("entrega solo el plan cuando no se pidio explicacion", async () => {
    expect(await recolectar(respuestaCon([`${PLAN}\n`]))).toHaveLength(1);
  });

  it("no falla con un cuerpo vacio", async () => {
    expect(await recolectar(new Response(null))).toEqual([]);
  });
});

describe("mensajeDeError", () => {
  it.each([
    [401, "sesión"],
    [422, "presupuesto"],
    [503, "Intenta de nuevo"],
    [500, "No pudimos generar"],
  ])("traduce el estado %i a un mensaje para el usuario", (estado, fragmento) => {
    expect(mensajeDeError(estado)).toContain(fragmento);
  });
});

import { describe, expect, it, vi } from "vitest";
import { fechaIso } from "@/core/calendario";
import { calcularPlan } from "@/core/plan";
import { centavos } from "@/core/tipos";
import {
  crearServicioGemini,
  MODELO_POR_OMISION,
  normalizarRespuesta,
  TIEMPO_LIMITE_MS,
  type EventoIa,
} from "./gemini";

const CLAVE = "clave-de-prueba-no-real";

const PLAN = calcularPlan({
  fechaReferencia: fechaIso("2026-09-14"),
  presupuesto: { montoSemanal: centavos(50_000), diaInicioSemana: 1 },
  compromisos: [
    { id: "3f2b8c1e-9a4d-4e7b-b1c2-5d6e7f8a9b0c", monto: centavos(60_000), fechaLimite: fechaIso("2026-09-30"), ocurrencias: 1 },
  ],
});

const CONTENIDO_VALIDO = {
  resumen: "Aparta 200 pesos cada semana para cubrir el Compromiso 1.",
  advertencias: ["La semana 3 tiene vencimientos por 600 pesos."],
  sugerencias: ["Registra un ingreso extra si lo tienes."],
};

function respuestaGemini(contenido: unknown, finishReason = "STOP") {
  return {
    candidates: [
      {
        content: { role: "model", parts: [{ text: typeof contenido === "string" ? contenido : JSON.stringify(contenido) }] },
        finishReason,
      },
    ],
  };
}

function fetchQueResponde(cuerpo: unknown, estado = 200) {
  return vi.fn<typeof fetch>(async () => new Response(JSON.stringify(cuerpo), { status: estado }));
}

function servicio(fetchSimulado: typeof fetch, extras: { claveApi?: string; tiempoLimiteMs?: number } = {}) {
  const eventos: EventoIa[] = [];
  const instancia = crearServicioGemini({
    claveApi: "claveApi" in extras ? extras.claveApi : CLAVE,
    tiempoLimiteMs: extras.tiempoLimiteMs,
    fetch: fetchSimulado,
    registrar: (evento) => eventos.push(evento),
  });
  const resultado = () => eventos.find((e) => e.tipo === "resultado");
  return { instancia, eventos, resultado };
}

describe("crearServicioGemini: servicio disponible", () => {
  it("devuelve la explicacion en texto plano con sus secciones", async () => {
    const { instancia, resultado } = servicio(fetchQueResponde(respuestaGemini(CONTENIDO_VALIDO)));

    const explicacion = await instancia.explicarPlan(PLAN);

    expect(explicacion).toBe(
      [
        "Aparta 200 pesos cada semana para cubrir el Compromiso 1.",
        "Advertencias:\n- La semana 3 tiene vencimientos por 600 pesos.",
        "Sugerencias:\n- Registra un ingreso extra si lo tienes.",
      ].join("\n\n"),
    );
    expect(resultado()).toMatchObject({ resultado: "exito", estadoHttp: 200 });
  });

  it("envia la clave en el encabezado y nunca en la URL ni en el cuerpo (RES-03)", async () => {
    const fetchSimulado = fetchQueResponde(respuestaGemini(CONTENIDO_VALIDO));
    const { instancia, eventos } = servicio(fetchSimulado);

    await instancia.explicarPlan(PLAN);

    const [url, init] = fetchSimulado.mock.calls[0];
    expect(url).toBe(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_POR_OMISION}:generateContent`,
    );
    expect(String(url)).not.toContain(CLAVE);
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>)["x-goog-api-key"]).toBe(CLAVE);
    expect(String(init?.body)).not.toContain(CLAVE);
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.stringify(eventos)).not.toContain(CLAVE);
  });

  it("envia solo la carga anonimizada y pide JSON estructurado (RNF-10, I-05)", async () => {
    const fetchSimulado = fetchQueResponde(respuestaGemini(CONTENIDO_VALIDO));
    const { instancia, eventos } = servicio(fetchSimulado);

    await instancia.explicarPlan(PLAN);

    const cuerpo = JSON.parse(String(fetchSimulado.mock.calls[0][1]?.body));
    const carga = JSON.parse(cuerpo.contents[0].parts[0].text);
    expect(carga.moneda).toBe("MXN");
    expect(carga.semanas[2].vencimientos[0].compromiso).toBe("Compromiso 1");
    expect(cuerpo.contents[0].parts[0].text).not.toContain("3f2b8c1e");
    expect(cuerpo.generationConfig.responseMimeType).toBe("application/json");
    expect(cuerpo.generationConfig.responseJsonSchema.required).toEqual(["resumen", "advertencias", "sugerencias"]);
    // CA-11: la solicitud registrada es exactamente la que sale.
    expect(eventos[0]).toEqual({ tipo: "solicitud", modelo: MODELO_POR_OMISION, cuerpo: fetchSimulado.mock.calls[0][1]?.body });
  });

  it("usa el modelo configurado cuando se indica", async () => {
    const fetchSimulado = fetchQueResponde(respuestaGemini(CONTENIDO_VALIDO));
    const instancia = crearServicioGemini({ claveApi: CLAVE, modelo: "otro-modelo", fetch: fetchSimulado, registrar: () => {} });

    await instancia.explicarPlan(PLAN);

    expect(String(fetchSimulado.mock.calls[0][0])).toContain("/models/otro-modelo:generateContent");
  });
});

describe("crearServicioGemini: degradacion a null (RNF-03)", () => {
  it("sin clave configurada no intenta la llamada (CA-09)", async () => {
    const fetchSimulado = fetchQueResponde(respuestaGemini(CONTENIDO_VALIDO));
    const { instancia, resultado } = servicio(fetchSimulado, { claveApi: "  " });

    await expect(instancia.explicarPlan(PLAN)).resolves.toBeNull();
    expect(fetchSimulado).not.toHaveBeenCalled();
    expect(resultado()).toMatchObject({ resultado: "sin-clave" });
  });

  it.each([400, 403, 429, 500, 503])("resuelve null ante HTTP %i", async (estado) => {
    const { instancia, resultado } = servicio(fetchQueResponde({ error: { code: estado } }, estado));

    await expect(instancia.explicarPlan(PLAN)).resolves.toBeNull();
    expect(resultado()).toMatchObject({ resultado: "error-http", estadoHttp: estado });
  });

  it("resuelve null ante un error de red", async () => {
    const { instancia, resultado } = servicio(vi.fn<typeof fetch>(async () => {
      throw new TypeError("fetch failed");
    }));

    await expect(instancia.explicarPlan(PLAN)).resolves.toBeNull();
    expect(resultado()).toMatchObject({ resultado: "error-red" });
  });

  it("aborta y resuelve null cuando el servicio excede el tiempo limite", async () => {
    // Servidor que nunca responde: solo termina cuando la señal aborta.
    const colgado = vi.fn<typeof fetch>(
      (_url, init) =>
        new Promise<Response>((_resolver, rechazar) => {
          init?.signal?.addEventListener("abort", () => rechazar(init.signal?.reason));
        }),
    );
    const { instancia, resultado } = servicio(colgado, { tiempoLimiteMs: 50 });

    await expect(instancia.explicarPlan(PLAN)).resolves.toBeNull();
    expect(resultado()).toMatchObject({ resultado: "tiempo-agotado" });
    expect(resultado()?.tipo === "resultado" && resultado()?.duracionMs).toBeLessThan(1_000);
  });

  it("el limite por omision es de 20 segundos (seccion 3.7.1)", () => {
    expect(TIEMPO_LIMITE_MS).toBe(20_000);
  });

  it("resuelve null si la respuesta no es JSON", async () => {
    const noJson = vi.fn<typeof fetch>(async () => new Response("<html>error</html>", { status: 200 }));
    const { instancia, resultado } = servicio(noJson);

    await expect(instancia.explicarPlan(PLAN)).resolves.toBeNull();
    expect(resultado()).toMatchObject({ resultado: "respuesta-invalida" });
  });

  it("resuelve null si el contenido no cumple el esquema", async () => {
    const { instancia, resultado } = servicio(fetchQueResponde(respuestaGemini({ resumen: 42 })));

    await expect(instancia.explicarPlan(PLAN)).resolves.toBeNull();
    expect(resultado()).toMatchObject({ resultado: "respuesta-invalida" });
  });
});

describe("normalizarRespuesta", () => {
  it("omite las secciones vacias", () => {
    expect(normalizarRespuesta(respuestaGemini({ resumen: "Todo cubierto.", advertencias: [], sugerencias: [] }))).toBe(
      "Todo cubierto.",
    );
  });

  it.each([
    ["sin candidatos (solicitud bloqueada)", { promptFeedback: { blockReason: "SAFETY" } }],
    ["respuesta truncada por MAX_TOKENS", respuestaGemini(CONTENIDO_VALIDO, "MAX_TOKENS")],
    ["respuesta detenida por SAFETY", respuestaGemini(CONTENIDO_VALIDO, "SAFETY")],
    ["texto que no es JSON", respuestaGemini("Aparta 200 pesos")],
    ["resumen vacio", respuestaGemini({ ...CONTENIDO_VALIDO, resumen: "   " })],
    ["advertencias que no son lista de textos", respuestaGemini({ ...CONTENIDO_VALIDO, advertencias: [1, 2] })],
    ["sin sugerencias", respuestaGemini({ resumen: "x", advertencias: [] })],
    ["valor nulo", null],
  ])("devuelve null: %s", (_caso, datos) => {
    expect(normalizarRespuesta(datos)).toBeNull();
  });

  it("deja texto plano: quita caracteres de control y colapsa espacios", () => {
    const texto = normalizarRespuesta(
      respuestaGemini({ resumen: "Linea  uno\n\n\tdos", advertencias: ["  a  "], sugerencias: [] }),
    );

    expect(texto).toBe("Linea uno dos\n\nAdvertencias:\n- a");
  });

  it("acota la longitud del resumen y el numero de elementos", () => {
    const texto = normalizarRespuesta(
      respuestaGemini({
        resumen: "a".repeat(5_000),
        advertencias: Array.from({ length: 10 }, (_, i) => `Advertencia ${i + 1}`),
        sugerencias: ["b".repeat(1_000)],
      }),
    );
    const [resumen, advertencias, sugerencias] = texto!.split("\n\n");

    expect(resumen.length).toBe(1_200);
    expect(advertencias.split("\n")).toHaveLength(6);
    expect(sugerencias.length).toBeLessThanOrEqual("Sugerencias:\n- ".length + 300);
  });
});

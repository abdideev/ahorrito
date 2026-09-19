import { describe, expect, it } from "vitest";
import { fechaIso } from "@/core/calendario";
import { calcularPlan } from "@/core/plan";
import { centavos, type Centavos, type Compromiso, type EntradaPlan, type Plan } from "@/core/tipos";
import { construirCarga } from "./carga";

const f = fechaIso;
const pesos = (cantidad: number): Centavos => centavos(Math.round(cantidad * 100));

// Lunes. S1 14-20 sep, S2 21-27 sep, S3 28 sep-4 oct.
const REFERENCIA = f("2026-09-14");
const UUID_TARJETA = "3f2b8c1e-9a4d-4e7b-b1c2-5d6e7f8a9b0c";
const UUID_RENTA = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
const UUID_INGRESO = "0f9e8d7c-6b5a-4c3d-9e2f-1a0b9c8d7e6f";
const PATRON_UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function compromiso(id: string, monto: number, fechaLimite: string, ocurrencias = 1): Compromiso {
  return { id, monto: pesos(monto), fechaLimite: f(fechaLimite), ocurrencias };
}

function entrada(compromisos: readonly Compromiso[], extras: Partial<EntradaPlan> = {}): EntradaPlan {
  return {
    fechaReferencia: REFERENCIA,
    presupuesto: { montoSemanal: pesos(500), diaInicioSemana: 1 },
    compromisos,
    ...extras,
  };
}

/** Todas las claves de un valor JSON, a cualquier profundidad. */
function clavesDe(valor: unknown, claves = new Set<string>()): Set<string> {
  if (Array.isArray(valor)) {
    valor.forEach((elemento) => clavesDe(elemento, claves));
  } else if (valor !== null && typeof valor === "object") {
    for (const [clave, anidado] of Object.entries(valor)) {
      claves.add(clave);
      clavesDe(anidado, claves);
    }
  }
  return claves;
}

describe("construirCarga", () => {
  it("expresa los importes en pesos con dos decimales y conserva las fechas", () => {
    const plan = calcularPlan(entrada([compromiso(UUID_TARJETA, 600, "2026-09-30")]));

    const carga = construirCarga(plan);

    expect(carga.moneda).toBe("MXN");
    expect(carga.fechaReferencia).toBe("2026-09-14");
    expect(carga.finHorizonte).toBe("2026-09-30");
    expect(carga.semanas).toHaveLength(3);
    expect(carga.semanas[0]).toMatchObject({
      numero: 1,
      inicio: "2026-09-14",
      fin: "2026-09-20",
      presupuesto: "500.00",
      disponible: "500.00",
      apartado: "200.00",
      remanente: "300.00",
      sobrecargada: false,
    });
    expect(carga.semanas[2].vencimientos).toEqual([
      { compromiso: "Compromiso 1", ocurrencia: 1, fecha: "2026-09-30", monto: "600.00" },
    ]);
  });

  it("conserva los centavos sin error de punto flotante", () => {
    const plan = calcularPlan(entrada([compromiso(UUID_TARJETA, 0.3, "2026-09-16")]));

    expect(construirCarga(plan).semanas[0].vencimientos[0].monto).toBe("0.30");
  });

  it("sustituye los identificadores por etiquetas genericas estables", () => {
    const plan = calcularPlan(
      entrada([compromiso(UUID_TARJETA, 600, "2026-09-30"), compromiso(UUID_RENTA, 300, "2026-09-18")]),
    );

    const carga = construirCarga(plan);
    const etiquetas = carga.semanas.flatMap((semana) => [
      ...semana.vencimientos.map((v) => v.compromiso),
      ...semana.apartados.map((a) => a.compromiso),
    ]);

    expect(new Set(etiquetas)).toEqual(new Set(["Compromiso 1", "Compromiso 2"]));
    // El mismo compromiso conserva su etiqueta en todas las semanas.
    const deLaTarjeta = carga.semanas[2].vencimientos.find((v) => v.monto === "600.00");
    expect(carga.semanas[0].apartados.find((a) => a.monto === "200.00")?.compromiso).toBe(
      deLaTarjeta?.compromiso,
    );
    expect(JSON.stringify(carga)).not.toMatch(PATRON_UUID);
  });

  it("etiqueta tambien los identificadores que solo aparecen en las advertencias", () => {
    const plan = calcularPlan(
      entrada([compromiso(UUID_RENTA, 300, "2026-09-10"), compromiso(UUID_TARJETA, 100, "2026-10-20", 6)], {
        ingresosExtra: [{ id: UUID_INGRESO, monto: pesos(1000), fecha: f("2027-06-01") }],
      }),
    );

    const carga = construirCarga(plan);
    const tipos = carga.advertencias.map((a) => a.tipo);

    expect(tipos).toContain("vencimiento-anterior-a-referencia");
    expect(tipos).toContain("vencimiento-fuera-de-horizonte");
    expect(carga.advertencias).toContainEqual({
      tipo: "ingreso-fuera-de-horizonte",
      ingreso: "Ingreso 1",
      fecha: "2027-06-01",
    });
    expect(JSON.stringify(carga)).not.toMatch(PATRON_UUID);
  });

  it("traduce las advertencias de semana y de meta con sus importes", () => {
    const plan = calcularPlan(
      entrada([compromiso(UUID_TARJETA, 700, "2026-09-16")], {
        metaAhorro: { montoObjetivo: pesos(5000), fechaObjetivo: f("2026-10-15") },
      }),
    );

    const carga = construirCarga(plan);

    expect(carga.advertencias).toContainEqual({ tipo: "semana-sobrecargada", semana: 1, excedente: "200.00" });
    expect(carga.advertencias).toContainEqual({ tipo: "semana-en-deficit", semana: 1, faltante: "200.00" });
    expect(carga.meta).toMatchObject({ montoObjetivo: "5000.00", fechaObjetivo: "2026-10-15", viable: false });
    expect(carga.advertencias.some((a) => a.tipo === "meta-no-alcanzable")).toBe(true);
  });

  it("entrega meta nula cuando el plan no tiene meta de ahorro", () => {
    const plan = calcularPlan(entrada([compromiso(UUID_TARJETA, 600, "2026-09-30")]));

    expect(construirCarga(plan).meta).toBeNull();
  });
});

describe("construirCarga: ausencia de datos identificables (RNF-10, CA-11)", () => {
  const CLAVES_PERMITIDAS = new Set([
    "moneda",
    "fechaReferencia",
    "inicioHorizonte",
    "finHorizonte",
    "semanas",
    "numero",
    "inicio",
    "fin",
    "presupuesto",
    "ingresosExtra",
    "disponible",
    "apartado",
    "remanente",
    "aporteMeta",
    "sobrecargada",
    "enDeficit",
    "vencimientos",
    "apartados",
    "compromiso",
    "ocurrencia",
    "fecha",
    "monto",
    "meta",
    "montoObjetivo",
    "fechaObjetivo",
    "ahorroPosible",
    "viable",
    "faltante",
    "advertencias",
    "tipo",
    "semana",
    "excedente",
    "ingreso",
  ]);

  const DATOS_IDENTIFICABLES = {
    nombre: "Mariana Lopez Hernandez",
    correo: "mariana.lopez@example.com",
    denominacion: "Tarjeta Oro BBVA",
    numeroCuenta: "4152313012345678",
    institucion: "Banorte",
  };

  /**
   * Plan contaminado: se le cuelgan datos identificables en cada nivel, como haría un
   * cambio futuro descuidado que ampliara los tipos del dominio. La carga no debe
   * transportarlos, porque se construye por lista blanca.
   */
  function planContaminado(): Plan {
    const plan = calcularPlan(
      entrada([compromiso(UUID_TARJETA, 600, "2026-09-30")], {
        metaAhorro: { montoObjetivo: pesos(300), fechaObjetivo: f("2026-09-30") },
      }),
    );
    return {
      ...plan,
      ...DATOS_IDENTIFICABLES,
      asignaciones: plan.asignaciones.map((asignacion) => ({
        ...asignacion,
        ...DATOS_IDENTIFICABLES,
        vencimientos: asignacion.vencimientos.map((v) => ({ ...v, ...DATOS_IDENTIFICABLES })),
        apartados: asignacion.apartados.map((a) => ({ ...a, ...DATOS_IDENTIFICABLES })),
      })),
      evaluacionMeta: plan.evaluacionMeta && { ...plan.evaluacionMeta, ...DATOS_IDENTIFICABLES },
      advertencias: plan.advertencias.map((a) => ({ ...a, ...DATOS_IDENTIFICABLES })),
    } as Plan;
  }

  it("no transporta ninguno de los datos que prohibe RES-10", () => {
    const serializada = JSON.stringify(construirCarga(planContaminado()));

    for (const valor of Object.values(DATOS_IDENTIFICABLES)) {
      expect(serializada).not.toContain(valor);
    }
    expect(serializada).not.toContain("@");
    expect(serializada).not.toMatch(PATRON_UUID);
  });

  it("solo contiene claves de la lista blanca", () => {
    const claves = clavesDe(JSON.parse(JSON.stringify(construirCarga(planContaminado()))));

    expect([...claves].filter((clave) => !CLAVES_PERMITIDAS.has(clave))).toEqual([]);
  });
});

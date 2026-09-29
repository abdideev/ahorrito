import { describe, expect, it } from "vitest";
import { fechaIso } from "@/core/calendario";
import { centavos, type Advertencia } from "@/core/tipos";
import { describirAdvertencia, describirAdvertencias } from "./advertencias";

const ID_TARJETA = "3f2b8c1e-9a4d-4e7b-b1c2-5d6e7f8a9b0c";
const DENOMINACIONES = { [ID_TARJETA]: "Tarjeta departamental" };

describe("describirAdvertencia", () => {
  it("redacta la sobrecarga con su excedente y aclara que se cubre con lo apartado", () => {
    const legible = describirAdvertencia({
      tipo: "semana-sobrecargada",
      numeroSemana: 3,
      excedente: centavos(10_000),
    });

    expect(legible.gravedad).toBe("media");
    expect(legible.texto).toContain("Semana 3");
    expect(legible.texto).toContain("100.00");
  });

  it("marca el deficit como grave, porque el plan no se puede cumplir", () => {
    const legible = describirAdvertencia({
      tipo: "semana-en-deficit",
      numeroSemana: 1,
      faltante: centavos(40_000),
    });

    expect(legible.gravedad).toBe("alta");
    expect(legible.texto).toContain("400.00");
  });

  it("usa la denominacion que escribio el usuario, no el identificador", () => {
    const legible = describirAdvertencia(
      {
        tipo: "vencimiento-fuera-de-horizonte",
        compromisoId: ID_TARJETA,
        ocurrencia: 3,
        fecha: fechaIso("2027-03-30"),
      },
      DENOMINACIONES,
    );

    expect(legible.texto).toContain("Tarjeta departamental");
    expect(legible.texto).not.toContain(ID_TARJETA);
  });

  it("no revela el identificador cuando el compromiso ya no existe", () => {
    const legible = describirAdvertencia(
      {
        tipo: "vencimiento-anterior-a-referencia",
        compromisoId: ID_TARJETA,
        ocurrencia: 1,
        fecha: fechaIso("2026-01-10"),
      },
      {},
    );

    expect(legible.texto).not.toContain(ID_TARJETA);
    expect(legible.texto).toContain("un pago que ya no existe");
  });

  it("redacta los tres avisos de meta e ingreso", () => {
    const meta = describirAdvertencia({ tipo: "meta-no-alcanzable", faltante: centavos(50_000) });
    const fuera = describirAdvertencia({
      tipo: "meta-fuera-de-horizonte",
      fechaObjetivo: fechaIso("2027-06-30"),
      finHorizonte: fechaIso("2027-03-14"),
    });
    const ingreso = describirAdvertencia({
      tipo: "ingreso-fuera-de-horizonte",
      ingresoId: "cualquiera",
      fecha: fechaIso("2027-06-01"),
    });

    expect(meta.gravedad).toBe("alta");
    expect(meta.texto).toContain("500.00");
    expect(fuera.texto).toContain("2027-06-30");
    expect(ingreso.texto).toContain("2027-06-01");
    // El identificador del ingreso no aporta nada al usuario y no debe aparecer.
    expect(ingreso.texto).not.toContain("cualquiera");
  });
});

describe("describirAdvertencias", () => {
  it("coloca primero las graves, que son las que exigen una decision", () => {
    const advertencias: Advertencia[] = [
      { tipo: "semana-sobrecargada", numeroSemana: 3, excedente: centavos(10_000) },
      { tipo: "semana-en-deficit", numeroSemana: 1, faltante: centavos(40_000) },
      { tipo: "meta-no-alcanzable", faltante: centavos(50_000) },
    ];

    expect(describirAdvertencias(advertencias).map((a) => a.gravedad)).toEqual([
      "alta",
      "alta",
      "media",
    ]);
  });

  it("devuelve una lista vacia cuando el plan no tiene advertencias", () => {
    expect(describirAdvertencias([])).toEqual([]);
  });
});

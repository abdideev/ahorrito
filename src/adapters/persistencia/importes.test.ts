import { describe, expect, it } from "vitest";
import { centavos } from "@/core/tipos";
import { centavosATexto, textoACentavos } from "./importes";

describe("centavosATexto", () => {
  it("escribe siempre dos decimales", () => {
    expect(centavosATexto(centavos(60000))).toBe("600.00");
    expect(centavosATexto(centavos(8334))).toBe("83.34");
    expect(centavosATexto(centavos(5))).toBe("0.05");
    expect(centavosATexto(centavos(0))).toBe("0.00");
  });

  it("conserva el signo de un remanente negativo", () => {
    expect(centavosATexto(centavos(-10050))).toBe("-100.50");
    expect(centavosATexto(centavos(-1))).toBe("-0.01");
  });

  it("acepta el maximo de numeric(12,2) y rechaza lo que lo excede", () => {
    expect(centavosATexto(centavos(999_999_999_999))).toBe("9999999999.99");
    expect(() => centavosATexto(centavos(1_000_000_000_000))).toThrow(RangeError);
  });
});

describe("textoACentavos", () => {
  it("lee el texto que produce numeric(12,2)", () => {
    expect(textoACentavos("600.00")).toBe(60000);
    expect(textoACentavos("-100.50")).toBe(-10050);
    expect(textoACentavos("-0.00")).toBe(0);
  });

  it.each(["600", "600.5", "600.505", "1e3", " 600.00", "", "-", "abc", "12345678901.00"])(
    "rechaza el formato %j",
    (texto) => {
      expect(() => textoACentavos(texto)).toThrow(RangeError);
    },
  );

  it("es la inversa exacta de centavosATexto, incluidos los casos que el punto flotante altera", () => {
    // 0.29 * 100 da 28.999999999999996 en punto flotante; aqui no debe perderse nada.
    const muestras = [0, 1, 29, 57, 99, 100, 101, 8334, 123456, -1, -29, -8334, 999_999_999_999];
    for (let valor = -5000; valor <= 5000; valor += 37) {
      muestras.push(valor);
    }
    for (const valor of muestras) {
      expect(textoACentavos(centavosATexto(centavos(valor))), String(valor)).toBe(valor);
    }
  });
});

import { describe, expect, it } from "vitest";
import { fechaDeHoyEnMexico, fechaDeMananaEnMexico } from "./fecha";

describe("fechaDeHoyEnMexico", () => {
  it("usa la fecha del centro de Mexico y no la de UTC", () => {
    // 19 sep 03:00 UTC son las 21:00 del 18 sep en la Ciudad de Mexico (UTC-6).
    expect(fechaDeHoyEnMexico(new Date("2026-09-19T03:00:00Z"))).toBe("2026-09-18");
    expect(fechaDeHoyEnMexico(new Date("2026-09-19T06:00:00Z"))).toBe("2026-09-19");
  });

  it("escribe siempre dos digitos en mes y dia, para que el orden alfabetico sea cronologico", () => {
    expect(fechaDeHoyEnMexico(new Date("2026-01-05T18:00:00Z"))).toBe("2026-01-05");
  });

  it("sin argumento usa el reloj del sistema", () => {
    expect(fechaDeHoyEnMexico()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("fechaDeMananaEnMexico", () => {
  it("devuelve el dia siguiente a la fecha del centro de Mexico", () => {
    // 21:00 del 18 de septiembre en Mexico, aunque en UTC ya sea el 19.
    expect(fechaDeMananaEnMexico(new Date("2026-09-19T03:00:00Z"))).toBe("2026-09-19");
  });

  it("cruza bien el fin de mes", () => {
    expect(fechaDeMananaEnMexico(new Date("2026-09-30T18:00:00Z"))).toBe("2026-10-01");
  });

  it("cruza bien el fin de año", () => {
    expect(fechaDeMananaEnMexico(new Date("2026-12-31T18:00:00Z"))).toBe("2027-01-01");
  });

  it("cruza bien el 28 de febrero de un año bisiesto", () => {
    expect(fechaDeMananaEnMexico(new Date("2028-02-28T18:00:00Z"))).toBe("2028-02-29");
  });
});

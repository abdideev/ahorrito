import { describe, expect, it } from "vitest";
import { COOKIE_TEMA, cookieDeTema } from "./tema";

describe("cookieDeTema", () => {
  it("guarda el tema con el nombre que lee el layout raiz", () => {
    expect(cookieDeTema("dark").startsWith(`${COOKIE_TEMA}=dark;`)).toBe(true);
  });

  it("vale para todas las rutas, no solo para la pagina actual", () => {
    expect(cookieDeTema("light")).toContain("Path=/");
  });

  it("dura un año y no se envia en solicitudes de terceros", () => {
    const cookie = cookieDeTema("dark");
    expect(cookie).toContain(`Max-Age=${60 * 60 * 24 * 365}`);
    expect(cookie).toContain("SameSite=Lax");
  });
});

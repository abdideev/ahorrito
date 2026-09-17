import { describe, expect, it } from "vitest";
import { clasificarRuta, rutaInternaSegura, urlDeConfirmacion } from "./rutas";

describe("clasificarRuta", () => {
  it("protege por omision cualquier ruta no declarada", () => {
    expect(clasificarRuta("/panel")).toBe("protegida");
    expect(clasificarRuta("/plan/123")).toBe("protegida");
    expect(clasificarRuta("/una-pantalla-nueva")).toBe("protegida");
  });

  it("la raiz solo es publica en si misma, no como prefijo de todas las rutas", () => {
    expect(clasificarRuta("/")).toBe("publica");
    expect(clasificarRuta("/panel")).toBe("protegida");
  });

  it("reconoce rutas publicas y sus subrutas, sin confundir prefijos parecidos", () => {
    expect(clasificarRuta("/demo")).toBe("publica");
    expect(clasificarRuta("/demo/escenario")).toBe("publica");
    expect(clasificarRuta("/demostracion")).toBe("protegida");
    expect(clasificarRuta("/confirmar")).toBe("publica");
  });

  it("distingue las rutas de invitado y las de la API", () => {
    expect(clasificarRuta("/iniciar-sesion")).toBe("invitado");
    expect(clasificarRuta("/registro")).toBe("invitado");
    expect(clasificarRuta("/api/planes")).toBe("api");
    expect(clasificarRuta("/apis")).toBe("protegida");
  });
});

describe("rutaInternaSegura", () => {
  const RESPALDO = "/panel";

  it("conserva rutas internas con su consulta y fragmento", () => {
    expect(rutaInternaSegura("/panel", RESPALDO)).toBe("/panel");
    expect(rutaInternaSegura("/plan/7?semana=2#detalle", RESPALDO)).toBe("/plan/7?semana=2#detalle");
  });

  it.each([
    ["URL absoluta", "https://sitio-malicioso.example"],
    ["protocolo relativo", "//sitio-malicioso.example"],
    ["barra invertida", "/\\sitio-malicioso.example"],
    ["tabulador intercalado", "/\t/sitio-malicioso.example"],
    ["salto de linea intercalado", "/\n/sitio-malicioso.example"],
    ["esquema javascript", "javascript:alert(1)"],
    ["ruta sin barra inicial", "panel"],
    ["cadena vacia", ""],
  ])("rechaza %s (CWE-601)", (_caso, destino) => {
    expect(rutaInternaSegura(destino, RESPALDO)).toBe(RESPALDO);
  });

  it("usa el respaldo si el destino no es una cadena", () => {
    expect(rutaInternaSegura(null, RESPALDO)).toBe(RESPALDO);
    expect(rutaInternaSegura(undefined, RESPALDO)).toBe(RESPALDO);
    expect(rutaInternaSegura(42, RESPALDO)).toBe(RESPALDO);
  });
});

describe("urlDeConfirmacion", () => {
  it("construye la ruta de confirmacion sobre el origen de la peticion", () => {
    expect(urlDeConfirmacion("http://localhost:3000")).toBe("http://localhost:3000/confirmar");
    expect(urlDeConfirmacion("https://ahorrito.vercel.app")).toBe("https://ahorrito.vercel.app/confirmar");
  });

  it("descarta cualquier ruta que venga en el origen", () => {
    expect(urlDeConfirmacion("https://ahorrito.vercel.app/otra/ruta")).toBe("https://ahorrito.vercel.app/confirmar");
  });

  it("omite la URL ante un origen ausente, opaco o con otro esquema", () => {
    expect(urlDeConfirmacion(null)).toBeUndefined();
    expect(urlDeConfirmacion("")).toBeUndefined();
    // Los navegadores envian el texto "null" como origen en contextos opacos.
    expect(urlDeConfirmacion("null")).toBeUndefined();
    expect(urlDeConfirmacion("javascript:alert(1)")).toBeUndefined();
    expect(urlDeConfirmacion("file:///etc/passwd")).toBeUndefined();
  });
});

/**
 * Pruebas de las reglas del protocolo de validación. TODOS LOS DATOS DE ESTE ARCHIVO SON FICTICIOS:
 * se inventaron para ejercitar cada regla y no son resultados de ninguna sesión. La única
 * excepción es la prueba de la mediana con los JSON reales de CA-08, que se leen de
 * docs/verificacion/ y no se modifican.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  aSegundos,
  evaluarCA20,
  evaluarEvaluador,
  evaluarOBJ05,
  mediana,
  minutosEntre,
  RESULTADO,
  tiemposGrabacion,
} from "./validacion.mjs";

/** Registro ficticio con grabación completa. */
const ficticio = (evaluador, cambios = {}) => ({
  evaluador,
  perfil: "P_",
  experienciaPrevia: { excluido: false },
  grabacion: {
    estado: "completa",
    registroVisible: "00:10",
    crearCuentaPulsado: "01:00",
    deVueltaConSesion: "02:30",
    generarPulsado: "05:00",
    planVisible: "05:02",
  },
  baseDeDatos: { sCreacionAPrimerPlan: 240, ejecutadaAntesDelMensaje3: true },
  anotado: { horaInicio: "10:00", horaPlan: "10:05" },
  correoNoLlegoEn10Min: false,
  ayuda: { recibida: false },
  obj05: { claridad: 5, accionabilidad: 4 },
  ...cambios,
});
const conGrabacion = (evaluador, cambiosGrabacion) =>
  ficticio(evaluador, { grabacion: { ...ficticio(evaluador).grabacion, ...cambiosGrabacion } });

describe("mediana", () => {
  it("con datos pares promedia los dos centrales (no toma el elemento n/2)", () => {
    expect(mediana([245, 248, 296, 310])).toBe(272);
    expect(mediana(Array.from({ length: 20 }, (_, i) => i + 1))).toBe(10.5);
  });
  it("con datos impares toma el central y ordena antes", () => {
    expect(mediana([300, 100, 200])).toBe(200);
  });
  it("sin datos devuelve null e ignora valores no numéricos", () => {
    expect(mediana([])).toBeNull();
    expect(mediana([null, undefined, 7])).toBe(7);
  });
  it("con los datos REALES guardados de CA-08 da la mediana correcta (incidencia retroactiva de la mediana)", () => {
    const filas = (ruta) => JSON.parse(readFileSync(ruta, "utf8")).filas.map((f) => f.planMs);
    expect(mediana(filas("docs/verificacion/2026-10-04-ca08-local.json"))).toBe(303);
    expect(mediana(filas("docs/verificacion/produccion/2026-10-04-ca08-produccion.json"))).toBe(358.5);
  });
});

describe("conversión de tiempos", () => {
  it("mm:ss y h:mm:ss", () => {
    expect(aSegundos("07:59")).toBe(479);
    expect(aSegundos("1:02:03")).toBe(3723);
    expect(aSegundos("pendiente")).toBeNull();
  });
  it("rechaza marcas mal formadas", () => {
    expect(() => aSegundos("7.5")).toThrow();
    expect(() => aSegundos("00:75")).toThrow();
  });
  it("horas anotadas, incluso al cruzar la medianoche", () => {
    expect(minutosEntre("10:00", "10:07")).toBe(7);
    expect(minutosEntre("23:58", "00:03")).toBe(5);
    expect(minutosEntre(null, "10:00")).toBeNull();
  });
});

describe("tiempos de la grabación", () => {
  it("calcula el total y los cuatro tramos", () => {
    const t = tiemposGrabacion(ficticio("E1").grabacion);
    expect(t.total).toBe(292);
    expect(t.tramos).toEqual({ formulario: 50, correo: 90, captura: 150, generacion: 2 });
    expect(t.comparableConBaseDeDatos).toBe(242);
  });
  it("rechaza marcas fuera de orden", () => {
    expect(() => tiemposGrabacion(conGrabacion("E1", { generarPulsado: "02:00" }).grabacion)).toThrow(/fuera de orden/);
  });
  it("una grabación no completa no da tiempos", () => {
    expect(tiemposGrabacion({ estado: "cortada" })).toBeNull();
  });
});

describe("CA-20 por evaluador (protocolo, secciones 6 a 10)", () => {
  it("8 min exactos cumple; 8 min 1 s no cumple", () => {
    expect(evaluarEvaluador(conGrabacion("E1", { registroVisible: "00:00", planVisible: "08:00" })).resultado).toBe(RESULTADO.CUMPLE);
    expect(evaluarEvaluador(conGrabacion("E1", { registroVisible: "00:00", planVisible: "08:01" })).resultado).toBe(RESULTADO.NO_CUMPLE);
  });
  it("con ayuda no cuenta como cumplido aunque el tiempo sea menor", () => {
    expect(evaluarEvaluador(ficticio("E1", { ayuda: { recibida: true } })).resultado).toBe(RESULTADO.CON_AYUDA);
  });
  it("experiencia previa: excluido", () => {
    const r = evaluarEvaluador(ficticio("E1", { experienciaPrevia: { excluido: true, motivo: "usó la aplicación" } }));
    expect(r.resultado).toBe(RESULTADO.EXCLUIDO);
  });
  it("correo que no llegó en 10 minutos", () => {
    expect(evaluarEvaluador(ficticio("E1", { correoNoLlegoEn10Min: true })).resultado).toBe(RESULTADO.NO_CUMPLE_INFRAESTRUCTURA);
  });
  it("sin grabación: pendiente, aunque haya horas anotadas y base de datos bajo el umbral", () => {
    expect(evaluarEvaluador(ficticio("E1", { grabacion: { estado: "no entregada" } })).resultado).toBe(RESULTADO.PENDIENTE);
  });
  it("sin grabación pero con cota inferior de la base de datos mayor de 8 min: no cumple", () => {
    const r = evaluarEvaluador(ficticio("E1", { grabacion: { estado: "cortada" }, baseDeDatos: { sCreacionAPrimerPlan: 500 } }));
    expect(r.resultado).toBe(RESULTADO.NO_CUMPLE);
  });
  it("marca para revisar si grabación y base de datos difieren más de 60 s", () => {
    const r = evaluarEvaluador(ficticio("E1", { baseDeDatos: { sCreacionAPrimerPlan: 100, ejecutadaAntesDelMensaje3: true } }));
    expect(r.contraste).toBe(142);
    expect(r.observaciones.join(" ")).toMatch(/difieren 142 s/);
  });
  it("advierte si la consulta se ejecutó después de la Parte B", () => {
    const r = evaluarEvaluador(ficticio("E1", { baseDeDatos: { sCreacionAPrimerPlan: 240, ejecutadaAntesDelMensaje3: false } }));
    expect(r.observaciones.join(" ")).toMatch(/después de la Parte B/);
  });
});

describe("CA-20 global: 3 de 3", () => {
  it("cumple con tres válidos que cumplen", () => {
    expect(evaluarCA20([ficticio("E1"), ficticio("E2"), ficticio("E3")]).resultado).toBe(RESULTADO.CUMPLE);
  });
  it("uno que no cumple basta para no cumplir", () => {
    expect(evaluarCA20([ficticio("E1"), ficticio("E2"), conGrabacion("E3", { planVisible: "09:00" })]).resultado).toBe(RESULTADO.NO_CUMPLE);
  });
  it("un pendiente sin fallos deja CA-20 pendiente", () => {
    const r = evaluarCA20([ficticio("E1"), ficticio("E2"), ficticio("E3", { grabacion: { estado: "no entregada" } })]);
    expect(r.resultado).toBe(RESULTADO.PENDIENTE);
  });
  it("un excluido sin sustituto deja CA-20 pendiente; con sustituto se completa", () => {
    const excluido = ficticio("E2", { experienciaPrevia: { excluido: true } });
    const sinSustituto = evaluarCA20([ficticio("E1"), excluido, ficticio("E3")]);
    expect(sinSustituto.resultado).toBe(RESULTADO.PENDIENTE);
    expect(sinSustituto.faltanSustitutos).toBe(1);
    const conSustituto = evaluarCA20([ficticio("E1"), excluido, ficticio("E3"), ficticio("E2-S", { sustituyeA: "E2" })]);
    expect(conSustituto.resultado).toBe(RESULTADO.CUMPLE);
  });
  it("la mediana descriptiva usa el promedio de los centrales", () => {
    const r = evaluarCA20([
      ficticio("E1"),
      ficticio("E2", { experienciaPrevia: { excluido: true } }),
      conGrabacion("E3", { planVisible: "06:00" }),
    ]);
    expect(r.medianaTotalSegundos).toBe((292 + 350) / 2);
  });
});

describe("OBJ-05: sin promediar", () => {
  it("cumple solo si cada evaluador tiene 4 o más en las dos preguntas", () => {
    expect(evaluarOBJ05([ficticio("E1"), ficticio("E2"), ficticio("E3")]).resultado).toBe(RESULTADO.CUMPLE);
  });
  it("un 3 en una sola pregunta de un solo evaluador basta para no cumplir, aunque el promedio sea 4 o más", () => {
    const r = evaluarOBJ05([
      ficticio("E1", { obj05: { claridad: 5, accionabilidad: 5 } }),
      ficticio("E2", { obj05: { claridad: 5, accionabilidad: 5 } }),
      ficticio("E3", { obj05: { claridad: 3, accionabilidad: 5 } }),
    ]);
    expect(r.resultado).toBe(RESULTADO.NO_CUMPLE);
  });
  it("una calificación faltante deja OBJ-05 pendiente", () => {
    const r = evaluarOBJ05([ficticio("E1"), ficticio("E2"), ficticio("E3", { obj05: { claridad: null, accionabilidad: 4 } })]);
    expect(r.resultado).toBe(RESULTADO.PENDIENTE);
  });
  it("un excluido no cuenta, pero se conserva su calificación", () => {
    const r = evaluarOBJ05([
      ficticio("E1"),
      ficticio("E2", { experienciaPrevia: { excluido: true }, obj05: { claridad: 1, accionabilidad: 1 } }),
      ficticio("E3"),
    ]);
    expect(r.filas.find((f) => f.evaluador === "E2")).toMatchObject({ claridad: 1, cuenta: false });
    expect(r.resultado).toBe(RESULTADO.PENDIENTE); // solo dos válidos
  });
  it("rechaza calificaciones fuera de la escala", () => {
    expect(() => evaluarOBJ05([ficticio("E1", { obj05: { claridad: 6, accionabilidad: 4 } })])).toThrow(/1 a 5/);
  });
});

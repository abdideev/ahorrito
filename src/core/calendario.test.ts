import { describe, expect, it } from "vitest";
import {
  calcularFinHorizonte,
  diaDeLaSemana,
  diferenciaEnDias,
  fechaIso,
  generarSemanas,
  inicioDeSemana,
  numeroDeSemana,
  sumarDias,
  sumarMeses,
} from "./calendario";
import type { DiaSemana } from "./tipos";

const f = fechaIso;

describe("fechaIso", () => {
  it("acepta fechas reales, incluido el 29 de febrero de un anio bisiesto", () => {
    expect(f("2026-09-11")).toBe("2026-09-11");
    expect(f("2028-02-29")).toBe("2028-02-29");
    expect(f("2000-02-29")).toBe("2000-02-29");
  });

  it("rechaza fechas inexistentes o con formato distinto de AAAA-MM-DD", () => {
    for (const texto of ["2026-02-29", "1900-02-29", "2026-13-01", "2026-04-31", "2026-9-1", "26-09-11", "2026-09-11T00:00", ""]) {
      expect(() => f(texto), texto).toThrow(RangeError);
    }
  });
});

describe("aritmetica de fechas", () => {
  it("coincide con Date en UTC para cada dia entre 1900 y 2100", () => {
    // Verificacion exhaustiva del algoritmo de numero de dia contra la implementacion
    // de referencia del entorno. En las pruebas si se permite usar Date.
    const origen = f("1900-01-01");
    const msOrigen = Date.UTC(1900, 0, 1);
    const totalDias = diferenciaEnDias(origen, f("2100-12-31"));
    for (let d = 0; d <= totalDias; d += 1) {
      const referencia = new Date(msOrigen + d * 86_400_000);
      const esperado = referencia.toISOString().slice(0, 10);
      const obtenido = sumarDias(origen, d);
      if (obtenido !== esperado || diaDeLaSemana(obtenido) !== referencia.getUTCDay()) {
        expect.fail(`Desfase en el dia ${d}: ${obtenido} contra ${esperado}`);
      }
    }
    expect(totalDias).toBe(73413);
  });

  it("suma dias cruzando meses y anios, tambien hacia atras", () => {
    expect(sumarDias(f("2026-12-29"), 5)).toBe("2027-01-03");
    expect(sumarDias(f("2028-03-01"), -1)).toBe("2028-02-29");
    expect(diferenciaEnDias(f("2026-09-11"), f("2026-09-04"))).toBe(-7);
  });

  it("suma meses conservando el dia y ajustando al ultimo dia de los meses cortos", () => {
    expect(sumarMeses(f("2026-09-20"), 1)).toBe("2026-10-20");
    expect(sumarMeses(f("2026-12-20"), 1)).toBe("2027-01-20");
    expect(sumarMeses(f("2026-01-31"), 1)).toBe("2026-02-28");
    expect(sumarMeses(f("2028-01-31"), 1)).toBe("2028-02-29");
    expect(sumarMeses(f("2026-08-31"), 6)).toBe("2027-02-28");
    expect(sumarMeses(f("2026-09-11"), 0)).toBe("2026-09-11");
  });

  it("identifica el dia de la semana con 0 para domingo", () => {
    expect(diaDeLaSemana(f("2026-01-01"))).toBe(4); // jueves
    expect(diaDeLaSemana(f("2026-09-11"))).toBe(5); // viernes
    expect(diaDeLaSemana(f("2026-09-13"))).toBe(0); // domingo
  });
});

describe("inicioDeSemana", () => {
  const viernes = f("2026-09-11");

  it.each<[DiaSemana, string]>([
    [1, "2026-09-07"], // lunes anterior
    [0, "2026-09-06"], // domingo anterior
    [6, "2026-09-05"], // sabado anterior
    [5, "2026-09-11"], // la propia fecha: coincide con el dia de inicio
  ])("con dia de inicio %i la semana del viernes 11 inicia el %s", (dia, esperado) => {
    expect(inicioDeSemana(viernes, dia)).toBe(esperado);
  });

  it("rechaza un dia de inicio fuera de 0 a 6", () => {
    expect(() => inicioDeSemana(viernes, 7 as DiaSemana)).toThrow(RangeError);
    expect(() => inicioDeSemana(viernes, 1.5 as DiaSemana)).toThrow(RangeError);
  });
});

describe("generarSemanas", () => {
  it("CA-02: con inicio en lunes todas las semanas inician en lunes", () => {
    const semanas = generarSemanas(f("2026-09-11"), 1, f("2026-10-20"));
    expect(semanas.length).toBeGreaterThan(0);
    for (const semana of semanas) {
      expect(diaDeLaSemana(semana.inicio)).toBe(1);
    }
  });

  it("dia de inicio distinto de lunes: semanas contiguas de miercoles a martes", () => {
    const semanas = generarSemanas(f("2026-09-11"), 3, f("2026-10-01"));
    expect(semanas).toEqual([
      { numero: 1, inicio: "2026-09-09", fin: "2026-09-15" },
      { numero: 2, inicio: "2026-09-16", fin: "2026-09-22" },
      { numero: 3, inicio: "2026-09-23", fin: "2026-09-29" },
      { numero: 4, inicio: "2026-09-30", fin: "2026-10-06" },
    ]);
  });

  it("genera una sola semana cuando el fin cae en la semana de la referencia", () => {
    expect(generarSemanas(f("2026-09-11"), 1, f("2026-09-11"))).toHaveLength(1);
    expect(generarSemanas(f("2026-09-11"), 1, f("2026-09-13"))).toHaveLength(1);
  });

  it("agrega la semana siguiente cuando el fin coincide con su primer dia", () => {
    const semanas = generarSemanas(f("2026-09-11"), 1, f("2026-09-14"));
    expect(semanas.map((s) => s.inicio)).toEqual(["2026-09-07", "2026-09-14"]);
  });

  it("rechaza un fin anterior a la referencia", () => {
    expect(() => generarSemanas(f("2026-09-11"), 1, f("2026-09-10"))).toThrow(RangeError);
  });
});

describe("calcularFinHorizonte", () => {
  const referencia = f("2026-09-11");

  it("usa la fecha relevante mas lejana cuando cae dentro de seis meses", () => {
    expect(calcularFinHorizonte(referencia, [f("2026-10-20"), f("2026-12-20"), f("2026-11-20")])).toBe(
      "2026-12-20",
    );
  });

  it("horizonte truncado a 6 meses: una fecha posterior no extiende el horizonte", () => {
    expect(calcularFinHorizonte(referencia, [f("2027-06-20")])).toBe("2027-03-11");
  });

  it("acepta como fin exactamente el ultimo dia de los seis meses", () => {
    expect(calcularFinHorizonte(referencia, [f("2027-03-11")])).toBe("2027-03-11");
  });

  it("no queda antes de la referencia si no hay fechas o todas son pasadas", () => {
    expect(calcularFinHorizonte(referencia, [])).toBe("2026-09-11");
    expect(calcularFinHorizonte(referencia, [f("2026-08-20")])).toBe("2026-09-11");
  });
});

describe("numeroDeSemana", () => {
  const semanas = generarSemanas(f("2026-09-11"), 1, f("2026-09-27"));

  it("vencimiento coincidente con el inicio de semana pertenece a la semana que inicia", () => {
    expect(numeroDeSemana(semanas, f("2026-09-14"))).toBe(2);
    expect(numeroDeSemana(semanas, f("2026-09-13"))).toBe(1);
  });

  it("devuelve null para fechas fuera del horizonte o sin semanas", () => {
    expect(numeroDeSemana(semanas, f("2026-09-06"))).toBeNull();
    expect(numeroDeSemana(semanas, f("2026-09-28"))).toBeNull();
    expect(numeroDeSemana([], f("2026-09-14"))).toBeNull();
  });
});

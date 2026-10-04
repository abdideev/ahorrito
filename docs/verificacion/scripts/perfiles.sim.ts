/**
 * Resultados esperados de los perfiles P1 a P3 (plan de pruebas, sección 7.1), calculados con
 * el motor real. Imprime, por perfil, las semanas, las sobrecargadas, las que quedan en déficit
 * y la evaluación de la meta, para compararlos con lo que muestra la interfaz.
 *
 * Las fechas límite de los perfiles son fijas; lo que cambia con el día es la fecha de
 * referencia y, con ella, las semanas del horizonte.
 */
import { it } from "vitest";
import { fechaIso as f } from "@/core/calendario";
import { calcularPlan } from "@/core/plan";
import { centavos, type EntradaPlan } from "@/core/tipos";
import { fechaDeHoyEnMexico } from "@/lib/fecha";

const pesos = (n: number) => centavos(Math.round(n * 100));
const pago = (id: string, monto: number, fecha: string, ocurrencias: number) => ({
  id,
  monto: pesos(monto),
  fechaLimite: f(fecha),
  ocurrencias,
});

const REFERENCIA = f(process.env.FECHA_REFERENCIA ?? fechaDeHoyEnMexico());

const PERFILES: Record<string, EntradaPlan> = {
  "P1 · Ingreso muy ajustado": {
    fechaReferencia: REFERENCIA,
    presupuesto: { montoSemanal: pesos(700), diaInicioSemana: 1 },
    compromisos: [
      pago("Renta", 1800, "2026-11-05", 3),
      pago("Transporte", 600, "2026-10-15", 3),
      pago("Servicio de internet", 350, "2026-10-20", 3),
      pago("Teléfono", 250, "2026-10-28", 3),
    ],
    metaAhorro: null,
  },
  "P2 · Vencimiento grande a corto plazo": {
    fechaReferencia: REFERENCIA,
    presupuesto: { montoSemanal: pesos(1500), diaInicioSemana: 4 },
    compromisos: [
      pago("Inscripción escolar", 6000, "2026-10-16", 1),
      pago("Renta", 2000, "2026-11-01", 3),
      pago("Gimnasio", 300, "2026-10-25", 3),
    ],
    metaAhorro: null,
  },
  "P3 · Meta poco realista": {
    fechaReferencia: REFERENCIA,
    presupuesto: { montoSemanal: pesos(2000), diaInicioSemana: 0 },
    compromisos: [pago("Renta", 2500, "2026-11-03", 2), pago("Servicios del hogar", 600, "2026-10-22", 2)],
    ingresosExtra: [{ id: "i1", monto: pesos(1000), fecha: f("2026-10-23") }],
    metaAhorro: { montoObjetivo: pesos(25000), fechaObjetivo: f("2026-12-04") },
  },
};

const lista = (numeros: number[]) => (numeros.length > 0 ? numeros.join(", ") : "ninguna");

it("calcula los resultados esperados de P1 a P3", () => {
  console.log(`Fecha de referencia: ${REFERENCIA}`);
  for (const [nombre, entrada] of Object.entries(PERFILES)) {
    const plan = calcularPlan(entrada);
    const semanas = plan.asignaciones;
    console.log(`\n${nombre}: ${semanas.length} semanas (${plan.inicioHorizonte} a ${plan.finHorizonte})`);
    console.log(`  sobrecargadas: ${lista(semanas.filter((s) => s.sobrecargada).map((s) => s.numeroSemana))}`);
    console.log(`  en déficit: ${lista(semanas.filter((s) => s.enDeficit).map((s) => s.numeroSemana))}`);
    console.log(
      `  remanente mínimo: ${Math.min(...semanas.map((s) => s.remanente)) / 100}` +
        ` · apartado máximo: ${Math.max(...semanas.map((s) => s.montoApartado)) / 100}`,
    );
    console.log(`  semana 1: aparta ${semanas[0].montoApartado / 100}, queda ${semanas[0].remanente / 100}`);
    if (plan.evaluacionMeta) {
      const meta = plan.evaluacionMeta;
      console.log(
        `  meta: ${meta.viable ? "alcanzable" : "no alcanzable"} · ahorro posible ${meta.ahorroPosible / 100}` +
          ` · faltante ${meta.faltante / 100}`,
      );
    }
  }
});

/**
 * Perfiles P1 a P3 para las sesiones de validación (Fase 7). Son los del plan de pruebas,
 * sección 7.1 (`docs/verificacion/scripts/perfiles.sim.ts`), con todas sus fechas desplazadas
 * DESPLAZAMIENTO_DIAS días. La referencia original era el 05/10/2026; con +15 días, cada
 * vencimiento conserva su distancia a la nueva referencia (20/10/2026) y todos quedan en el
 * futuro.
 *
 * Imprime, por perfil, los datos que captura el evaluador y el resultado esperado del motor real.
 * El resultado esperado NO se entrega al evaluador.
 */
import { it } from "vitest";
import { fechaIso as f, sumarDias } from "@/core/calendario";
import { calcularPlan } from "@/core/plan";
import { centavos, type EntradaPlan } from "@/core/tipos";
import { fechaDeHoyEnMexico } from "@/lib/fecha";

export const DESPLAZAMIENTO_DIAS = 15;

const pesos = (n: number) => centavos(Math.round(n * 100));
const mover = (fecha: string) => sumarDias(f(fecha), DESPLAZAMIENTO_DIAS);
const pago = (id: string, monto: number, fecha: string, ocurrencias: number) => ({
  id,
  monto: pesos(monto),
  fechaLimite: mover(fecha),
  ocurrencias,
});

const REFERENCIA = f(process.env.FECHA_REFERENCIA ?? fechaDeHoyEnMexico());
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

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
    ingresosExtra: [{ id: "i1", monto: pesos(1000), fecha: mover("2026-10-23") }],
    metaAhorro: { montoObjetivo: pesos(25000), fechaObjetivo: mover("2026-12-04") },
  },
};

const lista = (numeros: number[]) => (numeros.length > 0 ? numeros.join(", ") : "ninguna");
const dinero = (c: number) => (c / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 });

it("calcula los datos y el resultado esperado de P1 a P3 para la validación", () => {
  console.log(`Fecha de referencia: ${REFERENCIA} · desplazamiento: +${DESPLAZAMIENTO_DIAS} días`);
  for (const [nombre, entrada] of Object.entries(PERFILES)) {
    console.log(`\n${nombre}`);
    console.log(`  presupuesto: ${dinero(entrada.presupuesto.montoSemanal)} semanales, inicia en ${DIAS[entrada.presupuesto.diaInicioSemana]}`);
    for (const c of entrada.compromisos) {
      console.log(`  pago: ${c.id} · ${dinero(c.monto)} · ${c.fechaLimite} · ${c.ocurrencias} mes(es)`);
    }
    for (const i of entrada.ingresosExtra ?? []) console.log(`  ingreso extra (después del primer plan): ${dinero(i.monto)} · ${i.fecha}`);
    if (entrada.metaAhorro) {
      console.log(`  meta (después del primer plan): ${dinero(entrada.metaAhorro.montoObjetivo)} · ${entrada.metaAhorro.fechaObjetivo}`);
    }
    // Primer plan: solo presupuesto y pagos (protocolo, regla de CA-20).
    const primero = calcularPlan({ ...entrada, ingresosExtra: [], metaAhorro: null });
    const s = primero.asignaciones;
    console.log(`  PRIMER PLAN (presupuesto y pagos): ${s.length} semanas (${primero.inicioHorizonte} a ${primero.finHorizonte})`);
    console.log(`    sobrecargadas: ${lista(s.filter((x) => x.sobrecargada).map((x) => x.numeroSemana))}`);
    console.log(`    en déficit: ${lista(s.filter((x) => x.enDeficit).map((x) => x.numeroSemana))}`);
    console.log(`    semana 1: aparta ${dinero(s[0].montoApartado)}, queda ${dinero(s[0].remanente)}`);
    console.log(`    remanente mínimo: ${dinero(Math.min(...s.map((x) => x.remanente)))}`);
    if (entrada.metaAhorro || (entrada.ingresosExtra ?? []).length > 0) {
      const completo = calcularPlan(entrada);
      const m = completo.evaluacionMeta;
      console.log(`  PLAN CON LO OPCIONAL: ${completo.asignaciones.length} semanas (${completo.inicioHorizonte} a ${completo.finHorizonte})`);
      if (m) console.log(`    meta: ${m.viable ? "alcanzable" : "no alcanzable"} · ahorro posible ${dinero(m.ahorroPosible)} · faltante ${dinero(m.faltante)}`);
    }
  }
});

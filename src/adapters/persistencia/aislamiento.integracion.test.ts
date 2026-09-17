/**
 * CA-10 · Aislamiento entre usuarios (RNF-04, amenaza AM-01).
 *
 * Criterio de aceptación: "Diez intentos de consultar el plan de otro usuario mediante
 * manipulación del identificador devuelven error de autorización."
 *
 * Es una prueba de integración: se conecta a la base de datos real con la clave pública,
 * como lo haría el navegador, y con dos usuarios distintos. No usa la clave de servicio,
 * que ignoraría la seguridad por fila y volvería la prueba inútil.
 *
 * Requiere en .env.local:
 *   PRUEBA_USUARIO_A_CORREO, PRUEBA_USUARIO_A_CONTRASENA
 *   PRUEBA_USUARIO_B_CORREO, PRUEBA_USUARIO_B_CONTRASENA
 * Si faltan, las pruebas se omiten en lugar de fallar.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { fechaIso } from "@/core/calendario";
import { calcularPlan } from "@/core/plan";
import { centavos, type EntradaPlan, type Plan } from "@/core/tipos";
import type { RepositorioPlanes } from "@/ports/repositorio";
import { crearRepositorioSupabase } from "./repositorio-supabase";

const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE_PUBLICA = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const USUARIOS = {
  a: { correo: process.env.PRUEBA_USUARIO_A_CORREO, contrasena: process.env.PRUEBA_USUARIO_A_CONTRASENA },
  b: { correo: process.env.PRUEBA_USUARIO_B_CORREO, contrasena: process.env.PRUEBA_USUARIO_B_CONTRASENA },
};

const CONFIGURADO = Boolean(
  URL_SUPABASE && CLAVE_PUBLICA && USUARIOS.a.correo && USUARIOS.a.contrasena && USUARIOS.b.correo && USUARIOS.b.contrasena,
);

const TABLAS = [
  "planes",
  "asignaciones_semanales",
  "presupuestos",
  "compromisos",
  "ingresos_extra",
  "metas_ahorro",
] as const;

const pesos = (cantidad: number) => centavos(Math.round(cantidad * 100));

const ENTRADA: EntradaPlan = {
  fechaReferencia: fechaIso("2026-09-14"),
  presupuesto: { montoSemanal: pesos(500), diaInicioSemana: 1 },
  compromisos: [
    { id: "tarjeta", monto: pesos(600), fechaLimite: fechaIso("2026-09-30"), ocurrencias: 2 },
  ],
  ingresosExtra: [{ id: "beca", monto: pesos(250.25), fecha: fechaIso("2026-10-05") }],
  metaAhorro: { montoObjetivo: pesos(1000), fechaObjetivo: fechaIso("2026-11-30") },
};

function clienteAnonimo(): SupabaseClient {
  return createClient(URL_SUPABASE as string, CLAVE_PUBLICA as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function iniciarSesion(correo: string, contrasena: string): Promise<SupabaseClient> {
  const cliente = clienteAnonimo();
  const { error } = await cliente.auth.signInWithPassword({ email: correo, password: contrasena });
  if (error) {
    throw new Error(`No se pudo iniciar sesion con ${correo}: ${error.message}`);
  }
  return cliente;
}

describe.skipIf(!CONFIGURADO)("CA-10 · aislamiento entre usuarios", () => {
  let clienteA: SupabaseClient;
  let clienteB: SupabaseClient;
  let repositorioA: RepositorioPlanes;
  let repositorioB: RepositorioPlanes;
  let planCalculado: Plan;
  let idPlanDeA: string;

  beforeAll(async () => {
    clienteA = await iniciarSesion(USUARIOS.a.correo as string, USUARIOS.a.contrasena as string);
    clienteB = await iniciarSesion(USUARIOS.b.correo as string, USUARIOS.b.contrasena as string);
    repositorioA = crearRepositorioSupabase(clienteA);
    repositorioB = crearRepositorioSupabase(clienteB);
    planCalculado = calcularPlan(ENTRADA);
    idPlanDeA = await repositorioA.guardarPlan(planCalculado);
  });

  afterAll(async () => {
    if (idPlanDeA) {
      await clienteA.from("planes").delete().eq("id", idPlanDeA);
    }
    await Promise.all([clienteA?.auth.signOut(), clienteB?.auth.signOut()]);
  });

  describe("RF-12 · guardado y consulta", () => {
    it("el plan vuelve de la base de datos identico al calculado", async () => {
      const guardado = await repositorioA.obtenerPlan(idPlanDeA);
      expect(guardado).not.toBeNull();
      expect(guardado?.plan).toEqual(planCalculado);
      expect(guardado?.explicacion).toBeNull();
    });

    it("el plan aparece en la lista del propietario con su numero de semanas", async () => {
      const planes = await repositorioA.listarPlanes();
      const resumen = planes.find((plan) => plan.id === idPlanDeA);
      expect(resumen).toBeDefined();
      expect(resumen?.semanas).toBe(planCalculado.asignaciones.length);
      expect(resumen?.metaViable).toBe(planCalculado.evaluacionMeta?.viable);
    });

    it("guardar un plan es atomico: no existe plan sin asignaciones", async () => {
      // La funcion guardar_plan rechaza una lista vacia antes de insertar el plan.
      const { error } = await clienteA.rpc("guardar_plan", {
        plan: { fecha_referencia: "2026-09-14", inicio_horizonte: "2026-09-14", fin_horizonte: "2026-09-20" },
        asignaciones: [],
      });
      expect(error).not.toBeNull();

      const { data } = await clienteA.from("planes").select("id, asignaciones_semanales(count)");
      const sinAsignaciones = (data ?? []).filter(
        (fila) => ((fila as { asignaciones_semanales: { count: number }[] }).asignaciones_semanales[0]?.count ?? 0) === 0,
      );
      expect(sinAsignaciones).toEqual([]);
    });

    it("rechaza un importe que no tenga dos decimales exactos", async () => {
      const { error } = await clienteA.rpc("guardar_plan", {
        plan: { fecha_referencia: "2026-09-14", inicio_horizonte: "2026-09-14", fin_horizonte: "2026-09-20" },
        asignaciones: [
          {
            numero_semana: 1,
            fecha_inicio: "2026-09-14",
            fecha_fin: "2026-09-20",
            ingresos_extra: "0.00",
            monto_disponible: "500.005",
            monto_apartado: "0.00",
            monto_vencimientos: "0.00",
            remanente: "500.00",
            aporte_meta: "0.00",
            sobrecargada: false,
            en_deficit: false,
            detalle: { apartados: [], vencimientos: [] },
          },
        ],
      });
      expect(error).not.toBeNull();
    });
  });

  describe("CA-10 · diez intentos de acceso cruzado", () => {
    it("ningun intento del usuario B alcanza datos del usuario A", async () => {
      const intentos: { descripcion: string; filas: number }[] = [];
      // Los constructores de consulta de Supabase son "thenables": se esperan con await
      // pero no son promesas completas.
      const registrar = async (descripcion: string, consulta: PromiseLike<{ data: unknown[] | null }>) => {
        const { data } = await consulta;
        intentos.push({ descripcion, filas: (data ?? []).length });
      };

      // 1 y 2: por el puerto del repositorio.
      const plan = await repositorioB.obtenerPlan(idPlanDeA);
      intentos.push({ descripcion: "obtenerPlan con el id de A", filas: plan === null ? 0 : 1 });
      const lista = await repositorioB.listarPlanes();
      intentos.push({
        descripcion: "listarPlanes incluye el plan de A",
        filas: lista.filter((resumen) => resumen.id === idPlanDeA).length,
      });

      // 3: consulta directa del plan por su identificador.
      await registrar("select planes por id de A", clienteB.from("planes").select("*").eq("id", idPlanDeA));
      // 4: las asignaciones de ese plan.
      await registrar(
        "select asignaciones_semanales del plan de A",
        clienteB.from("asignaciones_semanales").select("*").eq("plan_id", idPlanDeA),
      );
      // 5 a 10: lectura completa de cada tabla con datos del usuario.
      for (const tabla of TABLAS) {
        await registrar(`select * from ${tabla}`, clienteB.from(tabla).select("*"));
      }
      // 11: intento de modificar la explicacion del plan ajeno.
      await registrar(
        "update de la explicacion del plan de A",
        clienteB.from("planes").update({ explicacion: "intrusion" }).eq("id", idPlanDeA).select(),
      );

      expect(intentos.length).toBeGreaterThanOrEqual(10);
      expect(intentos.filter((intento) => intento.filas > 0)).toEqual([]);
    });

    it("el usuario B no puede crear un plan a nombre del usuario A", async () => {
      const { data: perfilDeB } = await clienteB.from("perfiles").select("id").maybeSingle();
      const { data: filasDeA } = await clienteA.from("perfiles").select("id").maybeSingle();
      const idDeA = (filasDeA as { id: string } | null)?.id;
      expect(idDeA).toBeDefined();
      expect((perfilDeB as { id: string } | null)?.id).not.toBe(idDeA);

      const { error } = await clienteB.from("planes").insert({
        usuario_id: idDeA,
        fecha_referencia: "2026-09-14",
        inicio_horizonte: "2026-09-14",
        fin_horizonte: "2026-09-20",
      });
      expect(error).not.toBeNull();
      expect(error?.code).toBe("42501");
    });

    it("una sesion anonima no obtiene ninguna fila de ninguna tabla", async () => {
      const anonimo = clienteAnonimo();
      for (const tabla of TABLAS) {
        const { data } = await anonimo.from(tabla).select("*");
        expect(data ?? [], tabla).toEqual([]);
      }
    });
  });
});

describe.skipIf(CONFIGURADO)("CA-10 · aislamiento entre usuarios", () => {
  it("requiere los usuarios de prueba en .env.local", () => {
    expect(CONFIGURADO).toBe(false);
  });
});

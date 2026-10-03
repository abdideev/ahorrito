/**
 * Captura del usuario contra la base de datos real (RF-02 a RF-06, SC-06).
 *
 * Verifica las doce operaciones que SC-06 agregó a I-04, y repite sobre ellas la
 * comprobación de aislamiento de CA-10: lo que el usuario B intenta leer, modificar o
 * borrar de los datos de C no alcanza ninguna fila.
 *
 * El propietario de la captura es el usuario C, exclusivo de este archivo, porque la prueba
 * borra toda su captura antes y después de ejecutarse. Hasta la incidencia #27 lo era el
 * usuario A, que también es la cuenta de la verificación manual en el navegador: cada
 * ejecución borraba los datos con los que se revisaba la interfaz. B sigue siendo el
 * usuario que intenta el acceso cruzado y su captura no se toca.
 *
 * Requiere en .env.local los usuarios C y B (`PRUEBA_USUARIO_C_*` y `PRUEBA_USUARIO_B_*`).
 * Si faltan, las pruebas se omiten en lugar de fallar.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { fechaIso } from "@/core/calendario";
import { centavos } from "@/core/tipos";
import type { RepositorioPlanes } from "@/ports/repositorio";
import { crearRepositorioSupabase } from "./repositorio-supabase";

const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE_PUBLICA = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const USUARIOS = {
  c: { correo: process.env.PRUEBA_USUARIO_C_CORREO, contrasena: process.env.PRUEBA_USUARIO_C_CONTRASENA },
  b: { correo: process.env.PRUEBA_USUARIO_B_CORREO, contrasena: process.env.PRUEBA_USUARIO_B_CONTRASENA },
};
const CONFIGURADO = Boolean(
  URL_SUPABASE && CLAVE_PUBLICA && USUARIOS.c.correo && USUARIOS.c.contrasena && USUARIOS.b.correo && USUARIOS.b.contrasena,
);

const pesos = (cantidad: number) => centavos(Math.round(cantidad * 100));
const f = fechaIso;

async function iniciarSesion(correo: string, contrasena: string): Promise<SupabaseClient> {
  const cliente = createClient(URL_SUPABASE as string, CLAVE_PUBLICA as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await cliente.auth.signInWithPassword({ email: correo, password: contrasena });
  if (error) {
    throw new Error(`No se pudo iniciar sesion con ${correo}: ${error.message}`);
  }
  return cliente;
}

describe.skipIf(!CONFIGURADO)("SC-06 · captura del usuario contra la base de datos", () => {
  let clienteC: SupabaseClient;
  let clienteB: SupabaseClient;
  let repositorioC: RepositorioPlanes;
  let repositorioB: RepositorioPlanes;

  beforeAll(async () => {
    // Protección de la #27: si C se configura con la cuenta de A, la limpieza borraría
    // la captura de la verificación manual. Se detiene antes de iniciar sesión.
    if (USUARIOS.c.correo === process.env.PRUEBA_USUARIO_A_CORREO) {
      throw new Error("PRUEBA_USUARIO_C_CORREO no puede ser la cuenta del usuario A (incidencia #27)");
    }
    clienteC = await iniciarSesion(USUARIOS.c.correo as string, USUARIOS.c.contrasena as string);
    clienteB = await iniciarSesion(USUARIOS.b.correo as string, USUARIOS.b.contrasena as string);
    repositorioC = crearRepositorioSupabase(clienteC);
    repositorioB = crearRepositorioSupabase(clienteB);
    // La prueba parte de un estado conocido, sin tocar los datos del usuario B.
    await limpiar(clienteC);
  });

  afterAll(async () => {
    if (clienteC) {
      await limpiar(clienteC);
    }
    await Promise.all([clienteC?.auth.signOut(), clienteB?.auth.signOut()]);
  });

  async function limpiar(cliente: SupabaseClient) {
    await cliente.from("compromisos").delete().not("id", "is", null);
    await cliente.from("ingresos_extra").delete().not("id", "is", null);
    await cliente.from("metas_ahorro").delete().not("id", "is", null);
    await cliente.from("presupuestos").delete().not("id", "is", null);
  }

  describe("RF-02 · presupuesto", () => {
    it("no existe antes de capturarlo", async () => {
      await expect(repositorioC.obtenerPresupuesto()).resolves.toBeNull();
    });

    it("se guarda y vuelve con el mismo monto y dia de inicio", async () => {
      const presupuesto = { montoSemanal: pesos(500.25), diaInicioSemana: 1 as const };

      await repositorioC.guardarPresupuesto(presupuesto);

      await expect(repositorioC.obtenerPresupuesto()).resolves.toEqual(presupuesto);
    });

    it("guardarlo otra vez reemplaza el anterior en lugar de duplicarlo", async () => {
      await repositorioC.guardarPresupuesto({ montoSemanal: pesos(800), diaInicioSemana: 0 });

      await expect(repositorioC.obtenerPresupuesto()).resolves.toEqual({
        montoSemanal: pesos(800),
        diaInicioSemana: 0,
      });
      const { data } = await clienteC.from("presupuestos").select("id");
      expect(data).toHaveLength(1);
    });
  });

  describe("RF-03 y RF-04 · compromisos", () => {
    let idCompromiso: string;

    it("se da de alta y aparece en la lista con su denominacion", async () => {
      idCompromiso = await repositorioC.agregarCompromiso({
        denominacion: "Tarjeta de credito",
        monto: pesos(600),
        fechaLimite: f("2026-10-30"),
        ocurrencias: 3,
      });

      const compromisos = await repositorioC.listarCompromisos();
      expect(compromisos).toEqual([
        {
          id: idCompromiso,
          denominacion: "Tarjeta de credito",
          monto: pesos(600),
          fechaLimite: f("2026-10-30"),
          ocurrencias: 3,
        },
      ]);
    });

    it("se modifica y conserva su identificador", async () => {
      const cambiado = await repositorioC.actualizarCompromiso(idCompromiso, {
        denominacion: "Tarjeta departamental",
        monto: pesos(450.5),
        fechaLimite: f("2026-11-15"),
        ocurrencias: 2,
      });

      expect(cambiado).toBe(true);
      const [compromiso] = await repositorioC.listarCompromisos();
      expect(compromiso).toEqual({
        id: idCompromiso,
        denominacion: "Tarjeta departamental",
        monto: pesos(450.5),
        fechaLimite: f("2026-11-15"),
        ocurrencias: 2,
      });
    });

    it("la base rechaza ocurrencias fuera del rango de 1 a 6 (regla de negocio 2)", async () => {
      await expect(
        repositorioC.agregarCompromiso({
          denominacion: "Invalido",
          monto: pesos(100),
          fechaLimite: f("2026-10-30"),
          ocurrencias: 7,
        }),
      ).rejects.toThrow();
    });

    it("se elimina y desaparece de la lista", async () => {
      await expect(repositorioC.eliminarCompromiso(idCompromiso)).resolves.toBe(true);
      await expect(repositorioC.listarCompromisos()).resolves.toEqual([]);
    });

    it("eliminar dos veces el mismo devuelve false la segunda", async () => {
      await expect(repositorioC.eliminarCompromiso(idCompromiso)).resolves.toBe(false);
    });
  });

  describe("RF-05 y RF-06 · ingresos y meta", () => {
    it("el ingreso extraordinario se guarda, se lista y se elimina", async () => {
      const id = await repositorioC.agregarIngreso({ monto: pesos(1200.75), fecha: f("2026-10-10") });

      await expect(repositorioC.listarIngresos()).resolves.toEqual([
        { id, monto: pesos(1200.75), fecha: f("2026-10-10") },
      ]);
      await expect(repositorioC.eliminarIngreso(id)).resolves.toBe(true);
      await expect(repositorioC.listarIngresos()).resolves.toEqual([]);
    });

    it("la meta se guarda, se reemplaza y se elimina", async () => {
      await expect(repositorioC.obtenerMeta()).resolves.toBeNull();

      await repositorioC.guardarMeta({ montoObjetivo: pesos(3000), fechaObjetivo: f("2026-12-31") });
      await expect(repositorioC.obtenerMeta()).resolves.toEqual({
        montoObjetivo: pesos(3000),
        fechaObjetivo: f("2026-12-31"),
      });

      await repositorioC.guardarMeta({ montoObjetivo: pesos(5000), fechaObjetivo: f("2027-01-31") });
      const { data } = await clienteC.from("metas_ahorro").select("id");
      expect(data).toHaveLength(1);

      await expect(repositorioC.eliminarMeta()).resolves.toBe(true);
      await expect(repositorioC.obtenerMeta()).resolves.toBeNull();
      await expect(repositorioC.eliminarMeta()).resolves.toBe(false);
    });
  });

  describe("RNF-04 · la captura de un usuario no alcanza a la de otro", () => {
    it("el usuario B no ve, no modifica ni borra la captura del usuario C", async () => {
      await repositorioC.guardarPresupuesto({ montoSemanal: pesos(500), diaInicioSemana: 1 });
      const idDeC = await repositorioC.agregarCompromiso({
        denominacion: "Renta",
        monto: pesos(700),
        fechaLimite: f("2026-10-05"),
        ocurrencias: 1,
      });

      const intentos = {
        listarCompromisos: (await repositorioB.listarCompromisos()).filter((c) => c.id === idDeC).length,
        actualizarCompromiso: (await repositorioB.actualizarCompromiso(idDeC, {
          denominacion: "Intrusion",
          monto: pesos(1),
          fechaLimite: f("2026-10-05"),
          ocurrencias: 1,
        }))
          ? 1
          : 0,
        eliminarCompromiso: (await repositorioB.eliminarCompromiso(idDeC)) ? 1 : 0,
      };

      expect(intentos).toEqual({ listarCompromisos: 0, actualizarCompromiso: 0, eliminarCompromiso: 0 });
      // El compromiso de C sigue intacto tras los tres intentos.
      const [compromisoDeC] = await repositorioC.listarCompromisos();
      expect(compromisoDeC).toMatchObject({ id: idDeC, denominacion: "Renta", monto: pesos(700) });
    });
  });
});

describe.skipIf(CONFIGURADO)("SC-06 · captura del usuario contra la base de datos", () => {
  it("requiere los usuarios de prueba en .env.local", () => {
    expect(CONFIGURADO).toBe(false);
  });
});

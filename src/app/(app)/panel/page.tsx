import type { Metadata } from "next";
import Link from "next/link";
import {
  actualizarCompromiso,
  agregarCompromiso,
  eliminarCompromiso,
  guardarPresupuesto,
} from "../acciones";
import { FormularioCompromiso } from "@/components/captura/formulario-compromiso";
import { FormularioPresupuesto } from "@/components/captura/formulario-presupuesto";
import { ListaCompromisos } from "@/components/captura/lista-compromisos";
import { centavosATextoPlano } from "@/lib/dinero";
import { repositorioDeLaSesion } from "@/lib/supabase/repositorio";
import { obtenerUsuarioActual } from "@/lib/supabase/usuario";
import { cerrarSesion } from "../../(auth)/acciones";

export const metadata: Metadata = {
  title: "Panel · Ahorrito",
};

/**
 * Panel del usuario (C-01). Reúne la captura y, a partir del bloque 4, el plan.
 *
 * Es un Server Component: lee los datos guardados con el repositorio de la sesión, de
 * modo que la pantalla siempre muestra lo que está en la base de datos y no una copia
 * en el navegador que pudiera divergir.
 */
export default async function Panel() {
  const [usuario, repositorio] = await Promise.all([obtenerUsuarioActual(), repositorioDeLaSesion()]);
  const [presupuesto, compromisos] = await Promise.all([
    repositorio.obtenerPresupuesto(),
    repositorio.listarCompromisos(),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-semibold">Tu plan</h1>
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="rounded border border-zinc-400 px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:border-zinc-600"
          >
            Cerrar sesión
          </button>
        </form>
      </header>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Sesión iniciada como <strong>{usuario?.correo}</strong>.
      </p>

      <section aria-labelledby="titulo-presupuesto" className="mt-10">
        <h2 id="titulo-presupuesto" className="text-xl font-semibold">
          1. Tu presupuesto
        </h2>
        <p className="mt-1 text-zinc-700 dark:text-zinc-300">
          {presupuesto === null
            ? "Empieza por aquí: es el dinero con el que cuentas cada semana."
            : "Puedes cambiarlo cuando quieras; el plan se recalcula con el nuevo monto."}
        </p>
        <FormularioPresupuesto
          accion={guardarPresupuesto}
          montoSemanal={presupuesto === null ? "" : centavosATextoPlano(presupuesto.montoSemanal)}
          diaInicioSemana={presupuesto?.diaInicioSemana ?? 1}
        />
      </section>

      <section aria-labelledby="titulo-compromisos" className="mt-12">
        <h2 id="titulo-compromisos" className="text-xl font-semibold">
          2. Tus pagos con fecha límite
        </h2>
        <p className="mt-1 text-zinc-700 dark:text-zinc-300">
          Registra cada pago una sola vez. Si se repite cada mes, indica cuántos meses seguidos.
        </p>

        <ListaCompromisos
          compromisos={compromisos}
          actualizar={actualizarCompromiso}
          eliminar={eliminarCompromiso}
        />

        <details
          className="mt-6 rounded border border-zinc-300 p-4 dark:border-zinc-700"
          open={compromisos.length === 0}
        >
          <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">
            Agregar un pago
          </summary>
          <div className="mt-4">
            <FormularioCompromiso
              accion={agregarCompromiso}
              iniciales={{ denominacion: "", monto: "", fechaLimite: "", ocurrencias: "1" }}
              textoBoton="Agregar pago"
            />
          </div>
        </details>
      </section>

      <p className="mt-12 text-sm text-zinc-600 dark:text-zinc-400">
        La meta de ahorro y la vista del plan se incorporan en los siguientes pasos de esta
        fase. Mientras tanto, puedes usar la{" "}
        <Link href="/demo" className="font-medium underline underline-offset-2">
          demostración del motor
        </Link>
        .
      </p>
    </main>
  );
}

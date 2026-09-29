import type { Metadata } from "next";
import Link from "next/link";
import { guardarPresupuesto } from "../acciones";
import { FormularioPresupuesto } from "@/components/captura/formulario-presupuesto";
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
  const presupuesto = await repositorio.obtenerPresupuesto();

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

      <p className="mt-10 text-sm text-zinc-600 dark:text-zinc-400">
        Los compromisos de pago, la meta de ahorro y la vista del plan se incorporan en los
        siguientes pasos de esta fase. Mientras tanto, puedes usar la{" "}
        <Link href="/demo" className="font-medium underline underline-offset-2">
          demostración del motor
        </Link>
        .
      </p>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/supabase/usuario";
import { cerrarSesion } from "../../(auth)/acciones";

export const metadata: Metadata = {
  title: "Panel · Ahorrito",
};

/**
 * Pantalla mínima protegida. Existe para verificar RF-01 y la protección de rutas;
 * la captura de datos y la vista del plan se construyen en la Fase 4.
 */
export default async function Panel() {
  const usuario = await obtenerUsuarioActual();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Panel</h1>
      <p className="mt-4">
        Sesión iniciada como <strong>{usuario?.correo}</strong>.
      </p>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        La captura de datos y la vista del plan se incorporan en la Fase 4. Mientras tanto,
        puedes usar la{" "}
        <Link href="/demo" className="font-medium underline underline-offset-2">
          demostración del motor
        </Link>
        .
      </p>

      <form action={cerrarSesion} className="mt-8">
        <button
          type="submit"
          className="rounded border border-zinc-400 px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:border-zinc-600"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { HistorialPlanes } from "@/components/plan/historial-planes";
import { repositorioDeLaSesion } from "@/lib/supabase/repositorio";

export const metadata: Metadata = {
  title: "Planes guardados · Ahorrito",
};

/**
 * Historial de planes (RF-12).
 *
 * El listado y el detalle los pide el componente de cliente a `GET /api/planes` y
 * `GET /api/planes/{id}`. Esta página solo aporta las denominaciones actuales de los
 * compromisos, que no viajan en el plan guardado: el plan conserva identificadores, y la
 * denominación puede haber cambiado o el pago puede haberse eliminado desde entonces.
 */
export default async function Planes() {
  const repositorio = await repositorioDeLaSesion();
  const compromisos = await repositorio.listarCompromisos();
  const denominaciones = Object.fromEntries(
    compromisos.map((compromiso) => [compromiso.id, compromiso.denominacion]),
  );

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl font-semibold">Planes guardados</h1>
        <Link href="/panel" className="text-sm font-medium underline underline-offset-2">
          Volver al panel
        </Link>
      </header>
      <p className="mt-2 text-zinc-700 dark:text-zinc-300">
        Cada vez que generas un plan, Ahorrito lo guarda tal como lo viste.
      </p>

      <div className="mt-8">
        <HistorialPlanes denominaciones={denominaciones} />
      </div>
    </main>
  );
}

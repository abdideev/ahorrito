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
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black tracking-tight text-texto sm:text-4xl">Planes guardados</h1>
        <Link href="/panel" className="boton-secundario text-sm">
          Volver al panel
        </Link>
      </header>
      <p className="mt-3 leading-7 text-texto-suave">
        Cada vez que generas un plan, Ahorrito lo guarda tal como lo viste.
      </p>

      <div className="mt-10">
        <HistorialPlanes denominaciones={denominaciones} />
      </div>
    </main>
  );
}

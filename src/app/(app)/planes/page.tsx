import type { Metadata } from "next";
import { HistorialPlanes } from "@/components/plan/historial-planes";
import { repositorioDeLaSesion } from "@/lib/supabase/repositorio";
import { TransicionRuta } from "@/components/ui/transicion-ruta";

export const metadata: Metadata = {
  title: "Planes guardados · Ahorrito",
  description: "Consulta el historial y el detalle de tus planes semanales guardados en Ahorrito.",
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
    <TransicionRuta>
      <main id="contenido" className="mx-auto w-full max-w-6xl px-4 pt-6 pb-12 sm:px-6 sm:pt-8">
        <header className="mb-4 px-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-texto sm:text-4xl">Planes guardados</h1>
          <p className="mt-2 max-w-2xl leading-7 text-texto-suave">
            Cada vez que generas un plan, Ahorrito lo guarda tal como lo viste.
          </p>
        </header>

        <HistorialPlanes denominaciones={denominaciones} />
      </main>
    </TransicionRuta>
  );
}

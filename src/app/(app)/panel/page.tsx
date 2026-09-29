import type { Metadata } from "next";
import Link from "next/link";
import {
  actualizarCompromiso,
  agregarCompromiso,
  agregarIngreso,
  eliminarCompromiso,
  eliminarIngreso,
  eliminarMeta,
  guardarMeta,
  guardarPresupuesto,
} from "../acciones";
import { FormularioCompromiso } from "@/components/captura/formulario-compromiso";
import { FormularioPresupuesto } from "@/components/captura/formulario-presupuesto";
import { FormularioMeta } from "@/components/captura/formulario-meta";
import { ListaCompromisos } from "@/components/captura/lista-compromisos";
import { SeccionIngresos } from "@/components/captura/seccion-ingresos";
import { GeneradorPlan } from "@/components/plan/generador-plan";
import { fechaDeMananaEnMexico } from "@/lib/fecha";
import { centavosATextoPlano, formatearPesos } from "@/lib/dinero";
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
  const [presupuesto, compromisos, ingresos, meta, planes] = await Promise.all([
    repositorio.obtenerPresupuesto(),
    repositorio.listarCompromisos(),
    repositorio.listarIngresos(),
    repositorio.obtenerMeta(),
    repositorio.listarPlanes(),
  ]);

  const faltanDatos = presupuesto === null || compromisos.length === 0;
  // Regla de negocio 6: lo opcional se pide después de mostrar el primer plan. Si el
  // usuario ya capturó algo, la sección sigue visible para que pueda corregirlo.
  const mostrarOpcionales = planes.length > 0 || ingresos.length > 0 || meta !== null;
  const denominaciones = Object.fromEntries(
    compromisos.map((compromiso) => [compromiso.id, compromiso.denominacion]),
  );

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

      <section aria-labelledby="titulo-plan" className="mt-12">
        <h2 id="titulo-plan" className="text-xl font-semibold">
          3. Tu plan semanal
        </h2>
        <p className="mt-1 text-zinc-700 dark:text-zinc-300">
          Ahorrito reparte tu presupuesto para que cada pago llegue a tiempo.
        </p>
        <GeneradorPlan denominaciones={denominaciones} faltanDatos={faltanDatos} />
        {planes.length > 0 && (
          <p className="mt-4 text-sm">
            <Link href="/planes" className="font-medium underline underline-offset-2">
              Ver mis {planes.length === 1 ? "plan guardado" : `${planes.length} planes guardados`}
            </Link>
          </p>
        )}
      </section>

      {mostrarOpcionales && (
      <section aria-labelledby="titulo-opcionales" className="mt-12">
        <h2 id="titulo-opcionales" className="text-xl font-semibold">
          4. Opcional: ingresos extra y meta de ahorro
        </h2>
        <p className="mt-1 text-zinc-700 dark:text-zinc-300">
          Nada de esto es obligatorio para generar tu plan. Complétalo cuando quieras afinarlo.
        </p>

        <details className="mt-4 rounded border border-zinc-300 p-4 dark:border-zinc-700" open={ingresos.length > 0}>
          <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">
            Ingresos extraordinarios
            {ingresos.length > 0 && (
              <span className="text-zinc-600 dark:text-zinc-400"> · {ingresos.length} registrados</span>
            )}
          </summary>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Dinero que recibirás una sola vez, como una beca o un aguinaldo.
          </p>
          <SeccionIngresos ingresos={ingresos} agregar={agregarIngreso} eliminar={eliminarIngreso} />
        </details>

        <details className="mt-4 rounded border border-zinc-300 p-4 dark:border-zinc-700" open={meta !== null}>
          <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">
            Meta de ahorro
            {meta !== null && (
              <span className="text-zinc-600 dark:text-zinc-400">
                {" · "}
                {formatearPesos(meta.montoObjetivo)} para el {meta.fechaObjetivo}
              </span>
            )}
          </summary>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Ahorrito te dirá si es alcanzable con lo que te sobra cada semana.
          </p>
          <FormularioMeta
            accion={guardarMeta}
            quitar={eliminarMeta}
            montoObjetivo={meta === null ? "" : centavosATextoPlano(meta.montoObjetivo)}
            fechaObjetivo={meta?.fechaObjetivo ?? ""}
            fechaMinima={fechaDeMananaEnMexico()}
          />
        </details>
      </section>
      )}

      <p className="mt-12 text-sm text-zinc-600 dark:text-zinc-400">
        ¿Quieres ver cómo funciona el motor de cálculo por dentro? Visita la{" "}
        <Link href="/demo" className="font-medium underline underline-offset-2">
          demostración del motor
        </Link>
        .
      </p>
    </main>
  );
}

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
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black tracking-tight text-texto sm:text-4xl">Tu plan</h1>
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="boton-secundario px-4 py-2 text-sm"
          >
            Cerrar sesión
          </button>
        </form>
      </header>
      <p className="mt-2 text-sm text-texto-suave">
        Sesión iniciada como <strong className="text-texto">{usuario?.correo}</strong>.
      </p>

      <section aria-labelledby="titulo-presupuesto" className="superficie mt-10 p-5 sm:p-8">
        <h2 id="titulo-presupuesto" className="text-2xl font-black tracking-tight text-texto">
          1. Tu presupuesto
        </h2>
        <p className="mt-2 leading-7 text-texto-suave">
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

      <section aria-labelledby="titulo-compromisos" className="superficie mt-8 p-5 sm:p-8">
        <h2 id="titulo-compromisos" className="text-2xl font-black tracking-tight text-texto">
          2. Tus pagos con fecha límite
        </h2>
        <p className="mt-2 leading-7 text-texto-suave">
          Registra cada pago una sola vez. Si se repite cada mes, indica cuántos meses seguidos.
        </p>

        <ListaCompromisos
          compromisos={compromisos}
          actualizar={actualizarCompromiso}
          eliminar={eliminarCompromiso}
        />

        <details
          className="mt-6 rounded-2xl border border-borde bg-fondo p-4 sm:p-5"
          open={compromisos.length === 0}
        >
          <summary className="flex min-h-11 cursor-pointer items-center rounded-xl px-2 py-2 font-bold text-texto">
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

      <section aria-labelledby="titulo-plan" className="superficie mt-8 p-5 sm:p-8">
        <h2 id="titulo-plan" className="text-2xl font-black tracking-tight text-texto">
          3. Tu plan semanal
        </h2>
        <p className="mt-2 leading-7 text-texto-suave">
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
      <section aria-labelledby="titulo-opcionales" className="superficie mt-8 p-5 sm:p-8">
        <h2 id="titulo-opcionales" className="text-2xl font-black tracking-tight text-texto">
          4. Opcional: ingresos extra y meta de ahorro
        </h2>
        <p className="mt-2 leading-7 text-texto-suave">
          Nada de esto es obligatorio para generar tu plan. Complétalo cuando quieras afinarlo.
        </p>

        <details className="mt-6 rounded-2xl border border-borde bg-fondo p-4 sm:p-5" open={ingresos.length > 0}>
          <summary className="flex min-h-11 cursor-pointer items-center rounded-xl px-2 py-2 font-bold text-texto">
            Ingresos extraordinarios
            {ingresos.length > 0 && (
              <span className="font-normal text-texto-suave"> · {ingresos.length} registrados</span>
            )}
          </summary>
          <p className="mt-3 text-sm leading-6 text-texto-suave">
            Dinero que recibirás una sola vez, como una beca o un aguinaldo.
          </p>
          <SeccionIngresos ingresos={ingresos} agregar={agregarIngreso} eliminar={eliminarIngreso} />
        </details>

        <details className="mt-4 rounded-2xl border border-borde bg-fondo p-4 sm:p-5" open={meta !== null}>
          <summary className="flex min-h-11 cursor-pointer items-center rounded-xl px-2 py-2 font-bold text-texto">
            Meta de ahorro
            {meta !== null && (
              <span className="font-normal text-texto-suave">
                {" · "}
                {formatearPesos(meta.montoObjetivo)} para el {meta.fechaObjetivo}
              </span>
            )}
          </summary>
          <p className="mt-3 text-sm leading-6 text-texto-suave">
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

      <p className="mt-10 text-sm leading-6 text-texto-suave">
        ¿Quieres ver cómo funciona el motor de cálculo por dentro? Visita la{" "}
        <Link href="/demo" className="font-medium underline underline-offset-2">
          demostración del motor
        </Link>
        .
      </p>
    </main>
  );
}

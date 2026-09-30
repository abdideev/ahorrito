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
import { TarjetaEditable } from "@/components/captura/tarjeta-editable";
import { IconoAlcancia, IconoBillete, IconoCalendario } from "@/components/ui/iconos";
import { DIAS_SEMANA } from "@/lib/captura/dias";
import { fechaDeMananaEnMexico } from "@/lib/fecha";
import { centavosATextoPlano, formatearPesos } from "@/lib/dinero";
import { repositorioDeLaSesion } from "@/lib/supabase/repositorio";
import { TransicionRuta } from "@/components/ui/transicion-ruta";

export const metadata: Metadata = {
  title: "Panel · Ahorrito",
  description: "Captura tu presupuesto y tus pagos para generar un plan semanal personalizado.",
};

/**
 * Panel del usuario (C-01). Reúne la captura y el plan en una cuadrícula Bento.
 *
 * Es un Server Component: lee los datos guardados con el repositorio de la sesión, de
 * modo que la pantalla siempre muestra lo que está en la base de datos y no una copia
 * en el navegador que pudiera divergir.
 */
export default async function Panel() {
  const repositorio = await repositorioDeLaSesion();
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

  const totalPagos = compromisos.reduce(
    (suma, compromiso) => suma + compromiso.monto * compromiso.ocurrencias,
    0,
  );
  // Cuántas semanas de presupuesto cubren los pagos registrados: da escala al monto sin
  // anticipar el plan, que además reparte según las fechas límite.
  const semanasDePagos =
    presupuesto === null || presupuesto.montoSemanal === 0 ? null : totalPagos / presupuesto.montoSemanal;

  return (
    <TransicionRuta>
      <main id="contenido" className="mx-auto w-full max-w-6xl px-4 pt-6 pb-12 sm:px-6 sm:pt-8">
        <div className="bento">
          <header className="px-1 md:col-span-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-texto sm:text-4xl">Tu plan</h1>
            <p className="mt-2 max-w-2xl leading-7 text-texto-suave">
              Captura tu presupuesto y tus pagos; Ahorrito calcula cuánto apartar cada semana.
            </p>
          </header>

          <TarjetaEditable
            className="md:col-span-6 lg:col-span-2"
            abiertoInicial={presupuesto === null}
            textoAccion={presupuesto === null ? "Capturar" : "Editar"}
            encabezado={
              <h2 className="flex items-center gap-3 text-xl font-bold text-texto">
                <span className="paso">1</span>
                Tu presupuesto
              </h2>
            }
            formulario={
              <FormularioPresupuesto
                accion={guardarPresupuesto}
                montoSemanal={presupuesto === null ? "" : centavosATextoPlano(presupuesto.montoSemanal)}
                diaInicioSemana={presupuesto?.diaInicioSemana ?? 1}
              />
            }
            resumen={
              presupuesto === null ? (
                <p className="mt-4 leading-7 text-texto-suave">
                  Empieza por aquí: es el dinero con el que cuentas cada semana.
                </p>
              ) : (
                <div className="mt-5">
                  <p className="text-4xl font-extrabold tracking-tight text-texto tabular-nums">
                    {formatearPesos(presupuesto.montoSemanal)}
                  </p>
                  <p className="mt-1 text-texto-suave">por semana</p>
                  <p className="chip chip-neutro mt-4">
                    <IconoCalendario className="size-3.5" />
                    Tu semana inicia en {nombreDelDia(presupuesto.diaInicioSemana)}
                  </p>
                  {semanasDePagos !== null && compromisos.length > 0 && (
                    <p className="mt-4 border-t border-borde pt-4 text-sm leading-6 text-texto-suave">
                      Tus pagos equivalen a{" "}
                      <strong className="text-texto">
                        {semanasDePagos.toLocaleString("es-MX", { maximumFractionDigits: 1 })}{" "}
                        {semanasDePagos === 1 ? "semana" : "semanas"}
                      </strong>{" "}
                      de presupuesto.
                    </p>
                  )}
                </div>
              )
            }
          />

          <TarjetaEditable
            className="md:col-span-6 lg:col-span-4"
            icono="agregar"
            abiertoInicial={compromisos.length === 0}
            textoAccion="Agregar pago"
            encabezado={
              <h2 className="flex items-center gap-3 text-xl font-bold text-texto">
                <span className="paso">2</span>
                Tus pagos con fecha límite
              </h2>
            }
            formulario={
              <>
                <p className="mb-4 text-sm leading-6 text-texto-suave">
                  Registra cada pago una sola vez. Si se repite cada mes, indica cuántos meses seguidos.
                </p>
                <FormularioCompromiso
                  accion={agregarCompromiso}
                  iniciales={{ denominacion: "", monto: "", fechaLimite: "", ocurrencias: "1" }}
                  textoBoton="Agregar pago"
                />
              </>
            }
            resumen={
              <ListaCompromisos
                compromisos={compromisos}
                actualizar={actualizarCompromiso}
                eliminar={eliminarCompromiso}
              />
            }
          />

          <GeneradorPlan
            denominaciones={denominaciones}
            faltanDatos={faltanDatos}
            cantidadPlanes={planes.length}
          />

          {mostrarOpcionales && (
            <>
              <header className="mt-4 px-1 md:col-span-6">
                <h2 className="flex items-center gap-3 text-xl font-bold text-texto">
                  <span className="paso">4</span>
                  Opcional: ingresos extra y meta de ahorro
                </h2>
                <p className="mt-2 leading-7 text-texto-suave">
                  Nada de esto es obligatorio para generar tu plan. Complétalo cuando quieras afinarlo.
                </p>
              </header>

              <section aria-labelledby="titulo-ingresos" className="tarjeta p-6 sm:p-7 md:col-span-3">
                <div className="flex items-start gap-4">
                  <span className="icono-tarjeta">
                    <IconoBillete />
                  </span>
                  <div>
                    <h3 id="titulo-ingresos" className="text-lg font-bold text-texto">
                      Ingresos extraordinarios
                      {ingresos.length > 0 && (
                        <span className="font-normal text-texto-suave"> · {ingresos.length} registrados</span>
                      )}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-texto-suave">
                      Dinero que recibirás una sola vez, como una beca o un aguinaldo.
                    </p>
                  </div>
                </div>
                <SeccionIngresos ingresos={ingresos} agregar={agregarIngreso} eliminar={eliminarIngreso} />
              </section>

              <section aria-labelledby="titulo-meta" className="tarjeta p-6 sm:p-7 md:col-span-3">
                <div className="flex items-start gap-4">
                  <span className="icono-tarjeta">
                    <IconoAlcancia />
                  </span>
                  <div>
                    <h3 id="titulo-meta" className="text-lg font-bold text-texto">
                      Meta de ahorro
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-texto-suave">
                      Ahorrito te dirá si es alcanzable con lo que te sobra cada semana.
                    </p>
                  </div>
                </div>
                <FormularioMeta
                  accion={guardarMeta}
                  quitar={eliminarMeta}
                  montoObjetivo={meta === null ? "" : centavosATextoPlano(meta.montoObjetivo)}
                  fechaObjetivo={meta?.fechaObjetivo ?? ""}
                  fechaMinima={fechaDeMananaEnMexico()}
                />
              </section>
            </>
          )}

          <p className="elevado mt-4 p-5 text-sm leading-6 text-texto-suave md:col-span-6">
            ¿Quieres ver cómo funciona el motor de cálculo por dentro? Visita la{" "}
            <Link href="/demo" className="font-semibold text-texto underline underline-offset-4">
              demostración del motor
            </Link>
            .
          </p>
        </div>
      </main>
    </TransicionRuta>
  );
}

function nombreDelDia(valor: number): string {
  return (DIAS_SEMANA.find((dia) => dia.valor === valor)?.nombre ?? "Lunes").toLowerCase();
}

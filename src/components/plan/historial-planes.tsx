"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { enfocarAlInicio } from "@/components/plan/enfocar";
import { VistaPlan } from "@/components/plan/vista-plan";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import {
  IconoCalendario,
  IconoCirculoCheck,
  IconoError,
  IconoFlecha,
  IconoPapelera,
} from "@/components/ui/iconos";
import type { Denominaciones } from "@/lib/plan/advertencias";
import { conDenominaciones } from "@/lib/plan/etiquetas";
import { formatearFechaCorta } from "@/lib/fecha";
import type { PlanGuardado, ResumenPlan } from "@/ports/repositorio";

interface Props {
  denominaciones: Denominaciones;
}

/** Filas por página: la lista cabe en una pantalla de escritorio sin desplazarse. */
const POR_PAGINA = 8;

/** Desde este ancho lista y detalle se ven lado a lado (breakpoint `lg` de Tailwind). */
const CONSULTA_ESCRITORIO = "(min-width: 64rem)";

const FORMATO_GENERADO = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Historial de planes guardados (RF-12), en disposición de lista y detalle.
 *
 * Consume `GET /api/planes` y `GET /api/planes/{id}`, que son las operaciones que I-01
 * define. Podría leer el repositorio directamente desde el servidor, pero entonces esas
 * dos operaciones del contrato quedarían sin uso real y sin verificar.
 *
 * En escritorio la lista, compacta y paginada, queda a la izquierda y el plan abierto a
 * la derecha; el más reciente se abre solo. En móvil el detalle sustituye a la lista y
 * un botón "Volver" devuelve el foco a la fila de la que se partió.
 */
export function HistorialPlanes({ denominaciones }: Props) {
  const [resumenes, setResumenes] = useState<ResumenPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<PlanGuardado | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const detalle = useRef<HTMLElement>(null);
  const filas = useRef(new Map<string, HTMLButtonElement>());
  const enfocarAlAbrir = useRef(false);
  const volverA = useRef<string | null>(null);
  // SC-07: borrado en dos pasos. `confirmando` es la fila que pide confirmación.
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const tituloLista = useRef<HTMLHeadingElement>(null);
  const enfocarTrasBorrar = useRef<string | null | undefined>(undefined);

  // Al abrir un plan a petición del usuario, el foco pasa a su detalle: queda a la vista
  // con el descargo arriba (CA-07) y el lector de pantalla anuncia a dónde llegó. La
  // apertura automática del más reciente no mueve el foco.
  useEffect(() => {
    if (abierto !== null && enfocarAlAbrir.current) {
      enfocarAlAbrir.current = false;
      enfocarAlInicio(detalle.current);
    } else if (abierto === null && volverA.current !== null) {
      // "Volver a la lista" en móvil: la fila de la que se partió recupera el foco.
      filas.current.get(volverA.current)?.focus();
      volverA.current = null;
    }
  }, [abierto]);

  useEffect(() => {
    let vigente = true;
    fetch("/api/planes")
      .then(async (respuesta) => {
        if (!respuesta.ok) {
          throw new Error(String(respuesta.status));
        }
        const datos = (await respuesta.json()) as { planes: ResumenPlan[] };
        if (!vigente) {
          return;
        }
        setResumenes(datos.planes);
        if (datos.planes.length > 0 && window.matchMedia(CONSULTA_ESCRITORIO).matches) {
          void abrir(datos.planes[0].id, false);
        }
      })
      .catch(() => {
        if (vigente) {
          setError("No pudimos cargar tus planes guardados.");
        }
      });
    // Evita escribir estado si el usuario se fue antes de que llegara la respuesta.
    return () => {
      vigente = false;
    };
  }, []);

  async function abrir(id: string, enfocar = true) {
    setCargandoDetalle(id);
    setError(null);
    try {
      const respuesta = await fetch(`/api/planes/${id}`);
      if (!respuesta.ok) {
        setError(respuesta.status === 404 ? "Ese plan ya no existe." : "No pudimos abrir ese plan.");
        return;
      }
      enfocarAlAbrir.current = enfocar;
      setAbierto((await respuesta.json()) as PlanGuardado);
    } catch {
      setError("Se interrumpió la conexión. Intenta de nuevo.");
    } finally {
      setCargandoDetalle(null);
    }
  }

  // Tras un borrado el foco pasa a la fila siguiente, o al título de la lista si ya no
  // quedan filas: nunca se queda en un botón que acaba de desaparecer.
  useEffect(() => {
    if (enfocarTrasBorrar.current === undefined) {
      return;
    }
    const id = enfocarTrasBorrar.current;
    enfocarTrasBorrar.current = undefined;
    const fila = id === null ? undefined : filas.current.get(id);
    if (fila) {
      fila.focus();
    } else {
      tituloLista.current?.focus();
    }
  }, [resumenes]);

  /** SC-07: elimina un plan con `DELETE /api/planes/{id}` (I-01). */
  async function eliminar(id: string) {
    if (resumenes === null) {
      return;
    }
    setEliminando(id);
    setError(null);
    try {
      const respuesta = await fetch(`/api/planes/${id}`, { method: "DELETE" });
      // 404: el plan ya no existe, que es justo lo que el usuario pidió.
      if (!respuesta.ok && respuesta.status !== 404) {
        setError("No pudimos eliminar el plan. Intenta de nuevo.");
        return;
      }
      const indice = resumenes.findIndex((resumen) => resumen.id === id);
      const restantes = resumenes.filter((resumen) => resumen.id !== id);
      enfocarTrasBorrar.current = (restantes[indice] ?? restantes[indice - 1])?.id ?? null;
      setResumenes(restantes);
      setConfirmando(null);
      setAviso("Plan eliminado.");
      if (pagina > 0 && pagina * POR_PAGINA >= restantes.length) {
        setPagina(pagina - 1);
      }
      if (abierto?.id === id) {
        setAbierto(null);
      }
    } catch {
      setError("Se interrumpió la conexión. Intenta de nuevo.");
    } finally {
      setEliminando(null);
    }
  }

  function volverALaLista() {
    volverA.current = abierto?.id ?? null;
    setAbierto(null);
  }

  if (error !== null && resumenes === null) {
    return (
      <p role="alert" className="rounded-2xl border border-error/40 bg-error-suave p-4 text-sm font-semibold text-error">
        {error}
      </p>
    );
  }

  if (resumenes === null) {
    return (
      <p className="tarjeta p-6">
        <AnimatedShinyText>Cargando tus planes…</AnimatedShinyText>
      </p>
    );
  }

  if (resumenes.length === 0) {
    return (
      <div className="tarjeta flex flex-col items-start gap-4 p-8">
        <span className="icono-tarjeta">
          <IconoCalendario />
        </span>
        <div>
          <p className="text-lg font-bold text-texto">Todavía no has generado ningún plan.</p>
          <p className="mt-1 text-texto-suave">Cuando lo hagas desde el panel, aparecerá aquí.</p>
        </div>
        <Link href="/panel" className="boton-invertido">
          Ir al panel
        </Link>
      </div>
    );
  }

  const paginas = Math.ceil(resumenes.length / POR_PAGINA);
  const visibles = resumenes.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-12">
      <nav
        aria-labelledby="titulo-lista-planes"
        className={`tarjeta p-3 sm:p-4 lg:sticky lg:top-4 lg:col-span-4 ${abierto !== null ? "hidden lg:block" : ""}`}
      >
        <h2
          id="titulo-lista-planes"
          ref={tituloLista}
          tabIndex={-1}
          className="px-2 pt-1 pb-3 text-sm font-bold text-texto-suave"
        >
          {resumenes.length} {resumenes.length === 1 ? "plan" : "planes"}
        </h2>
        <p role="status" className="sr-only">
          {aviso}
        </p>
        <ul className="space-y-1">
          {visibles.map((resumen, indice) => {
            const seleccionado = abierto?.id === resumen.id;
            return (
              <li key={resumen.id} className="rounded-xl">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    ref={(nodo) => {
                      if (nodo === null) {
                        filas.current.delete(resumen.id);
                      } else {
                        filas.current.set(resumen.id, nodo);
                      }
                    }}
                    onClick={() => abrir(resumen.id)}
                    disabled={cargandoDetalle !== null}
                    aria-current={seleccionado ? "true" : undefined}
                    className={`flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border px-3 py-2.5 text-left disabled:cursor-wait ${
                      seleccionado
                        ? "border-primario bg-primario-suave"
                        : "border-transparent hover:bg-superficie-hundida"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 text-sm font-bold text-texto">
                        {FORMATO_GENERADO.format(new Date(resumen.generadoEn))}
                        {pagina === 0 && indice === 0 && <span className="chip chip-exito">Más reciente</span>}
                      </span>
                      <span className="mt-0.5 block text-sm text-texto-suave">
                        {resumen.semanas} semanas · {formatearFechaCorta(resumen.inicioHorizonte)} –{" "}
                        {formatearFechaCorta(resumen.finHorizonte)}
                      </span>
                    </span>
                    <EstadoMeta viable={resumen.metaViable} />
                    {cargandoDetalle === resumen.id && <span className="sr-only">Abriendo…</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmando(confirmando === resumen.id ? null : resumen.id)}
                    disabled={eliminando !== null}
                    aria-expanded={confirmando === resumen.id}
                    title="Eliminar este plan"
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-texto-suave hover:bg-error-suave hover:text-error aria-expanded:bg-error-suave aria-expanded:text-error"
                  >
                    <IconoPapelera className="size-4" />
                    <span className="sr-only">
                      Eliminar el plan del {FORMATO_GENERADO.format(new Date(resumen.generadoEn))}
                    </span>
                  </button>
                </div>
                {confirmando === resumen.id && (
                  <div className="mt-1 flex flex-wrap items-center gap-2 rounded-xl border border-error/30 bg-error-suave px-3 py-2">
                    <p className="flex-1 text-sm font-semibold text-error">¿Eliminar este plan? No se puede deshacer.</p>
                    <button
                      type="button"
                      onClick={() => eliminar(resumen.id)}
                      disabled={eliminando !== null}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-error bg-tarjeta px-3 text-sm font-bold text-error disabled:cursor-wait disabled:opacity-60"
                    >
                      {eliminando === resumen.id ? "Eliminando…" : "Eliminar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmando(null)}
                      className="boton-secundario min-h-11 px-3 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {paginas > 1 && (
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-borde pt-3">
            <button
              type="button"
              onClick={() => setPagina((valor) => valor - 1)}
              disabled={pagina === 0}
              className="boton-secundario min-h-11 min-w-11 px-0 text-sm"
            >
              <IconoFlecha className="size-4 rotate-180" />
              <span className="sr-only">Página anterior</span>
            </button>
            <p className="text-sm whitespace-nowrap text-texto-suave" aria-live="polite">
              Página {pagina + 1} de {paginas}
            </p>
            <button
              type="button"
              onClick={() => setPagina((valor) => valor + 1)}
              disabled={pagina === paginas - 1}
              className="boton-secundario min-h-11 min-w-11 px-0 text-sm"
            >
              <span className="sr-only">Página siguiente</span>
              <IconoFlecha className="size-4" />
            </button>
          </div>
        )}
      </nav>

      {error !== null && (
        <p role="alert" className="rounded-2xl border border-error/40 bg-error-suave p-4 text-sm font-semibold text-error lg:col-span-8">
          {error}
        </p>
      )}

      {abierto === null && cargandoDetalle === null && (
        <p className="tarjeta hidden p-8 text-texto-suave lg:col-span-8 lg:block">
          Elige un plan de la lista para verlo aquí.
        </p>
      )}

      {abierto !== null && (
        <section
          ref={detalle}
          tabIndex={-1}
          aria-labelledby="titulo-detalle"
          className="bento scroll-mt-4 rounded-3xl lg:col-span-8"
        >
          <div className="flex flex-wrap items-center gap-3 md:col-span-6">
            <button type="button" onClick={volverALaLista} className="boton-secundario min-h-11 text-sm lg:hidden">
              <IconoFlecha className="size-4 rotate-180" />
              Volver a la lista
            </button>
            <h2 id="titulo-detalle" className="px-1 text-xl font-extrabold tracking-tight text-texto">
              Plan generado el {FORMATO_GENERADO.format(new Date(abierto.generadoEn))}
            </h2>
          </div>
          <VistaPlan
            plan={abierto.plan}
            denominaciones={denominaciones}
            tituloExplicacion="Qué significa este plan"
            explicacionGenerada={abierto.explicacion !== null}
            explicacion={
              abierto.explicacion === null ? (
                <p className="rounded-xl border border-borde bg-superficie-hundida p-4 text-sm">
                  Este plan se guardó sin explicación.
                </p>
              ) : (
                conDenominaciones(abierto.explicacion, abierto.plan, denominaciones)
                  .split("\n\n")
                  .map((parrafo, indice) => (
                    <p key={indice} className="mt-3 whitespace-pre-line first:mt-0">
                      {parrafo}
                    </p>
                  ))
              )
            }
          />
        </section>
      )}
    </div>
  );
}

/** Estado de la meta en la fila: icono con texto oculto, porque el color no basta. */
function EstadoMeta({ viable }: { viable: boolean | null }) {
  if (viable === null) {
    return <span className="sr-only">Sin meta</span>;
  }
  return viable ? (
    <span title="Meta alcanzable" className="shrink-0 text-terciario">
      <IconoCirculoCheck className="size-5" />
      <span className="sr-only">Meta alcanzable</span>
    </span>
  ) : (
    <span title="Meta no alcanzable" className="shrink-0 text-error">
      <IconoError className="size-5" />
      <span className="sr-only">Meta no alcanzable</span>
    </span>
  );
}

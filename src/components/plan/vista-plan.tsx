"use client";

import { useId, type ReactNode } from "react";
import { Descargo } from "@/components/plan/descargo";
import { TablaSemanas } from "@/components/plan/tabla-semanas";
import { Aparecer } from "@/components/ui/movimiento";
import {
  IconoAlcancia,
  IconoAviso,
  IconoCalendario,
  IconoCirculoCheck,
  IconoDestello,
  IconoError,
} from "@/components/ui/iconos";
import type { Plan } from "@/core/tipos";
import { describirAdvertencias, type Denominaciones } from "@/lib/plan/advertencias";
import { resumirPlan } from "@/lib/plan/resumen";
import { formatearPesos } from "@/lib/dinero";
import { formatearFechaCorta, formatearFechaLarga } from "@/lib/fecha";
import type { EstadoAlcancia } from "@/lib/huevo/secuencia";

interface Props {
  plan: Plan;
  denominaciones: Denominaciones;
  /** Línea breve sobre el origen del plan, por ejemplo cuándo se guardó. */
  contexto?: ReactNode;
  /** Contenido de la tarjeta "Qué significa tu plan" (RF-10). */
  explicacion: ReactNode;
  tituloExplicacion?: string;
  /** Muestra el rótulo de texto generado solo cuando de verdad hay una explicación. */
  explicacionGenerada: boolean;
  alcancia?: EstadoAlcancia | null;
  alDepositar?: (numeroSemana: number) => void;
  /** Texto discreto bajo la tabla; lo usa la pista del huevo de Pascua (SC-02). */
  pista?: ReactNode;
}

/**
 * Presentación de un plan en cuadrícula Bento (RF-07 a RF-11).
 *
 * La comparten el panel, con el plan recién generado, y el historial, con uno guardado
 * (RF-12), para que ambos muestren las mismas cifras con la misma redacción.
 *
 * Orden de las celdas: el descargo va primero porque CA-07 exige verlo sin desplazarse;
 * después las cifras de conjunto, las advertencias, la tabla y la explicación. Las
 * tarjetas resumen lo que dice la tabla, que sigue siendo la fuente accesible completa.
 */
export function VistaPlan({
  plan,
  denominaciones,
  contexto,
  explicacion,
  tituloExplicacion = "Qué significa tu plan",
  explicacionGenerada,
  alcancia = null,
  alDepositar,
  pista,
}: Props) {
  const resumen = resumirPlan(plan);
  const advertencias = describirAdvertencias(plan.advertencias, denominaciones);
  const meta = plan.evaluacionMeta;
  const primera = resumen.primeraSemana;
  const prefijo = useId();
  const idAdvertencias = `${prefijo}-advertencias`;
  const idTabla = `${prefijo}-tabla`;
  const idExplicacion = `${prefijo}-explicacion`;

  return (
    <>
      <Aparecer indice={0} className="md:col-span-6">
        <Descargo />
      </Aparecer>

      <Aparecer indice={1} className="tarjeta flex flex-col justify-between gap-6 p-6 sm:p-7 md:col-span-4">
        <div>
          <p className="rotulo flex items-center gap-2">
            <IconoCalendario className="size-4" />
            Tu horizonte
          </p>
          <p className="mt-3 text-2xl leading-snug font-extrabold tracking-tight text-texto sm:text-3xl">
            Del {formatearFechaLarga(plan.inicioHorizonte)} al {formatearFechaLarga(plan.finHorizonte)},{" "}
            {resumen.semanas} {resumen.semanas === 1 ? "semana" : "semanas"}.
          </p>
          {contexto && <p className="mt-2 text-sm text-texto-suave">{contexto}</p>}
        </div>

        <div>
          <ul aria-label="Estado de las semanas" className="flex flex-wrap gap-2">
            <li className="chip chip-exito">
              <IconoCirculoCheck className="size-4" />
              {resumen.semanasAlDia} al día
            </li>
            {resumen.semanasCargaAlta > 0 && (
              <li className="chip chip-alerta">
                <IconoAviso className="size-4" />
                {resumen.semanasCargaAlta} con carga alta
              </li>
            )}
            {resumen.semanasSinAlcance > 0 && (
              <li className="chip chip-error">
                <IconoError className="size-4" />
                {resumen.semanasSinAlcance} no {resumen.semanasSinAlcance === 1 ? "alcanza" : "alcanzan"}
              </li>
            )}
          </ul>
          <RitmoSemanas plan={plan} />
        </div>
      </Aparecer>

      {primera !== null && (
        <Aparecer indice={2} className="tarjeta-invertida flex flex-col justify-between gap-6 p-6 sm:p-7 md:col-span-2">
          <p className="text-sm font-semibold opacity-80">
            Primera semana · desde el {formatearFechaCorta(primera.fechaInicio)}
          </p>
          <div>
            <p className="text-sm opacity-80">Aparta</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight tabular-nums">
              {formatearPesos(primera.montoApartado)}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-3 border-t border-current/20 pt-4 text-sm">
            <div>
              <dt className="opacity-80">Disponible</dt>
              <dd className="mt-0.5 font-bold tabular-nums">{formatearPesos(primera.montoDisponible)}</dd>
            </div>
            <div>
              <dt className="opacity-80">Te queda</dt>
              <dd className="mt-0.5 font-bold tabular-nums">{formatearPesos(primera.remanente)}</dd>
            </div>
          </dl>
        </Aparecer>
      )}

      <Aparecer indice={3}
        className={`tarjeta flex flex-col gap-3 p-6 ${meta === null ? "md:col-span-6" : "md:col-span-3"}`}
      >
        <p className="rotulo">Apartas en todo el plan</p>
        <p className="text-3xl font-extrabold tracking-tight text-texto tabular-nums">
          {formatearPesos(resumen.totalApartado)}
        </p>
        <p className="text-sm leading-6 text-texto-suave">
          Lo necesario para cubrir cada pago antes de su fecha límite.
          {resumen.totalMeta > 0 && <> Además, {formatearPesos(resumen.totalMeta)} van a tu meta.</>}
        </p>
      </Aparecer>

      {meta !== null && (
        <Aparecer indice={4} className="tarjeta flex flex-col gap-3 p-6 md:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <p className="rotulo">Tu meta de ahorro</p>
            <span className="icono-tarjeta size-10">
              <IconoAlcancia />
            </span>
          </div>
          <p className="text-3xl font-extrabold tracking-tight text-texto tabular-nums">
            {formatearPesos(meta.montoObjetivo)}
          </p>
          <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-superficie-hundida">
            <div
              className={`h-full rounded-full ${meta.viable ? "bg-primario" : "bg-alerta"}`}
              style={{ width: `${(resumen.avanceMeta ?? 0) * 100}%` }}
            />
          </div>
          <p className="text-sm leading-6 text-texto">
            {meta.viable ? (
              <>
                <strong className="text-verde-texto">Sí es alcanzable</strong> para el{" "}
                {formatearFechaLarga(meta.fechaObjetivo)}.
              </>
            ) : (
              <>
                <strong className="text-error">No se alcanza</strong>: faltan{" "}
                {formatearPesos(meta.faltante)} para el {formatearFechaLarga(meta.fechaObjetivo)}.
              </>
            )}
          </p>
        </Aparecer>
      )}

      {advertencias.length > 0 && (
        <Aparecer como="section" indice={5} aria-labelledby={idAdvertencias} className="md:col-span-6">
          <h3 id={idAdvertencias} className="mb-3 px-1 text-lg font-bold text-texto">
            Puntos de atención
          </h3>
          <ul className="grid gap-3 md:grid-cols-2">
            {advertencias.map((advertencia, indice) => {
              const alta = advertencia.gravedad === "alta";
              return (
                <li
                  key={`${advertencia.tipo}-${indice}`}
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6 text-texto ${
                    alta ? "border-error/30 bg-error-suave" : "border-alerta/30 bg-alerta-suave"
                  }`}
                >
                  {alta ? (
                    <IconoError className="mt-0.5 size-5 shrink-0 text-error" />
                  ) : (
                    <IconoAviso className="mt-0.5 size-5 shrink-0 text-alerta-texto" />
                  )}
                  <span>
                    <span className="sr-only">{alta ? "Importante: " : "Aviso: "}</span>
                    {advertencia.texto}
                  </span>
                </li>
              );
            })}
          </ul>
        </Aparecer>
      )}

      <Aparecer como="section" indice={6} aria-labelledby={idTabla} className="tarjeta p-4 sm:p-6 md:col-span-6">
        <h3 id={idTabla} className="px-1 text-lg font-bold text-texto">
          Semana a semana
        </h3>
        <TablaSemanas
          plan={plan}
          denominaciones={denominaciones}
          alcancia={alcancia}
          alDepositar={alDepositar}
        />
        {pista && <p className="mt-3 px-1 text-sm text-texto-suave italic">{pista}</p>}
      </Aparecer>

      <Aparecer como="section" indice={7} aria-labelledby={idExplicacion} className="tarjeta p-6 sm:p-7 md:col-span-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id={idExplicacion} className="flex items-center gap-3 text-lg font-bold text-texto">
            <span className="icono-tarjeta size-10">
              <IconoDestello />
            </span>
            {tituloExplicacion}
          </h3>
          {explicacionGenerada && (
            <span className="chip chip-neutro">Redactado con IA a partir de tus cifras</span>
          )}
        </div>
        <div aria-live="polite" className="mt-4 leading-7 text-texto">
          {explicacion}
        </div>
      </Aparecer>
    </>
  );
}

/**
 * Barras de proporción apartada por semana. Es decorativa: la tabla trae las mismas
 * cifras con sus encabezados, y las semanas marcadas también se nombran en los chips.
 */
function RitmoSemanas({ plan }: { plan: Plan }) {
  return (
    <div aria-hidden="true" className="mt-5 flex h-16 items-end gap-1">
      {plan.asignaciones.map((semana) => {
        const proporcion =
          semana.montoDisponible > 0 ? Math.min(1, semana.montoApartado / semana.montoDisponible) : 1;
        const color = semana.enDeficit
          ? "bg-error"
          : semana.sobrecargada
            ? "bg-alerta"
            : "bg-primario";
        return (
          <div
            key={semana.numeroSemana}
            className="flex h-full flex-1 items-end overflow-hidden rounded-md bg-superficie-hundida"
          >
            <div className={`w-full rounded-md ${color}`} style={{ height: `${Math.max(8, proporcion * 100)}%` }} />
          </div>
        );
      })}
    </div>
  );
}

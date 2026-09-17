"use client";

/**
 * Prototipo de demostración del motor de cálculo (C-03).
 *
 * NO es la interfaz de la Fase 4: no persiste nada, no autentica y no consulta el
 * servicio de inteligencia artificial. Ejecuta calcularPlan en el navegador para
 * hacer visible el resultado del motor durante la presentación de avance.
 *
 * Aloja también el huevo de Pascua de SC-02 (RF-14) hasta que exista la vista del plan
 * de la Fase 4 (paso 4.4), a la que deberá trasladarse.
 */

import { useState } from "react";
import { fechaIso } from "@/core/calendario";
import { calcularPlan } from "@/core/plan";
import type { Advertencia, DiaSemana, Plan } from "@/core/tipos";
import { DialogoCreditos } from "@/components/creditos/dialogo-creditos";
import { formatearPesos, pesosACentavos } from "@/lib/dinero";
import {
  crearAlcancia,
  depositarMoneda,
  esCuadrePerfecto,
  type EstadoAlcancia,
} from "@/lib/huevo/secuencia";

interface FilaCompromiso {
  denominacion: string;
  monto: string;
  fechaLimite: string;
  ocurrencias: string;
}

const DIAS: { valor: DiaSemana; nombre: string }[] = [
  { valor: 0, nombre: "Domingo" },
  { valor: 1, nombre: "Lunes" },
  { valor: 2, nombre: "Martes" },
  { valor: 3, nombre: "Miércoles" },
  { valor: 4, nombre: "Jueves" },
  { valor: 5, nombre: "Viernes" },
  { valor: 6, nombre: "Sábado" },
];

const COMPROMISOS_INICIALES: FilaCompromiso[] = [
  { denominacion: "Tarjeta de crédito", monto: "600", fechaLimite: "2026-09-30", ocurrencias: "3" },
  { denominacion: "Internet", monto: "400", fechaLimite: "2026-10-05", ocurrencias: "2" },
];

/** El núcleo emite códigos; la interfaz decide la redacción. */
function describir(advertencia: Advertencia): string {
  switch (advertencia.tipo) {
    case "semana-sobrecargada":
      return `Semana ${advertencia.numeroSemana}: los pagos que vencen superan lo disponible en ${formatearPesos(advertencia.excedente)}.`;
    case "semana-en-deficit":
      return `Semana ${advertencia.numeroSemana}: falta ${formatearPesos(advertencia.faltante)} para apartar lo necesario.`;
    case "meta-no-alcanzable":
      return `La meta de ahorro no es alcanzable: faltan ${formatearPesos(advertencia.faltante)}.`;
    case "meta-fuera-de-horizonte":
      return `La fecha objetivo (${advertencia.fechaObjetivo}) va más allá del horizonte, que termina el ${advertencia.finHorizonte}. La evaluación es parcial.`;
    case "vencimiento-anterior-a-referencia":
      return `El pago "${advertencia.compromisoId}" venció el ${advertencia.fecha}, antes de la fecha de cálculo, y no se incluye.`;
    case "vencimiento-fuera-de-horizonte":
      return `El pago "${advertencia.compromisoId}" vence el ${advertencia.fecha}, fuera del horizonte de planificación.`;
    case "ingreso-fuera-de-horizonte":
      return `El ingreso "${advertencia.ingresoId}" del ${advertencia.fecha} queda fuera del horizonte.`;
  }
}

export default function DemostracionMotor() {
  const [fechaReferencia, setFechaReferencia] = useState("2026-09-14");
  const [presupuesto, setPresupuesto] = useState("500");
  const [diaInicioSemana, setDiaInicioSemana] = useState<DiaSemana>(1);
  const [compromisos, setCompromisos] = useState(COMPROMISOS_INICIALES);
  const [metaMonto, setMetaMonto] = useState("1000");
  const [metaFecha, setMetaFecha] = useState("2026-11-30");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  // SC-02: la alcancía solo existe mientras el plan mostrado cuadra al centavo.
  const [alcancia, setAlcancia] = useState<EstadoAlcancia | null>(null);
  const [creditosAbiertos, setCreditosAbiertos] = useState(false);

  function actualizarCompromiso(indice: number, campo: keyof FilaCompromiso, valor: string) {
    setCompromisos((filas) =>
      filas.map((fila, i) => (i === indice ? { ...fila, [campo]: valor } : fila)),
    );
  }

  function calcular() {
    try {
      const resultado = calcularPlan({
        fechaReferencia: fechaIso(fechaReferencia),
        presupuesto: {
          montoSemanal: pesosACentavos(presupuesto),
          diaInicioSemana,
        },
        // La denominación se queda en la interfaz: el motor no la necesita (RNF-10).
        compromisos: compromisos.map((fila, indice) => ({
          id: fila.denominacion.trim() || `compromiso-${indice + 1}`,
          monto: pesosACentavos(fila.monto),
          fechaLimite: fechaIso(fila.fechaLimite),
          ocurrencias: Number(fila.ocurrencias),
        })),
        metaAhorro:
          metaMonto.trim() === ""
            ? null
            : { montoObjetivo: pesosACentavos(metaMonto), fechaObjetivo: fechaIso(metaFecha) },
      });
      setPlan(resultado);
      setAlcancia(
        esCuadrePerfecto(resultado) ? crearAlcancia(resultado.asignaciones.length) : null,
      );
      setError(null);
    } catch (fallo) {
      setPlan(null);
      setAlcancia(null);
      setError(fallo instanceof Error ? fallo.message : "Error desconocido");
    }
  }

  function depositar(numeroSemana: number) {
    if (alcancia === null) {
      return;
    }
    const { estado, resultado } = depositarMoneda(alcancia, numeroSemana);
    if (resultado === "completa") {
      setAlcancia(crearAlcancia(estado.totalSemanas));
      setCreditosAbiertos(true);
    } else {
      setAlcancia(estado);
    }
  }

  const etiqueta = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";
  const campo =
    "mt-1 w-full rounded border border-zinc-400 bg-white px-2 py-1.5 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Ahorrito · demostración del motor</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Prototipo para presentar el componente C-03. Ejecuta <code>calcularPlan</code> sin base
        de datos, sin sesión y sin el servicio de inteligencia artificial.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div>
          <label className={etiqueta} htmlFor="fecha">
            Fecha de cálculo
          </label>
          <input
            id="fecha"
            type="date"
            className={campo}
            value={fechaReferencia}
            onChange={(evento) => setFechaReferencia(evento.target.value)}
          />
        </div>
        <div>
          <label className={etiqueta} htmlFor="presupuesto">
            Presupuesto semanal (MXN)
          </label>
          <input
            id="presupuesto"
            type="number"
            min="0"
            step="0.01"
            className={campo}
            value={presupuesto}
            onChange={(evento) => setPresupuesto(evento.target.value)}
          />
        </div>
        <div>
          <label className={etiqueta} htmlFor="dia">
            La semana inicia en
          </label>
          <select
            id="dia"
            className={campo}
            value={diaInicioSemana}
            onChange={(evento) => setDiaInicioSemana(Number(evento.target.value) as DiaSemana)}
          >
            {DIAS.map((dia) => (
              <option key={dia.valor} value={dia.valor}>
                {dia.nombre}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-medium">Compromisos de pago</h2>
        <div className="mt-3 space-y-3">
          {compromisos.map((fila, indice) => (
            <div key={indice} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
              <input
                aria-label="Denominación"
                className={campo}
                value={fila.denominacion}
                onChange={(evento) =>
                  actualizarCompromiso(indice, "denominacion", evento.target.value)
                }
              />
              <input
                aria-label="Monto"
                type="number"
                min="0"
                step="0.01"
                className={campo}
                value={fila.monto}
                onChange={(evento) => actualizarCompromiso(indice, "monto", evento.target.value)}
              />
              <input
                aria-label="Fecha límite"
                type="date"
                className={campo}
                value={fila.fechaLimite}
                onChange={(evento) =>
                  actualizarCompromiso(indice, "fechaLimite", evento.target.value)
                }
              />
              <input
                aria-label="Ocurrencias"
                type="number"
                min="1"
                max="6"
                className={campo}
                value={fila.ocurrencias}
                onChange={(evento) =>
                  actualizarCompromiso(indice, "ocurrencias", evento.target.value)
                }
              />
              <button
                type="button"
                className="rounded border border-zinc-400 px-3 py-1.5 text-sm dark:border-zinc-600"
                onClick={() => setCompromisos((filas) => filas.filter((_, i) => i !== indice))}
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 rounded border border-zinc-400 px-3 py-1.5 text-sm dark:border-zinc-600"
          onClick={() =>
            setCompromisos((filas) => [
              ...filas,
              { denominacion: "", monto: "0", fechaLimite: fechaReferencia, ocurrencias: "1" },
            ])
          }
        >
          Agregar compromiso
        </button>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={etiqueta} htmlFor="meta-monto">
            Meta de ahorro (opcional, MXN)
          </label>
          <input
            id="meta-monto"
            type="number"
            min="0"
            step="0.01"
            className={campo}
            value={metaMonto}
            onChange={(evento) => setMetaMonto(evento.target.value)}
          />
        </div>
        <div>
          <label className={etiqueta} htmlFor="meta-fecha">
            Fecha objetivo
          </label>
          <input
            id="meta-fecha"
            type="date"
            className={campo}
            value={metaFecha}
            onChange={(evento) => setMetaFecha(evento.target.value)}
          />
        </div>
      </section>

      <button
        type="button"
        className="mt-8 rounded bg-zinc-900 px-5 py-2.5 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        onClick={calcular}
      >
        Calcular plan
      </button>

      {error !== null && (
        <p role="alert" className="mt-6 rounded border border-red-500 p-3 text-red-700 dark:text-red-400">
          El motor rechazó la entrada: {error}
        </p>
      )}

      {plan !== null && (
        <section className="mt-10">
          <h2 className="text-xl font-medium">Plan semanal</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Horizonte del {plan.inicioHorizonte} al {plan.finHorizonte} · {plan.asignaciones.length}{" "}
            semanas
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-400 text-left dark:border-zinc-600">
                  <th className="py-2 pr-3">Semana</th>
                  <th className="py-2 pr-3">Periodo</th>
                  <th className="py-2 pr-3 text-right">Disponible</th>
                  <th className="py-2 pr-3 text-right">Apartar</th>
                  <th className="py-2 pr-3 text-right">Vence</th>
                  <th className="py-2 pr-3 text-right">Queda</th>
                  <th className="py-2 pr-3 text-right">A la meta</th>
                  <th className="py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {plan.asignaciones.map((asignacion) => (
                  <tr
                    key={asignacion.numeroSemana}
                    className="border-b border-zinc-200 dark:border-zinc-800"
                  >
                    <td className="py-2 pr-3">{asignacion.numeroSemana}</td>
                    <td className="py-2 pr-3">
                      {asignacion.fechaInicio} al {asignacion.fechaFin}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {formatearPesos(asignacion.montoDisponible)}
                    </td>
                    <td className="py-2 pr-3 text-right font-medium">
                      {formatearPesos(asignacion.montoApartado)}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {asignacion.montoVencimientos === 0
                        ? "—"
                        : formatearPesos(asignacion.montoVencimientos)}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {alcancia === null ? (
                        formatearPesos(asignacion.remanente)
                      ) : (
                        <button
                          type="button"
                          aria-pressed={asignacion.numeroSemana <= alcancia.depositadas}
                          onClick={() => depositar(asignacion.numeroSemana)}
                          className="rounded px-1 tabular-nums hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-amber-500 dark:hover:bg-amber-900/40"
                        >
                          {asignacion.numeroSemana <= alcancia.depositadas ? (
                            <>
                              <span aria-hidden="true">🪙</span>
                              <span className="sr-only">{formatearPesos(asignacion.remanente)}</span>
                            </>
                          ) : (
                            formatearPesos(asignacion.remanente)
                          )}
                        </button>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {asignacion.aporteMeta === 0 ? "—" : formatearPesos(asignacion.aporteMeta)}
                    </td>
                    <td className="py-2">
                      {asignacion.sobrecargada && (
                        <span className="mr-1 rounded bg-amber-200 px-2 py-0.5 text-amber-900">
                          Sobrecargada
                        </span>
                      )}
                      {asignacion.enDeficit && (
                        <span className="rounded bg-red-200 px-2 py-0.5 text-red-900">Déficit</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {plan.evaluacionMeta !== null && (
            <p className="mt-4">
              <strong>Meta de ahorro:</strong>{" "}
              {plan.evaluacionMeta.viable
                ? `alcanzable. Se apartan ${formatearPesos(plan.evaluacionMeta.montoObjetivo)} antes del ${plan.evaluacionMeta.fechaObjetivo}.`
                : `no alcanzable. Con este presupuesto se reúnen ${formatearPesos(plan.evaluacionMeta.ahorroPosible)} y faltan ${formatearPesos(plan.evaluacionMeta.faltante)}.`}
            </p>
          )}

          {plan.advertencias.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium">Advertencias</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {plan.advertencias.map((advertencia, indice) => (
                  <li key={indice}>{describir(advertencia)}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <p className="mt-10 border-t border-zinc-300 pt-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Este plan es una sugerencia de organización personal y no constituye asesoría financiera
        profesional (RF-11).
      </p>

      <DialogoCreditos abierto={creditosAbiertos} onCerrar={() => setCreditosAbiertos(false)} />
    </main>
  );
}

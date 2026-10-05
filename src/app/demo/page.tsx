"use client";

/**
 * Prototipo de demostración del motor de cálculo (C-03).
 *
 * NO es la interfaz de la Fase 4: no persiste nada, no autentica y no consulta el
 * servicio de inteligencia artificial. Ejecuta calcularPlan en el navegador para
 * hacer visible el resultado del motor durante la presentación de avance.
 *
 * El huevo de Pascua de SC-02 (RF-14) vivió aquí hasta la Fase 4; ahora está en la vista
 * real del plan, dentro del panel.
 */

import Link from "next/link";
import { useState } from "react";
import { botonPrimario, botonSecundario, campo, etiqueta } from "@/components/captura/estilos";
import { fechaIso } from "@/core/calendario";
import { calcularPlan } from "@/core/plan";
import type { Advertencia, DiaSemana, Plan } from "@/core/tipos";
import { formatearPesos, pesosACentavos } from "@/lib/dinero";
import { IconoFlecha } from "@/components/ui/iconos";
import { TransicionRuta } from "@/components/ui/transicion-ruta";

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
      setError(null);
    } catch (fallo) {
      setPlan(null);
      setError(fallo instanceof Error ? fallo.message : "Error desconocido");
    }
  }


  return (
    <TransicionRuta>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Si no hay sesión, el proxy redirige al inicio de sesión y vuelve al panel. */}
        <Link href="/panel" className={`${botonSecundario} mb-6 text-sm`}>
          <IconoFlecha className="size-4 rotate-180" />
          Regresar al panel
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-texto sm:text-4xl">
          Ahorrito · demostración del motor
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-texto-suave">
          Prototipo para presentar el componente C-03. Ejecuta <code>calcularPlan</code> sin base
          de datos, sin sesión y sin el servicio de inteligencia artificial.
        </p>

        <section className="superficie mt-8 grid gap-5 p-5 sm:grid-cols-3 sm:p-7">
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

        <section className="superficie mt-8 p-5 sm:p-7">
          <h2 className="text-2xl font-extrabold tracking-tight text-texto">Compromisos de pago</h2>
          <div className="mt-3 space-y-3">
            {compromisos.map((fila, indice) => (
              <div key={indice} className="elevado grid gap-3 p-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
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
                  className={`${botonSecundario} text-sm`}
                  onClick={() => setCompromisos((filas) => filas.filter((_, i) => i !== indice))}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={`${botonSecundario} mt-4 text-sm`}
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

        <section className="superficie mt-8 grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
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
          className={`${botonPrimario} mt-8`}
          onClick={calcular}
        >
          Calcular plan
        </button>

        {error !== null && (
          <p role="alert" className="mt-6 rounded-xl border border-error/40 bg-error-suave p-4 font-semibold text-error">
            El motor rechazó la entrada: {error}
          </p>
        )}

        {plan !== null && (
          <section className="superficie mt-10 p-5 sm:p-7">
            <h2 className="text-2xl font-extrabold tracking-tight text-texto">Plan semanal</h2>
            <p className="mt-2 text-sm text-texto-suave">
              Horizonte del {plan.inicioHorizonte} al {plan.finHorizonte} · {plan.asignaciones.length}{" "}
              semanas
            </p>

            <div className="mt-5 overflow-x-auto rounded-xl border border-borde">
              <table className="w-full min-w-4xl border-collapse text-sm">
                <thead className="bg-superficie-hundida">
                  <tr className="border-b border-borde text-left">
                    <th className="px-3 py-2.5">Semana</th>
                    <th className="px-3 py-2.5">Periodo</th>
                    <th className="px-3 py-2.5 text-right">Disponible</th>
                    <th className="px-3 py-2.5 text-right">Apartar</th>
                    <th className="px-3 py-2.5 text-right">Vence</th>
                    <th className="px-3 py-2.5 text-right">Queda</th>
                    <th className="px-3 py-2.5 text-right">A la meta</th>
                    <th className="px-3 py-2.5">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.asignaciones.map((asignacion) => (
                    <tr
                      key={asignacion.numeroSemana}
                      className="border-b border-borde last:border-b-0"
                    >
                      <td className="px-3 py-2.5">{asignacion.numeroSemana}</td>
                      <td className="px-3 py-2.5">
                        {asignacion.fechaInicio} al {asignacion.fechaFin}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {formatearPesos(asignacion.montoDisponible)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium">
                        {formatearPesos(asignacion.montoApartado)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {asignacion.montoVencimientos === 0
                          ? "—"
                          : formatearPesos(asignacion.montoVencimientos)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {formatearPesos(asignacion.remanente)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {asignacion.aporteMeta === 0 ? "—" : formatearPesos(asignacion.aporteMeta)}
                      </td>
                      <td className="px-3 py-2.5">
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
              <p className="mt-5 leading-7">
                <strong>Meta de ahorro:</strong>{" "}
                {plan.evaluacionMeta.viable
                  ? `alcanzable. Se apartan ${formatearPesos(plan.evaluacionMeta.montoObjetivo)} antes del ${plan.evaluacionMeta.fechaObjetivo}.`
                  : `no alcanzable. Con este presupuesto se reúnen ${formatearPesos(plan.evaluacionMeta.ahorroPosible)} y faltan ${formatearPesos(plan.evaluacionMeta.faltante)}.`}
              </p>
            )}

            {plan.advertencias.length > 0 && (
              <div className="mt-5 border-t border-borde pt-5">
                <h3 className="font-bold text-texto">Advertencias</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {plan.advertencias.map((advertencia, indice) => (
                    <li key={indice}>{describir(advertencia)}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <p className="mt-10 border-t border-borde pt-5 text-sm leading-6 text-texto-suave">
          Este plan es una sugerencia de organización personal y no constituye asesoría financiera
          profesional (RF-11).
        </p>

      </main>
    </TransicionRuta>
  );
}

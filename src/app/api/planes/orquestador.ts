/**
 * Orquestador de planes (C-02): la secuencia de la Figura 8, conforme a SC-05.
 *
 * 1. Toma la entrada del repositorio, no de la petición (SC-05): una sola fuente de verdad.
 * 2. Calcula el plan con el motor (I-02) y lo guarda (I-04).
 * 3. Escribe el plan en el flujo de respuesta *antes* de pedir la explicación. Con eso
 *    RNF-01 se mide sobre el plan y no depende del proveedor de IA (conflicto 1, sección 2.9).
 * 4. Pide la explicación (I-03), la guarda si llegó y la escribe como segunda línea.
 *    Si el servicio falla, la segunda línea lleva null (RNF-03).
 *
 * No importa Next.js: recibe sus dependencias ya construidas, lo que permite probar la
 * secuencia completa con dobles de prueba.
 */

import { calcularPlan } from "@/core/plan";
import type { FechaIso, Plan } from "@/core/tipos";
import type { ServicioExplicacion } from "@/ports/explicacion";
import type { RepositorioPlanes } from "@/ports/repositorio";

export type LineaFlujo =
  | { readonly tipo: "plan"; readonly id: string; readonly plan: Plan }
  | { readonly tipo: "explicacion"; readonly explicacion: string | null };

export interface DependenciasOrquestador {
  readonly repositorio: RepositorioPlanes;
  readonly explicacion: ServicioExplicacion;
  /** Registro de fallos que no interrumpen la respuesta. Nunca recibe datos del usuario. */
  readonly registrarFallo?: (mensaje: string, error: unknown) => void;
}

export interface SolicitudGeneracion {
  readonly fechaReferencia: FechaIso;
  /** Con false se omite la solicitud al modelo (conflicto 4 de la sección 2.9). */
  readonly explicar: boolean;
}

export type ResultadoGeneracion =
  | { readonly estado: "sin-datos" }
  | { readonly estado: "generado"; readonly flujo: ReadableStream<Uint8Array> };

/**
 * Calcula y guarda el plan. Si falta el presupuesto o no hay compromisos (regla de
 * negocio 6) devuelve "sin-datos" y no genera nada. Los errores de persistencia se
 * propagan: sin base de datos no se genera el plan (sección 3.7.2).
 */
export async function generarPlan(
  dependencias: DependenciasOrquestador,
  solicitud: SolicitudGeneracion,
): Promise<ResultadoGeneracion> {
  const entrada = await dependencias.repositorio.obtenerDatosEntrada(solicitud.fechaReferencia);
  if (entrada === null) {
    return { estado: "sin-datos" };
  }
  const plan = calcularPlan(entrada);
  const id = await dependencias.repositorio.guardarPlan(plan);
  return { estado: "generado", flujo: crearFlujo(dependencias, solicitud.explicar, id, plan) };
}

const codificador = new TextEncoder();

export function lineaNdjson(linea: LineaFlujo): Uint8Array {
  return codificador.encode(`${JSON.stringify(linea)}\n`);
}

function crearFlujo(
  dependencias: DependenciasOrquestador,
  explicar: boolean,
  id: string,
  plan: Plan,
): ReadableStream<Uint8Array> {
  const registrarFallo = dependencias.registrarFallo ?? (() => {});
  let cancelado = false;

  return new ReadableStream<Uint8Array>({
    async start(controlador) {
      // Primera línea: se encola antes de cualquier espera, así sale con la respuesta.
      controlador.enqueue(lineaNdjson({ tipo: "plan", id, plan }));
      if (!explicar) {
        controlador.close();
        return;
      }

      const explicacion = await dependencias.explicacion.explicarPlan(plan);
      if (explicacion !== null) {
        try {
          await dependencias.repositorio.guardarExplicacion(id, explicacion);
        } catch (error) {
          // El usuario igual recibe la explicación; solo no quedará guardada.
          registrarFallo("No se pudo guardar la explicacion del plan.", error);
        }
      }
      if (cancelado) {
        return;
      }
      controlador.enqueue(lineaNdjson({ tipo: "explicacion", explicacion }));
      controlador.close();
    },
    cancel() {
      // El cliente cerró la conexión. La explicación en curso se sigue guardando para que
      // aparezca al consultar el plan después.
      cancelado = true;
    },
  });
}

const FORMATO_FECHA_MEXICO = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Mexico_City",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Fecha de hoy en la zona horaria del centro de México, AAAA-MM-DD (SC-05). El servidor
 * corre en UTC: sin esta conversión, un plan pedido después de las 18:00 quedaría fechado
 * al día siguiente. El formato en-CA es el que produce AAAA-MM-DD.
 */
export function fechaDeHoyEnMexico(ahora: Date): string {
  return FORMATO_FECHA_MEXICO.format(ahora);
}

export type CuerpoValidado = { readonly valido: true; readonly explicar: boolean } | { readonly valido: false };

/**
 * Valida el cuerpo de POST /api/planes. Admite cuerpo vacío o un objeto con el único
 * campo opcional `explicar`. Rechaza cualquier otro campo: un cliente que todavía envíe
 * la captura en el cuerpo (contrato anterior a SC-05) recibe un error en lugar de ver
 * sus datos ignorados en silencio.
 */
export function validarCuerpo(texto: string): CuerpoValidado {
  if (texto.trim() === "") {
    return { valido: true, explicar: true };
  }
  let cuerpo: unknown;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    return { valido: false };
  }
  if (cuerpo === null || typeof cuerpo !== "object" || Array.isArray(cuerpo)) {
    return { valido: false };
  }
  const { explicar, ...resto } = cuerpo as Record<string, unknown>;
  if (Object.keys(resto).length > 0 || (explicar !== undefined && typeof explicar !== "boolean")) {
    return { valido: false };
  }
  return { valido: true, explicar: explicar ?? true };
}

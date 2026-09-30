/**
 * Doble de prueba del puerto I-04. **No forma parte del código de producción**: ningún
 * módulo de `src/app`, `src/core` o `src/adapters` lo importa.
 *
 * Existe porque el contrato tiene diecisiete operaciones y las pruebas del orquestador
 * solo ejercitan cinco. Sin este doble, cada archivo de prueba repetiría las doce
 * restantes, y agregar una operación obligaría a tocar todos ellos.
 */

import { vi } from "vitest";
import type { EntradaPlan } from "@/core/tipos";
import type { RepositorioPlanes } from "./repositorio";

export function crearRepositorioFalso(entrada: EntradaPlan | null, idPlan: string) {
  return {
    // Operaciones que las pruebas del orquestador ejercitan.
    obtenerDatosEntrada: vi.fn(async () => entrada),
    guardarPlan: vi.fn(async () => idPlan),
    guardarExplicacion: vi.fn(async () => true),
    listarPlanes: vi.fn(async () => []),
    obtenerPlan: vi.fn(async () => null),
    eliminarPlan: vi.fn(async () => true),

    // Captura (SC-06): presentes para cumplir el contrato; el orquestador no las usa.
    obtenerPresupuesto: vi.fn(async () => null),
    guardarPresupuesto: vi.fn(async () => {}),
    listarCompromisos: vi.fn(async () => []),
    agregarCompromiso: vi.fn(async () => idPlan),
    actualizarCompromiso: vi.fn(async () => true),
    eliminarCompromiso: vi.fn(async () => true),
    listarIngresos: vi.fn(async () => []),
    agregarIngreso: vi.fn(async () => idPlan),
    eliminarIngreso: vi.fn(async () => true),
    obtenerMeta: vi.fn(async () => null),
    guardarMeta: vi.fn(async () => {}),
    eliminarMeta: vi.fn(async () => true),
  } satisfies RepositorioPlanes;
}

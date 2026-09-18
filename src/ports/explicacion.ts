/**
 * Puerto I-03: contrato del servicio de explicación del plan (RF-10).
 *
 * El orquestador (C-02) depende de esta interfaz, no de Gemini. El adaptador de IA (C-04)
 * la implementa y es el único lugar que conoce al proveedor, su clave y su formato.
 *
 * El resultado nulo no es un error: representa el comportamiento degradado que exige
 * RNF-03. Un plan sin explicación es un estado válido del sistema (regla de negocio 5).
 */

import type { Plan } from "@/core/tipos";

export interface ServicioExplicacion {
  /**
   * Explicación del plan en texto plano, o null si el servicio no está configurado, falla,
   * devuelve una respuesta inválida o excede el tiempo límite.
   *
   * La promesa nunca se rechaza. Así el orquestador no necesita distinguir entre tipos de
   * falla para cumplir RNF-03: cualquier problema del proveedor termina en null y el plan
   * numérico se entrega igual.
   *
   * El texto se trata como dato y nunca se interpreta como instrucción ni como código.
   */
  explicarPlan(plan: Plan): Promise<string | null>;
}

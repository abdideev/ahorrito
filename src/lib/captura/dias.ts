import type { DiaSemana } from "@/core/tipos";

/**
 * Días de la semana para los selectores de la interfaz. El valor 0 es domingo, conforme
 * al contrato de I-01 y al tipo `DiaSemana` del núcleo.
 */
export const DIAS_SEMANA: readonly { readonly valor: DiaSemana; readonly nombre: string }[] = [
  { valor: 0, nombre: "Domingo" },
  { valor: 1, nombre: "Lunes" },
  { valor: 2, nombre: "Martes" },
  { valor: 3, nombre: "Miércoles" },
  { valor: 4, nombre: "Jueves" },
  { valor: 5, nombre: "Viernes" },
  { valor: 6, nombre: "Sábado" },
];

export function nombreDelDia(dia: DiaSemana): string {
  return DIAS_SEMANA[dia].nombre;
}

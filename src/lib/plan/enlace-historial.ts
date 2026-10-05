/**
 * Texto del enlace del panel al historial (RF-12).
 *
 * Vive aquí, y no en el componente, para poder probarlo: con un solo plan, armar la frase a
 * partir de "Ver mis" producía "Ver mis plan guardado" (defecto #37). El posesivo concuerda
 * en número con el sustantivo.
 */
export function textoEnlaceHistorial(cantidadPlanes: number): string {
  return cantidadPlanes === 1 ? "Ver mi plan guardado" : `Ver mis ${cantidadPlanes} planes guardados`;
}

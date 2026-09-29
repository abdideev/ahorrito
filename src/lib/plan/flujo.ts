/**
 * Lectura del flujo NDJSON que devuelve `POST /api/planes` (I-01, SC-05).
 *
 * Vive aparte del componente para poder probarla sin navegador: recibe un `Response` y
 * entrega las líneas conforme llegan. La primera trae el plan y la segunda la
 * explicación, que puede ser nula (RNF-03).
 */

import type { Plan } from "@/core/tipos";

export type LineaPlan =
  | { readonly tipo: "plan"; readonly id: string; readonly plan: Plan }
  | { readonly tipo: "explicacion"; readonly explicacion: string | null };

/** Recorre el cuerpo de la respuesta entregando una línea cada vez que se completa. */
export async function* leerFlujo(respuesta: Response): AsyncGenerator<LineaPlan> {
  if (respuesta.body === null) {
    return;
  }
  const lector = respuesta.body.getReader();
  const decodificador = new TextDecoder();
  let pendiente = "";

  for (;;) {
    const { value, done } = await lector.read();
    if (done) {
      break;
    }
    pendiente += decodificador.decode(value, { stream: true });
    let corte = pendiente.indexOf("\n");
    while (corte >= 0) {
      const linea = pendiente.slice(0, corte).trim();
      pendiente = pendiente.slice(corte + 1);
      if (linea !== "") {
        yield JSON.parse(linea) as LineaPlan;
      }
      corte = pendiente.indexOf("\n");
    }
  }
  // Un servidor que cierra sin salto final no debe costar la última línea.
  const resto = pendiente.trim();
  if (resto !== "") {
    yield JSON.parse(resto) as LineaPlan;
  }
}

/** Mensaje para el usuario según el código de estado, sin filtrar detalles del servidor. */
export function mensajeDeError(estado: number): string {
  switch (estado) {
    case 401:
      return "Tu sesión terminó. Vuelve a iniciar sesión para generar tu plan.";
    case 422:
      return "Necesitas un presupuesto y al menos un pago registrado para generar tu plan.";
    case 503:
      return "No pudimos acceder a tus datos en este momento. Intenta de nuevo en un minuto.";
    default:
      return "No pudimos generar tu plan. Intenta de nuevo.";
  }
}

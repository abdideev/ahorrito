/**
 * Cronometraje de CA-08 (RNF-01): plan entregado en 30 s o menos en al menos 18 de 20
 * solicitudes. Plan de pruebas, caso CP-08.
 *
 * Uso: en la consola del navegador, con la sesión iniciada en la aplicación (local o
 * producción) y una captura válida. Hace N solicitudes `POST /api/planes` seguidas, igual que
 * el botón "Generar mi plan" (con explicación), y mide desde el envío hasta que llega la línea
 * del plan del flujo NDJSON y hasta que llega la línea de la explicación. Cada solicitud guarda
 * un plan; con `borrar: true` se eliminan al terminar.
 *
 *   await cronometrarPlanes({ solicitudes: 20, borrar: true })
 */
async function cronometrarPlanes({ solicitudes = 20, borrar = true, limiteMs = 30_000 } = {}) {
  const filas = [];
  for (let n = 1; n <= solicitudes; n++) {
    const t0 = performance.now();
    const respuesta = await fetch("/api/planes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ explicar: true }),
    });
    const lector = respuesta.body.getReader();
    const decodificador = new TextDecoder();
    let pendiente = "";
    let planMs = null;
    let explicacionMs = null;
    let id = null;
    let explicacion = null;
    for (;;) {
      const { value, done } = await lector.read();
      if (done) break;
      pendiente += decodificador.decode(value, { stream: true });
      let salto;
      while ((salto = pendiente.indexOf("\n")) >= 0) {
        const linea = JSON.parse(pendiente.slice(0, salto));
        pendiente = pendiente.slice(salto + 1);
        if (linea.tipo === "plan") {
          planMs = Math.round(performance.now() - t0);
          id = linea.id;
        } else {
          explicacionMs = Math.round(performance.now() - t0);
          explicacion = linea.explicacion === null ? "nula" : "recibida";
        }
      }
    }
    filas.push({ n, http: respuesta.status, planMs, explicacionMs, explicacion, id });
  }
  const dentro = filas.filter((f) => f.planMs !== null && f.planMs <= limiteMs).length;
  const tiempos = filas.map((f) => f.planMs).filter((t) => t !== null).sort((a, b) => a - b);
  let borrados = 0;
  if (borrar) {
    for (const f of filas) {
      if (f.id && (await fetch(`/api/planes/${f.id}`, { method: "DELETE" })).status === 204) borrados++;
    }
  }
  return {
    fecha: new Date().toISOString(),
    origen: location.origin,
    solicitudes,
    dentroDelLimite: `${dentro}/${solicitudes}`,
    cumple: dentro >= Math.ceil(solicitudes * 0.9),
    planMs: { minimo: tiempos[0], mediana: tiempos[Math.floor(tiempos.length / 2)], maximo: tiempos.at(-1) },
    borrados,
    filas: filas.map((f) => ({ n: f.n, http: f.http, planMs: f.planMs, explicacionMs: f.explicacionMs, explicacion: f.explicacion })),
  };
}

// Queda disponible en la consola después de pegar el archivo.
window.cronometrarPlanes = cronometrarPlanes;

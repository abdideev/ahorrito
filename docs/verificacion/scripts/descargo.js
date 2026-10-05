/**
 * Medición de CA-07 (RF-11): ¿el descargo es visible sin desplazamiento en la pantalla del plan?
 * Plan de pruebas, caso CP-07.
 *
 * Uso: con el plan recién generado y sin tocar el desplazamiento, pegar en la consola del
 * navegador (o ejecutarlo con la herramienta del navegador). Devuelve un objeto que se copia
 * tal cual al registro de la ejecución.
 *
 * "Visible sin desplazamiento" se interpreta como: el rectángulo completo del descargo está
 * dentro de la ventana (borde superior ≥ 0 y borde inferior ≤ alto de la ventana) en el
 * estado en que la aplicación deja la página después de generar el plan.
 */
(() => {
  const descargo = document.querySelector('p[role="note"]');
  if (descargo === null) {
    return { error: "No hay descargo en la página: ¿se generó el plan?" };
  }
  const r = descargo.getBoundingClientRect();
  const enfocado = document.activeElement;
  return {
    fecha: new Date().toISOString(),
    ruta: location.pathname,
    ventana: `${innerWidth}x${innerHeight}`,
    desplazamientoVertical: Math.round(scrollY),
    descargoArriba: Math.round(r.top),
    descargoAbajo: Math.round(r.bottom),
    visibleCompleto: r.top >= 0 && r.bottom <= innerHeight,
    foco: enfocado ? `${enfocado.tagName.toLowerCase()}${enfocado.id ? `#${enfocado.id}` : ""}` : null,
    temaOscuro: document.documentElement.classList.contains("dark"),
  };
})();

/**
 * Lleva el foco a una sección y alinea su borde superior con el de la ventana (CA-07).
 *
 * `focus()` a secas no basta: cuando el elemento es más alto que la ventana, Chrome lo
 * centra, y el descargo, que es lo primero de la sección, queda por encima del borde
 * visible. Por eso se enfoca sin desplazar y el desplazamiento se pide aparte, con
 * `block: "start"`. `scroll-margin-top` de la sección deja un respiro arriba.
 *
 * El salto es inmediato y no suave: un desplazamiento suave lo interrumpe el
 * `router.refresh()` que sigue a la llegada del plan, y además no respeta por sí solo
 * la preferencia de reducir el movimiento.
 */
export function enfocarAlInicio(elemento: HTMLElement | null): void {
  if (elemento === null) {
    return;
  }
  elemento.focus({ preventScroll: true });
  elemento.scrollIntoView({ block: "start" });
}

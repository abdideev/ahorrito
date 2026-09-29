/**
 * Descargo de responsabilidad (RF-11, restricción legal RES-09).
 *
 * CA-07 exige que sea visible **sin desplazamiento** en la pantalla que muestra el plan.
 * Por eso se coloca encima de las cifras y no al pie: un aviso al final de una tabla de
 * doce semanas solo lo lee quien ya recorrió todo el plan.
 *
 * No es un `aria-live`: no es una novedad que anunciar, sino una condición permanente
 * del resultado. Se marca con `role="note"` para que los lectores de pantalla lo
 * presenten como una acotación del plan.
 */
export function Descargo() {
  return (
    <p
      role="note"
      className="rounded border border-amber-600 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100"
    >
      <strong>Esto es una sugerencia de organización personal, no asesoría financiera.</strong>{" "}
      Ahorrito reparte el dinero que tú declaras; revisa el plan con tu criterio antes de
      comprometer un pago.
    </p>
  );
}

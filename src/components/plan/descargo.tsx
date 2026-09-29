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
      className="flex items-start gap-3 rounded-xl border border-borde border-l-4 border-l-alerta bg-superficie p-4 text-sm leading-6 text-texto"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-alerta"
        fill="none"
      >
        <path
          d="M12 9v4m0 4h.01M10.3 3.8 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        <strong>Esto es una sugerencia de organización personal, no asesoría financiera.</strong>{" "}
        Ahorrito reparte el dinero que tú declaras; revisa el plan con tu criterio antes de
        comprometer un pago.
      </span>
    </p>
  );
}

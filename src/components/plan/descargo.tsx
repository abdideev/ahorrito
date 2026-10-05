import { IconoAviso } from "@/components/ui/iconos";

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
      className="flex items-start gap-4 rounded-3xl border border-alerta/30 bg-alerta-suave p-4 text-sm leading-6 text-texto sm:items-center sm:p-5"
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-tarjeta text-alerta-texto">
        <IconoAviso />
      </span>
      <span>
        <strong>Esto es una sugerencia de organización personal, no asesoría financiera.</strong>{" "}
        Ahorrito reparte el dinero que tú declaras; revisa el plan con tu criterio antes de
        comprometer un pago.
      </span>
    </p>
  );
}

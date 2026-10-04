import Link from "next/link";
import { RUTA_PRIVACIDAD } from "@/lib/autenticacion/rutas";
import { RESPONSABLE, VERSION_AVISO } from "@/lib/privacidad/aviso";

/**
 * Aviso de privacidad simplificado del registro (RF-15, SC-09 #32).
 *
 * Va justo debajo de la casilla de consentimiento, que lo cita con `aria-describedby`: un
 * lector de pantalla lo anuncia al llegar a ella. Conserva lo que debe decir un aviso
 * simplificado (responsable, finalidades, ausencia de finalidades secundarias y dónde leer
 * el integral) en tres líneas, para que la tarjeta del registro no obligue a desplazarse;
 * el detalle vive en `/privacidad`. No es asesoría legal.
 */
export function AvisoSimplificado({ id }: { id: string }) {
  return (
    <p id={id} className="pl-9 text-xs leading-5 text-texto-suave">
      <span className="font-semibold text-texto">Aviso simplificado v{VERSION_AVISO}.</span> {RESPONSABLE.nombre},
      responsable de este proyecto académico, usa tu correo y lo que captures solo para tu cuenta y para calcular,
      guardar y explicar tu plan. A la inteligencia artificial solo van montos y fechas. Sin publicidad ni venta de
      datos.{" "}
      <Link
        href={RUTA_PRIVACIDAD}
        className="font-bold text-texto underline decoration-2 underline-offset-4"
        target="_blank"
        rel="noopener"
      >
        Aviso integral
        <span className="sr-only"> (se abre en una pestaña nueva)</span>
      </Link>
    </p>
  );
}

import Link from "next/link";
import { RUTA_PRIVACIDAD } from "@/lib/autenticacion/rutas";
import { RESPONSABLE, VERSION_AVISO } from "@/lib/privacidad/aviso";

/**
 * Aviso de privacidad simplificado del registro (RF-15, SC-09 #32).
 *
 * Va antes de la casilla de consentimiento y la casilla lo cita con
 * `aria-describedby`, de modo que un lector de pantalla lo anuncia al llegar a ella.
 * El texto es el aprobado por el responsable; no es asesoría legal.
 */
export function AvisoSimplificado({ id }: { id: string }) {
  return (
    <div id={id} className="hundido space-y-2 p-4 text-sm leading-6 text-texto-suave">
      <p className="font-semibold text-texto">Aviso de privacidad simplificado · versión {VERSION_AVISO}</p>
      <p>
        {RESPONSABLE.nombre}, desarrollador del proyecto académico Ahorrito, es responsable del tratamiento de tus
        datos. Usamos tu correo y tu contraseña para crear tu cuenta y dejarte entrar, y lo que captures (presupuesto,
        pagos, ingresos extra y meta de ahorro) para calcular tu plan semanal, guardarlo y generar su explicación. Al
        servicio de inteligencia artificial solo se envían montos y fechas, nunca tu correo ni el nombre de tus pagos.
        Todas estas finalidades son necesarias para el servicio; no usamos tus datos para publicidad ni los vendemos.
      </p>
      <p>
        Consulta el{" "}
        <Link
          href={RUTA_PRIVACIDAD}
          className="font-bold text-texto underline decoration-2 underline-offset-4"
          target="_blank"
          rel="noopener"
        >
          aviso de privacidad integral
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </Link>
        .
      </p>
    </div>
  );
}

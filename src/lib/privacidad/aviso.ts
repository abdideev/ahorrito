/**
 * Datos del aviso de privacidad (RF-15, SC-09 #32, restricción legal RES-08).
 *
 * La versión y la fecha viven aquí, y no escritas en la página, porque las usan tres
 * lugares que deben coincidir: el aviso integral, el aviso simplificado del registro y
 * el consentimiento que se guarda con cada cuenta. Al publicar una versión nueva del
 * aviso basta cambiar este archivo.
 */

export const VERSION_AVISO = "1.0";

/** Fecha de aprobación de la versión vigente: la de la fusión de SC-09 en `dev`. */
export const FECHA_AVISO = "2026-10-03";

export const RESPONSABLE = {
  nombre: "Abdiel Avila Neri",
  correo: "av446034@uaeh.edu.mx",
  domicilio: "Allende 319, Colonia Centro, C.P. 43600, Tulancingo de Bravo, Hidalgo",
} as const;

/** Días naturales para eliminar los datos después de retirar el servicio. */
export const DIAS_ELIMINACION_TRAS_RETIRO = 30;

/** Valor que envía la casilla de consentimiento del registro cuando está marcada. */
export const VALOR_ACEPTA_AVISO = "si";

/**
 * Constancia del consentimiento que se guarda en los metadatos del usuario de Supabase
 * Auth al registrarse. Registra qué versión del aviso se aceptó y cuándo, sin una tabla
 * propia (decisión de SC-09).
 */
export interface ConsentimientoAviso {
  readonly aviso_privacidad_version: string;
  readonly aviso_privacidad_aceptado_en: string;
}

export function constanciaDeConsentimiento(ahora: Date): ConsentimientoAviso {
  return {
    aviso_privacidad_version: VERSION_AVISO,
    aviso_privacidad_aceptado_en: ahora.toISOString(),
  };
}

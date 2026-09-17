/**
 * SC-02 (RF-14). Créditos del proyecto.
 *
 * Los roles y las horas provienen de las secciones 1.7.2 y 1.8.5 del documento maestro.
 * Si el documento cambia, estas cifras deben cambiar con él: la prueba de creditos.test.ts
 * verifica que el total siga cuadrando con las 752 horas estimadas.
 */

export interface RolProyecto {
  readonly rol: string;
  readonly responsable: string;
  readonly aportacion: string;
  readonly horas: number;
}

/** Esfuerzo total estimado en la sección 1.8.5 del documento maestro. */
export const HORAS_ESTIMADAS = 752;

export const ROLES: readonly RolProyecto[] = [
  {
    rol: "Analista",
    responsable: "Abdiel Ávila Neri",
    aportacion: "Requisitos y modelado del sistema",
    horas: 192,
  },
  {
    rol: "Diseñador",
    responsable: "Abdiel Ávila Neri",
    aportacion: "Interfaz, base de datos y componentes",
    horas: 160,
  },
  {
    rol: "Programador",
    responsable: "Abdiel Ávila Neri",
    aportacion: "Codificación y pruebas unitarias",
    horas: 248,
  },
  {
    rol: "Tester",
    responsable: "Abdiel Ávila Neri",
    aportacion: "Casos de prueba y registro de defectos",
    horas: 64,
  },
  {
    rol: "Líder del proyecto",
    responsable: "Abdiel Ávila Neri",
    aportacion: "Planificación, cambios y riesgos",
    horas: 88,
  },
];

export const CREDITOS = {
  proyecto: "Ahorrito",
  institucion: "Universidad Autónoma del Estado de Hidalgo · Escuela Superior de Tlahuelilpan",
  asignatura: "Administración de la Calidad del Software",
  grupo: "702",
  cliente: "Abdiel Ávila Neri",
  docente: "Mtro. Guillermo Mera Callejas",
  evaluadores: "Tres estudiantes evaluadores",
  norma: "ISO/IEC/IEEE 12207:2026",
  tecnologias: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "API de Gemini", "Vitest"],
  asistencia: "Claude (Anthropic)",
  componentes: "Confeti: Magic UI (MIT) sobre canvas-confetti (ISC)",
  entrega: "13 de noviembre de 2026",
} as const;

export function totalHoras(roles: readonly RolProyecto[]): number {
  return roles.reduce((total, rol) => total + rol.horas, 0);
}

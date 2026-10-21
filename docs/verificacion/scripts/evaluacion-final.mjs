// Genera docs/evaluacion-final.md: matriz punto por punto de la lista de verificación y porcentaje
// con la fórmula de la lista. Uso: node docs/verificacion/scripts/evaluacion-final.mjs docs/evaluacion-final.md
// p: 2, 1, 0 o "N/A". dep: el puntaje depende de algo aún no ejecutado (se indica qué).
import { writeFileSync } from "node:fs";

const M = "documento maestro";
const secciones = [
  ["1. Inicio y definición del sistema", [
    ["1.1", "¿Se definió el propósito?", `${M} 1.1`, 2],
    ["1.2", "¿Se identificaron las necesidades?", `${M} 1.2 (NEC-01 a NEC-07) y Anexo A`, 2],
    ["1.3", "¿Se identificaron las partes interesadas?", `${M} 1.3 (STK-01 a STK-06)`, 2],
    ["1.4", "¿Se definieron los objetivos?", `${M} 1.4 (OBJ-01 a OBJ-06, con indicador verificable)`, 2],
    ["1.5", "¿Se definió el alcance?", `${M} 1.5 (incluido, excluido, supuestos y acta del 16/08). Las firmas del acta son líneas sin firmar`, 2],
    ["1.6", "¿Se identificaron restricciones?", `${M} 1.6 (RES-01 a RES-16)`, 2],
    ["1.7", "¿Se definieron responsables?", `${M} 1.7 (RACI y roles con costo)`, 2],
    ["1.8", "¿Se estableció un plan?", `${M} 1.8 (metodología, fases, cronograma, Project, costo, contrato y riesgos); docs/Ahorrito-PLAN.md`, 2],
  ]],
  ["2. Análisis y gestión de requisitos", [
    ["2.1", "¿Requisitos del usuario?", `${M} 2.1 (RU-01 a RU-08)`, 2],
    ["2.2", "¿Requisitos funcionales?", `${M} 2.2 (RF-01 a RF-15)`, 2],
    ["2.3", "¿Requisitos no funcionales?", `${M} 2.3 (RNF-01 a RNF-11, ISO/IEC 25010)`, 2],
    ["2.4", "¿Revisados con los interesados?", `${M} 2.4: solo revisión interna; la externa con STK-04 no se realizó y el docente no revisó (RSG-03 materializado). La Parte 0 de la validación es una revisión retroactiva`, 1, "Parte 0 de las sesiones (sube la evidencia, no el puntaje: sigue siendo retroactiva)"],
    ["2.5", "¿Requisitos aprobados?", `${M} 2.5 (aprobación del 16/08 como línea base). Firmas sin rubricar en el .docx`, 2],
    ["2.6", "¿Identificador único?", `${M} 2.6`, 2],
    ["2.7", "¿Trazables hasta la implementación?", `${M} 2.7 (matriz completa con implementación y caso de prueba; 4.1 del .docx)`, 2],
    ["2.8", "¿Se controlaron los cambios?", `${M} 2.8; SC-01 a SC-10 (#1 a #33). Una excepción declarada: #41 sin solicitud`, 2],
    ["2.9", "¿Conflictos analizados?", `${M} 2.9 (4 conflictos con resolución)`, 2],
    ["2.10", "¿Requisitos verificables?", `${M} 2.10 (CA-01 a CA-26)`, 2],
  ]],
  ["3. Diseño y arquitectura", [
    ["3.1", "¿Arquitectura definida?", `${M} 3.1 y docs/diagramas/01-arquitectura.mmd`, 2],
    ["3.2", "¿Componentes documentados?", `${M} 3.2 (C-01 a C-07) y diagrama de clases`, 2],
    ["3.3", "¿Interfaces documentadas?", `${M} 3.3 (I-01 a I-07, contrato y secuencia)`, 2],
    ["3.4", "¿Arquitectura de datos?", `${M} 3.4 y supabase/migrations/`, 2],
    ["3.5", "¿Tecnologías documentadas?", `${M} 3.5 (versiones actualizadas en 4.1)`, 2],
    ["3.6", "¿Requisitos de seguridad?", `${M} 3.6 (AM-01 a AM-07, verificados)`, 2],
    ["3.7", "¿Rendimiento, disponibilidad y escalabilidad?", `${M} 3.7`, 2],
    ["3.8", "¿Diseño revisado y aprobado?", `${M} 3.8 (aprobación del 16/09, posterior al inicio de C-03; desviación declarada)`, 2],
    ["3.9", "¿Trazabilidad requisitos-diseño?", `${M} 3.9 (15 RF y 11 RNF cubiertos)`, 2],
  ]],
  ["4. Implementación / construcción", [
    ["4.1", "¿El código implementa los requisitos?", `${M} 4.1; src/; 356 pruebas unitarias`, 2],
    ["4.2", "¿Control de versiones?", "Repositorio público en GitHub; main y dev protegidas (API, 05/10)", 2],
    ["4.3", "¿Se controlan las versiones?", "Etiquetas v0.1.0 a v1.1.0 (git tag -n1)", 2],
    ["4.4", "¿Revisiones de código?", "Todo entró por pull request (34), pero solo 9 de 34 tienen comentario de revisión en línea (#35, #38, #39, #45 a #49 y #55; API, 21/10) y la mediana de creación a fusión es de 0.7 min. Revisor y autor son la misma persona", 1],
    ["4.5", "¿Estándares de programación?", `${M} 4.5; pnpm lint sin errores; TypeScript estricto; regla que aísla src/core`, 2],
    ["4.6", "¿Defectos registrados y controlados?", "Issues con etiquetas: 11 defectos registrados (#3, #27, #30, #31, #34, #37 y, de forma retroactiva el 21/10/2026, #50 a #54), todos cerrados; #53 se corrigió en el PR #55", 2],
    ["4.7", "¿Se controlan los cambios al código?", "Commits con convención y Refs #n; pull requests. Excepción declarada: #41", 2],
    ["4.8", "¿Versiones liberadas identificables?", "v1.0.0 (b072b45) y v1.1.0 (4d14004); docs/liberacion.md 8.2", 2],
    ["4.9", "¿Documentación técnica para mantener?", `${M} 4.9; docs/*.md por componente; README`, 2],
  ]],
  ["5. Integración", [
    ["5.1", "¿Integración controlada?", `${M} 5.1 (8 pasos, cada uno con pull request)`, 2],
    ["5.2", "¿Interfaces verificadas?", `${M} 5.2; 20 pruebas de integración contra la base real. Cifra de I-02 por corregir (bitácora 9.11)`, 2],
    ["5.3", "¿Problemas de integración identificados?", `${M} 5.3 (14 problemas, todos resueltos)`, 2],
    ["5.4", "¿Versiones controladas en la integración?", `${M} 5.4; etiquetas y pnpm-lock.yaml. Sin integración continua (Vercel compila cada fusión en main)`, 2],
    ["5.5", "¿Pruebas después de integrar?", `${M} 5.5; suites antes de cada pull request`, 2],
  ]],
  ["6. Verificación", [
    ["6.1", "¿Plan de pruebas?", "docs/plan-de-pruebas.md v1.0, aprobado el 03/10", 2],
    ["6.2", "¿Casos de prueba?", "CP-01 a CP-26; perfiles P1 a P3; salvedad de formato declarada en el informe", 2],
    ["6.3", "¿Casos relacionados con requisitos?", "Matriz del plan (sección 6) y 2.7", 2],
    ["6.4", "¿Pruebas unitarias?", "356 de 356; cobertura de src/core 99.19 %", 2],
    ["6.5", "¿Pruebas de integración?", "20 pasadas, 2 marcadores omitidos", 2],
    ["6.6", "¿Pruebas funcionales?", "docs/verificacion/ por criterio; 6 pruebas de interfaz", 2],
    ["6.7", "¿Defectos registrados?", "Informe 4.1 y 4.2 (las 3 sin incidencia están declaradas)", 2],
    ["6.8", "¿Defectos críticos corregidos?", "Ningún bloqueante; #31 (mayor) corregido por SC-09", 2],
    ["6.9", "¿Pruebas de regresión?", "docs/verificacion/regresion/; antes y después de cada corrección", 2],
    ["6.10", "¿Resultados documentados?", "docs/informe-de-pruebas.md, aprobado el 04/10", 2],
  ]],
  ["7. Validación", [
    ["7.1", "¿Criterios de aceptación definidos?", `${M} 2.10 y 7.1; protocolo de validación 1.2`, 2],
    ["7.2", "¿Evaluado en el entorno previsto?", "Producción verificada por el desarrollador (CA-01, CA-08, CA-21 b, CA-25); falta la evaluación por usuarios", 1, "sesiones con E1 a E3"],
    ["7.3", "¿Participaron los usuarios?", "Protocolo e instrucciones aprobados (#45, #46); sesiones pendientes", 0, "sesiones con E1 a E3"],
    ["7.4", "¿Se comprobaron las necesidades?", "Pendiente: CA-20, OBJ-02 y OBJ-05", 0, "sesiones y procesamiento"],
    ["7.5", "¿Resultados de validación documentados?", "Scripts listos; informe pendiente", 0, "docs/informe-de-validacion.md"],
    ["7.6", "¿El cliente aprobó el sistema?", "Acta de aceptación pendiente", 0, "acta firmada por STK-01"],
  ]],
  ["8. Liberación e implementación", [
    ["8.1", "¿Procedimiento de liberación?", "docs/liberacion.md 8.1, ejecutado", 2],
    ["8.2", "¿Versión identificada?", "8.2: v1.0.0 y v1.1.0", 2],
    ["8.3", "¿Se verificó la versión liberada?", "8.3: lista de 17 ítems con resultado; prueba de humo en producción", 2],
    ["8.4", "¿Procedimiento de instalación?", "8.4; despliegue en unos 4 min (CA-25)", 2],
    ["8.5", "¿Configuraciones documentadas?", "8.5 (variables, Supabase, Vercel y SMTP)", 2],
    ["8.6", "¿Mecanismo de reversión?", "8.6 con tres opciones, documentado pero nunca probado", 1],
    ["8.7", "¿Liberación registrada formalmente?", "Acta 8.7 firmada (Liberada con observaciones)", 2],
  ]],
  ["9. Operación", [
    ["9.1", "¿Procedimiento de operación?", "docs/operacion.md 9.1 (redespliegue, pausa de Supabase, cuota de Gemini y rutina de actividad)", 2],
    ["9.2", "¿Responsables de operación?", "docs/operacion.md 9.2; RACI", 2],
    ["9.3", "¿Se monitorea?", "Registros de Vercel (1 h) y Supabase (1 día) y pruebas de humo; sin alertas", 1],
    ["9.4", "¿Se registran incidentes?", "Issues; el incidente de operación del 28/09 (pausa de Supabase) quedó registrado de forma retroactiva en #54", 2],
    ["9.5", "¿Mecanismos de respaldo?", "Respaldo de las 7 tablas el 21/10/2026, con conteos idénticos a la base y SHA-256 (docs/verificacion/2026-10-21-respaldo.md); el plan gratuito no incluye respaldos automáticos", 2],
    ["9.6", "¿Procedimientos de recuperación?", "Reanudación del 28/09 ejercitada; restauración de datos y reversión no probadas", 1],
    ["9.7", "¿Niveles de servicio?", "Sin acuerdo de nivel de servicio: proyecto académico (RES-15) en planes gratuitos", "N/A"],
  ]],
  ["10. Mantenimiento", [
    ["10.1", "¿Proceso para solicitar modificaciones?", "docs/mantenimiento.md 10.1; plantilla; SC-01 a SC-10", 2],
    ["10.2", "¿Evaluación de impacto?", "SC-09: impacto registrado antes del código", 2],
    ["10.3", "¿Requisitos afectados identificados?", "Registro de cada SC; matriz 2.7", 2],
    ["10.4", "¿Cambios autorizados?", "Decisión de STK-01 antes del código; excepción declarada (#41)", 2],
    ["10.5", "¿Cambios probados antes de liberar?", "Suites antes de cada pull request y de cada versión", 2],
    ["10.6", "¿Documentación actualizada?", "Bitácora de cambios al documento; .docx 4.0 a 4.3", 2],
    ["10.7", "¿Historial de versiones?", "Etiquetas e historial del .docx", 2],
  ]],
  ["11. Retiro o disposición", [
    ["11.1", "¿Procedimiento de retiro?", "docs/retiro.md 11.1", 2],
    ["11.2", "¿Sistemas o usuarios afectados?", "docs/retiro.md 11.2", 2],
    ["11.3", "¿Qué ocurre con los datos?", "docs/retiro.md 11.3 (borrado en cascada; plazo de 30 días del aviso)", 2],
    ["11.4", "¿Respaldo antes del retiro?", "Mecanismo definido y ejercitado el 21/10/2026 (supabase/verificacion/respaldo-datos.sql); el respaldo final se hace al retirar", 2],
    ["11.5", "¿Retiro documentado formalmente?", "Acta preparada y sin ejecutar: el retiro ocurre después de la calificación", "N/A", "el retiro mismo, posterior a la calificación"],
  ]],
  ["12. Gestión transversal", [
    ["12.1", "¿Proceso formal de desarrollo?", "docs/Ahorrito-PLAN.md y docs/GITFLOW.md", 2],
    ["12.2", "¿Roles y responsabilidades?", `${M} 1.7 (RACI)`, 2],
    ["12.3", "¿Se planificó?", `${M} 1.8; PLAN por fases`, 2],
    ["12.4", "¿Se gestionaron riesgos?", `${M} 1.8.7 (RSG-01 a RSG-08, con su seguimiento; RSG-01, RSG-03 y RSG-07 materializados y registrados)`, 2],
    ["12.5", "¿Se gestionaron cambios?", `${M} 2.8; SC-01 a SC-10`, 2],
    ["12.6", "¿Se gestionaron las configuraciones?", "Ramas, etiquetas, lockfile, configuración documentada (docs/liberacion.md 8.5) y variables fuera del repositorio", 2],
    ["12.7", "¿Trazabilidad de los productos?", "Matrices 2.7 y 3.9; Refs #n en commits", 2],
    ["12.8", "¿Revisiones del proyecto?", "Actas 1.5.4, 2.5, 3.8 y 8.7 y aprobaciones de plan, informe y protocolo. El punto de control semanal de 1.8.1 no dejó registro", 1],
    ["12.9", "¿Métricas del proceso?", "Tabla de métricas de esta evaluación (sección 3)", 2],
    ["12.10", "¿Oportunidades de mejora?", "Lecciones aprendidas del informe de pruebas (sección 9); desviaciones declaradas", 2],
    ["12.11", "¿Evaluación periódica del proceso?", "Revisiones del 03/10, del 05/10 y esta evaluación final; no hubo evaluación periódica sistemática", 1],
    ["12.12", "¿Participación de las partes interesadas?", "STK-01 aprueba cada entregable; STK-04 no participó en requisitos (2.4) y participa en la validación (pendiente); STK-03 no revisó requisitos", 1, "sesiones con E1 a E3"],
  ]],
];

const filas = secciones.flatMap(([s, items]) => items.map((i) => ({ s, n: i[0], q: i[1], e: i[2], p: i[3], dep: i[4] ?? null })));
const aplicables = filas.filter((f) => f.p !== "N/A");
const obtenidos = aplicables.reduce((a, f) => a + f.p, 0);
const posibles = aplicables.length * 2;
const pct = (obt, pos) => ((obt / pos) * 100).toFixed(1);
const interpretar = (v) => (v >= 90 ? "alto nivel de cumplimiento" : v >= 75 ? "cumplimiento aceptable con oportunidades de mejora" : v >= 50 ? "cumplimiento parcial" : "bajo nivel de cumplimiento");
const conteo = { 2: 0, 1: 0, 0: 0, "N/A": 0 };
filas.forEach((f) => conteo[f.p]++);
const dependientes = filas.filter((f) => f.dep);

const porSeccion = secciones.map(([s, items]) => {
  const ap = items.filter((i) => i[3] !== "N/A");
  const o = ap.reduce((a, i) => a + i[3], 0);
  return `| ${s} | ${items.length} | ${ap.length} | ${o} de ${ap.length * 2} | ${pct(o, ap.length * 2)} % |`;
});

const md = [];
md.push("# Evaluación final contra la lista de verificación ISO/IEC/IEEE 12207");
md.push("");
md.push("| Campo | Valor |");
md.push("|---|---|");
md.push("| Versión | 1.0, **preliminar**, 21/10/2026: antes de las sesiones de validación |");
md.push("| Escala | 2 = cumple; 1 = cumple parcialmente; 0 = no cumple; N/A = no aplica, con justificación |");
md.push("| Fórmula | Porcentaje = puntos obtenidos / puntos aplicables × 100 (lista de verificación, sección 13) |");
md.push("| Interpretación (de la lista; no son umbrales de la norma) | 90-100 % alto; 75-89 % aceptable con oportunidades de mejora; 50-74 % parcial; menos de 50 % bajo |");
md.push("| Cálculo | Generado con `node docs/verificacion/scripts/evaluacion-final.mjs docs/evaluacion-final.md`; los totales no se escriben a mano |");
md.push("");
md.push("## 1. Resultado preliminar");
md.push("");
md.push(`- **${obtenidos} de ${posibles} puntos aplicables: ${pct(obtenidos, posibles)} %** (${interpretar(Number(pct(obtenidos, posibles)))}).`);
md.push(`- ${filas.length} puntos: ${conteo[2]} con 2, ${conteo[1]} con 1, ${conteo[0]} con 0 y ${conteo["N/A"]} N/A.`);
md.push(`- **${dependientes.length} puntos dependen de algo aún no ejecutado** (columna "Depende de"). Los de la sección 7 cuentan hoy con 0 o 1 porque las sesiones no han terminado: es un resultado **preliminar**, que se recalcula al cerrar la validación sin cambiar los demás puntajes.`);
md.push("");
md.push("| Sección | Puntos | Aplicables | Obtenidos | Porcentaje |");
md.push("|---|---|---|---|---|");
md.push(...porSeccion);
md.push("");
md.push("## 2. Matriz punto por punto");
let actual = "";
for (const f of filas) {
  if (f.s !== actual) {
    actual = f.s;
    md.push("");
    md.push(`### ${f.s}`);
    md.push("");
    md.push("| No. | Punto | Evidencia | Puntaje | Depende de |");
    md.push("|---|---|---|---|---|");
  }
  md.push(`| ${f.n} | ${f.q} | ${f.e} | **${f.p}** | ${f.dep ?? "—"} |`);
}
md.push("");
md.push("## 3. Métricas del proceso (12.9)");
md.push("");
md.push("Datos tomados el 21/10/2026 de `git` (historia de `origin/dev`) y de la API pública de GitHub.");
md.push("");
md.push("| Métrica | Valor | Comando o fuente |");
md.push("|---|---|---|");
md.push("| Periodo con commits | 09/09/2026 a 21/10/2026 | `git log origin/dev --reverse` |");
md.push("| Commits (sin fusiones) | 206 | `git rev-list --count --no-merges origin/dev` |");
md.push("| Commits por fase (sin fusiones) | Hasta v0.1.0: 35 · v0.1.0→v0.2.0: 41 · v0.2.0→v0.3.0: 18 · v0.3.0→v0.9.0: 26 · v0.9.0→v1.0.0: 79 · v1.0.0→v1.1.0: 4 · después de v1.1.0: 3 | `git rev-list --count --no-merges <etiqueta>..<etiqueta>` |");
md.push("| Commits por tipo | feat 67 · docs 50 · test 35 · chore 22 · style 18 · fix 9 · refactor 3 · iniciales 2 | `git log --format=%s` agrupado por prefijo |");
md.push("| Pull requests fusionados | 34 (#2 a #55) | API `/pulls?state=closed` |");
md.push("| Pull requests con comentario de revisión en línea | 9 de 34 (#35, #38, #39, #45 a #49 y #55) | API `/pulls/{n}/comments` |");
md.push("| De la creación a la fusión de un pull request | Mínimo 0.1 min · mediana 0.7 min · máximo 10.7 min; 28 de 34 en menos de 2 min | API, `merged_at − created_at` |");
md.push("| Solicitudes de cambio | 10 (SC-01 a SC-10), todas autorizadas y cerradas | Issues con etiqueta `cambio` |");
md.push("| Defectos con incidencia, por fase | Fase 0: 1 (#3) · Fases 1-3: 0 · Fase 4 y rediseño: 1 (#27) · Fase 5: 3 (#30, #31, #34) + 3 retroactivas (#50, #51, #52) · Fase 6: 1 (#37) · script de CA-08: 1 (#53) · operación del 28/09: 1 (#54) | Issues con etiqueta `defecto` |");
md.push("| Defectos corregidos sin incidencia en su momento | 3 (Fase 5), registrados de forma retroactiva el 21/10/2026 (#50 a #52) | Issues |");
md.push("| Problemas de integración | 14 (" + M + " 5.3) | " + M + " |");
md.push("| Defectos abiertos | 0 | API |");
md.push("| Versiones etiquetadas | 7 (v0.1.0, v0.2.0, v0.3.0, v0.9.0, v1.0.0-rc.1, v1.0.0, v1.1.0) | `git tag` |");
md.push("| Pruebas automatizadas | 356 unitarias (29 archivos) · 20 de integración + 2 omitidas · 6 de interfaz · 28 de los scripts de validación | Ejecuciones del 05/10 y del 21/10 |");
md.push("| Cobertura del motor (src/core) | 99.19 % líneas · 98.63 % ramas · 100 % funciones | `pnpm test:cov` (05/10; src sin cambios desde entonces) |");
md.push("| Criterios de aceptación | 24 de 26 cumplidos, 1 en parte (CA-23), 1 pendiente (CA-20) | docs/liberacion.md 8.2 |");
md.push("| Adelanto sobre el cronograma | Liberación el 04/10, planeada para el 06/11 (H6): unas 4.7 semanas | " + M + " 1.8.3 |");
md.push("");
md.push("## 4. Qué cambiaría el resultado");
md.push("");
md.push("| Acción | Puntos que afecta |");
md.push("|---|---|");
md.push("| Sesiones, informe de validación y acta de aceptación | 7.2 a 7.6, 12.12 (y 2.4 como evidencia) |");
md.push("| Probar la reversión de 8.6 (por ejemplo, Instant Rollback en Vercel y regreso) | 8.6 y 9.6 |");
md.push("| Enviar las revisiones en línea pendientes de los pull requests, si existen | 4.4 |");
md.push("");
writeFileSync(process.argv[2], md.join("\n"));
console.log(`total ${obtenidos}/${posibles} = ${pct(obtenidos, posibles)} % | 2:${conteo[2]} 1:${conteo[1]} 0:${conteo[0]} N/A:${conteo["N/A"]} | dependen: ${dependientes.length} | puntos: ${filas.length}`);

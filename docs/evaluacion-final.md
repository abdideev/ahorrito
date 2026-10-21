# Evaluación final contra la lista de verificación ISO/IEC/IEEE 12207

| Campo | Valor |
|---|---|
| Versión | 1.0, **preliminar**, 21/10/2026: antes de las sesiones de validación |
| Escala | 2 = cumple; 1 = cumple parcialmente; 0 = no cumple; N/A = no aplica, con justificación |
| Fórmula | Porcentaje = puntos obtenidos / puntos aplicables × 100 (lista de verificación, sección 13) |
| Interpretación (de la lista; no son umbrales de la norma) | 90-100 % alto; 75-89 % aceptable con oportunidades de mejora; 50-74 % parcial; menos de 50 % bajo |
| Cálculo | Generado con `node docs/verificacion/scripts/evaluacion-final.mjs docs/evaluacion-final.md`; los totales no se escriben a mano |

## 1. Resultado preliminar

- **169 de 186 puntos aplicables: 90.9 %** (alto nivel de cumplimiento).
- 95 puntos: 80 con 2, 9 con 1, 4 con 0 y 2 N/A.
- **8 puntos dependen de algo aún no ejecutado** (columna "Depende de"). Los de la sección 7 cuentan hoy con 0 o 1 porque las sesiones no han terminado: es un resultado **preliminar**, que se recalcula al cerrar la validación sin cambiar los demás puntajes.

| Sección | Puntos | Aplicables | Obtenidos | Porcentaje |
|---|---|---|---|---|
| 1. Inicio y definición del sistema | 8 | 8 | 16 de 16 | 100.0 % |
| 2. Análisis y gestión de requisitos | 10 | 10 | 19 de 20 | 95.0 % |
| 3. Diseño y arquitectura | 9 | 9 | 18 de 18 | 100.0 % |
| 4. Implementación / construcción | 9 | 9 | 17 de 18 | 94.4 % |
| 5. Integración | 5 | 5 | 10 de 10 | 100.0 % |
| 6. Verificación | 10 | 10 | 20 de 20 | 100.0 % |
| 7. Validación | 6 | 6 | 3 de 12 | 25.0 % |
| 8. Liberación e implementación | 7 | 7 | 13 de 14 | 92.9 % |
| 9. Operación | 7 | 6 | 10 de 12 | 83.3 % |
| 10. Mantenimiento | 7 | 7 | 14 de 14 | 100.0 % |
| 11. Retiro o disposición | 5 | 4 | 8 de 8 | 100.0 % |
| 12. Gestión transversal | 12 | 12 | 21 de 24 | 87.5 % |

## 2. Matriz punto por punto

### 1. Inicio y definición del sistema

| No. | Punto | Evidencia | Puntaje | Depende de |
|---|---|---|---|---|
| 1.1 | ¿Se definió el propósito? | documento maestro 1.1 | **2** | — |
| 1.2 | ¿Se identificaron las necesidades? | documento maestro 1.2 (NEC-01 a NEC-07) y Anexo A | **2** | — |
| 1.3 | ¿Se identificaron las partes interesadas? | documento maestro 1.3 (STK-01 a STK-06) | **2** | — |
| 1.4 | ¿Se definieron los objetivos? | documento maestro 1.4 (OBJ-01 a OBJ-06, con indicador verificable) | **2** | — |
| 1.5 | ¿Se definió el alcance? | documento maestro 1.5 (incluido, excluido, supuestos y acta del 16/08). Las firmas del acta son líneas sin firmar | **2** | — |
| 1.6 | ¿Se identificaron restricciones? | documento maestro 1.6 (RES-01 a RES-16) | **2** | — |
| 1.7 | ¿Se definieron responsables? | documento maestro 1.7 (RACI y roles con costo) | **2** | — |
| 1.8 | ¿Se estableció un plan? | documento maestro 1.8 (metodología, fases, cronograma, Project, costo, contrato y riesgos); docs/Ahorrito-PLAN.md | **2** | — |

### 2. Análisis y gestión de requisitos

| No. | Punto | Evidencia | Puntaje | Depende de |
|---|---|---|---|---|
| 2.1 | ¿Requisitos del usuario? | documento maestro 2.1 (RU-01 a RU-08) | **2** | — |
| 2.2 | ¿Requisitos funcionales? | documento maestro 2.2 (RF-01 a RF-15) | **2** | — |
| 2.3 | ¿Requisitos no funcionales? | documento maestro 2.3 (RNF-01 a RNF-11, ISO/IEC 25010) | **2** | — |
| 2.4 | ¿Revisados con los interesados? | documento maestro 2.4: solo revisión interna; la externa con STK-04 no se realizó y el docente no revisó (RSG-03 materializado). La Parte 0 de la validación es una revisión retroactiva | **1** | Parte 0 de las sesiones (sube la evidencia, no el puntaje: sigue siendo retroactiva) |
| 2.5 | ¿Requisitos aprobados? | documento maestro 2.5 (aprobación del 16/08 como línea base). Firmas sin rubricar en el .docx | **2** | — |
| 2.6 | ¿Identificador único? | documento maestro 2.6 | **2** | — |
| 2.7 | ¿Trazables hasta la implementación? | documento maestro 2.7 (matriz completa con implementación y caso de prueba; 4.1 del .docx) | **2** | — |
| 2.8 | ¿Se controlaron los cambios? | documento maestro 2.8; SC-01 a SC-10 (#1 a #33). Una excepción declarada: #41 sin solicitud | **2** | — |
| 2.9 | ¿Conflictos analizados? | documento maestro 2.9 (4 conflictos con resolución) | **2** | — |
| 2.10 | ¿Requisitos verificables? | documento maestro 2.10 (CA-01 a CA-26) | **2** | — |

### 3. Diseño y arquitectura

| No. | Punto | Evidencia | Puntaje | Depende de |
|---|---|---|---|---|
| 3.1 | ¿Arquitectura definida? | documento maestro 3.1 y docs/diagramas/01-arquitectura.mmd | **2** | — |
| 3.2 | ¿Componentes documentados? | documento maestro 3.2 (C-01 a C-07) y diagrama de clases | **2** | — |
| 3.3 | ¿Interfaces documentadas? | documento maestro 3.3 (I-01 a I-07, contrato y secuencia) | **2** | — |
| 3.4 | ¿Arquitectura de datos? | documento maestro 3.4 y supabase/migrations/ | **2** | — |
| 3.5 | ¿Tecnologías documentadas? | documento maestro 3.5 (versiones actualizadas en 4.1) | **2** | — |
| 3.6 | ¿Requisitos de seguridad? | documento maestro 3.6 (AM-01 a AM-07, verificados) | **2** | — |
| 3.7 | ¿Rendimiento, disponibilidad y escalabilidad? | documento maestro 3.7 | **2** | — |
| 3.8 | ¿Diseño revisado y aprobado? | documento maestro 3.8 (aprobación del 16/09, posterior al inicio de C-03; desviación declarada) | **2** | — |
| 3.9 | ¿Trazabilidad requisitos-diseño? | documento maestro 3.9 (15 RF y 11 RNF cubiertos) | **2** | — |

### 4. Implementación / construcción

| No. | Punto | Evidencia | Puntaje | Depende de |
|---|---|---|---|---|
| 4.1 | ¿El código implementa los requisitos? | documento maestro 4.1; src/; 356 pruebas unitarias | **2** | — |
| 4.2 | ¿Control de versiones? | Repositorio público en GitHub; main y dev protegidas (API, 05/10) | **2** | — |
| 4.3 | ¿Se controlan las versiones? | Etiquetas v0.1.0 a v1.1.0 (git tag -n1) | **2** | — |
| 4.4 | ¿Revisiones de código? | Todo entró por pull request (34), pero solo 9 de 34 tienen comentario de revisión en línea (#35, #38, #39, #45 a #49 y #55; API, 21/10) y la mediana de creación a fusión es de 0.7 min. Revisor y autor son la misma persona | **1** | — |
| 4.5 | ¿Estándares de programación? | documento maestro 4.5; pnpm lint sin errores; TypeScript estricto; regla que aísla src/core | **2** | — |
| 4.6 | ¿Defectos registrados y controlados? | Issues con etiquetas: 11 defectos registrados (#3, #27, #30, #31, #34, #37 y, de forma retroactiva el 21/10/2026, #50 a #54), todos cerrados; #53 se corrigió en el PR #55 | **2** | — |
| 4.7 | ¿Se controlan los cambios al código? | Commits con convención y Refs #n; pull requests. Excepción declarada: #41 | **2** | — |
| 4.8 | ¿Versiones liberadas identificables? | v1.0.0 (b072b45) y v1.1.0 (4d14004); docs/liberacion.md 8.2 | **2** | — |
| 4.9 | ¿Documentación técnica para mantener? | documento maestro 4.9; docs/*.md por componente; README | **2** | — |

### 5. Integración

| No. | Punto | Evidencia | Puntaje | Depende de |
|---|---|---|---|---|
| 5.1 | ¿Integración controlada? | documento maestro 5.1 (8 pasos, cada uno con pull request) | **2** | — |
| 5.2 | ¿Interfaces verificadas? | documento maestro 5.2; 20 pruebas de integración contra la base real. Cifra de I-02 por corregir (bitácora 9.11) | **2** | — |
| 5.3 | ¿Problemas de integración identificados? | documento maestro 5.3 (14 problemas, todos resueltos) | **2** | — |
| 5.4 | ¿Versiones controladas en la integración? | documento maestro 5.4; etiquetas y pnpm-lock.yaml. Sin integración continua (Vercel compila cada fusión en main) | **2** | — |
| 5.5 | ¿Pruebas después de integrar? | documento maestro 5.5; suites antes de cada pull request | **2** | — |

### 6. Verificación

| No. | Punto | Evidencia | Puntaje | Depende de |
|---|---|---|---|---|
| 6.1 | ¿Plan de pruebas? | docs/plan-de-pruebas.md v1.0, aprobado el 03/10 | **2** | — |
| 6.2 | ¿Casos de prueba? | CP-01 a CP-26; perfiles P1 a P3; salvedad de formato declarada en el informe | **2** | — |
| 6.3 | ¿Casos relacionados con requisitos? | Matriz del plan (sección 6) y 2.7 | **2** | — |
| 6.4 | ¿Pruebas unitarias? | 356 de 356; cobertura de src/core 99.19 % | **2** | — |
| 6.5 | ¿Pruebas de integración? | 20 pasadas, 2 marcadores omitidos | **2** | — |
| 6.6 | ¿Pruebas funcionales? | docs/verificacion/ por criterio; 6 pruebas de interfaz | **2** | — |
| 6.7 | ¿Defectos registrados? | Informe 4.1 y 4.2 (las 3 sin incidencia están declaradas) | **2** | — |
| 6.8 | ¿Defectos críticos corregidos? | Ningún bloqueante; #31 (mayor) corregido por SC-09 | **2** | — |
| 6.9 | ¿Pruebas de regresión? | docs/verificacion/regresion/; antes y después de cada corrección | **2** | — |
| 6.10 | ¿Resultados documentados? | docs/informe-de-pruebas.md, aprobado el 04/10 | **2** | — |

### 7. Validación

| No. | Punto | Evidencia | Puntaje | Depende de |
|---|---|---|---|---|
| 7.1 | ¿Criterios de aceptación definidos? | documento maestro 2.10 y 7.1; protocolo de validación 1.2 | **2** | — |
| 7.2 | ¿Evaluado en el entorno previsto? | Producción verificada por el desarrollador (CA-01, CA-08, CA-21 b, CA-25); falta la evaluación por usuarios | **1** | sesiones con E1 a E3 |
| 7.3 | ¿Participaron los usuarios? | Protocolo e instrucciones aprobados (#45, #46); sesiones pendientes | **0** | sesiones con E1 a E3 |
| 7.4 | ¿Se comprobaron las necesidades? | Pendiente: CA-20, OBJ-02 y OBJ-05 | **0** | sesiones y procesamiento |
| 7.5 | ¿Resultados de validación documentados? | Scripts listos; informe pendiente | **0** | docs/informe-de-validacion.md |
| 7.6 | ¿El cliente aprobó el sistema? | Acta de aceptación pendiente | **0** | acta firmada por STK-01 |

### 8. Liberación e implementación

| No. | Punto | Evidencia | Puntaje | Depende de |
|---|---|---|---|---|
| 8.1 | ¿Procedimiento de liberación? | docs/liberacion.md 8.1, ejecutado | **2** | — |
| 8.2 | ¿Versión identificada? | 8.2: v1.0.0 y v1.1.0 | **2** | — |
| 8.3 | ¿Se verificó la versión liberada? | 8.3: lista de 17 ítems con resultado; prueba de humo en producción | **2** | — |
| 8.4 | ¿Procedimiento de instalación? | 8.4; despliegue en unos 4 min (CA-25) | **2** | — |
| 8.5 | ¿Configuraciones documentadas? | 8.5 (variables, Supabase, Vercel y SMTP) | **2** | — |
| 8.6 | ¿Mecanismo de reversión? | 8.6 con tres opciones, documentado pero nunca probado | **1** | — |
| 8.7 | ¿Liberación registrada formalmente? | Acta 8.7 firmada (Liberada con observaciones) | **2** | — |

### 9. Operación

| No. | Punto | Evidencia | Puntaje | Depende de |
|---|---|---|---|---|
| 9.1 | ¿Procedimiento de operación? | docs/operacion.md 9.1 (redespliegue, pausa de Supabase, cuota de Gemini y rutina de actividad) | **2** | — |
| 9.2 | ¿Responsables de operación? | docs/operacion.md 9.2; RACI | **2** | — |
| 9.3 | ¿Se monitorea? | Registros de Vercel (1 h) y Supabase (1 día) y pruebas de humo; sin alertas | **1** | — |
| 9.4 | ¿Se registran incidentes? | Issues; el incidente de operación del 28/09 (pausa de Supabase) quedó registrado de forma retroactiva en #54 | **2** | — |
| 9.5 | ¿Mecanismos de respaldo? | Respaldo de las 7 tablas el 21/10/2026, con conteos idénticos a la base y SHA-256 (docs/verificacion/2026-10-21-respaldo.md); el plan gratuito no incluye respaldos automáticos | **2** | — |
| 9.6 | ¿Procedimientos de recuperación? | Reanudación del 28/09 ejercitada; restauración de datos y reversión no probadas | **1** | — |
| 9.7 | ¿Niveles de servicio? | Sin acuerdo de nivel de servicio: proyecto académico (RES-15) en planes gratuitos | **N/A** | — |

### 10. Mantenimiento

| No. | Punto | Evidencia | Puntaje | Depende de |
|---|---|---|---|---|
| 10.1 | ¿Proceso para solicitar modificaciones? | docs/mantenimiento.md 10.1; plantilla; SC-01 a SC-10 | **2** | — |
| 10.2 | ¿Evaluación de impacto? | SC-09: impacto registrado antes del código | **2** | — |
| 10.3 | ¿Requisitos afectados identificados? | Registro de cada SC; matriz 2.7 | **2** | — |
| 10.4 | ¿Cambios autorizados? | Decisión de STK-01 antes del código; excepción declarada (#41) | **2** | — |
| 10.5 | ¿Cambios probados antes de liberar? | Suites antes de cada pull request y de cada versión | **2** | — |
| 10.6 | ¿Documentación actualizada? | Bitácora de cambios al documento; .docx 4.0 a 4.3 | **2** | — |
| 10.7 | ¿Historial de versiones? | Etiquetas e historial del .docx | **2** | — |

### 11. Retiro o disposición

| No. | Punto | Evidencia | Puntaje | Depende de |
|---|---|---|---|---|
| 11.1 | ¿Procedimiento de retiro? | docs/retiro.md 11.1 | **2** | — |
| 11.2 | ¿Sistemas o usuarios afectados? | docs/retiro.md 11.2 | **2** | — |
| 11.3 | ¿Qué ocurre con los datos? | docs/retiro.md 11.3 (borrado en cascada; plazo de 30 días del aviso) | **2** | — |
| 11.4 | ¿Respaldo antes del retiro? | Mecanismo definido y ejercitado el 21/10/2026 (supabase/verificacion/respaldo-datos.sql); el respaldo final se hace al retirar | **2** | — |
| 11.5 | ¿Retiro documentado formalmente? | Acta preparada y sin ejecutar: el retiro ocurre después de la calificación | **N/A** | el retiro mismo, posterior a la calificación |

### 12. Gestión transversal

| No. | Punto | Evidencia | Puntaje | Depende de |
|---|---|---|---|---|
| 12.1 | ¿Proceso formal de desarrollo? | docs/Ahorrito-PLAN.md y docs/GITFLOW.md | **2** | — |
| 12.2 | ¿Roles y responsabilidades? | documento maestro 1.7 (RACI) | **2** | — |
| 12.3 | ¿Se planificó? | documento maestro 1.8; PLAN por fases | **2** | — |
| 12.4 | ¿Se gestionaron riesgos? | documento maestro 1.8.7 (RSG-01 a RSG-08, con su seguimiento; RSG-01, RSG-03 y RSG-07 materializados y registrados) | **2** | — |
| 12.5 | ¿Se gestionaron cambios? | documento maestro 2.8; SC-01 a SC-10 | **2** | — |
| 12.6 | ¿Se gestionaron las configuraciones? | Ramas, etiquetas, lockfile, configuración documentada (docs/liberacion.md 8.5) y variables fuera del repositorio | **2** | — |
| 12.7 | ¿Trazabilidad de los productos? | Matrices 2.7 y 3.9; Refs #n en commits | **2** | — |
| 12.8 | ¿Revisiones del proyecto? | Actas 1.5.4, 2.5, 3.8 y 8.7 y aprobaciones de plan, informe y protocolo. El punto de control semanal de 1.8.1 no dejó registro | **1** | — |
| 12.9 | ¿Métricas del proceso? | Tabla de métricas de esta evaluación (sección 3) | **2** | — |
| 12.10 | ¿Oportunidades de mejora? | Lecciones aprendidas del informe de pruebas (sección 9); desviaciones declaradas | **2** | — |
| 12.11 | ¿Evaluación periódica del proceso? | Revisiones del 03/10, del 05/10 y esta evaluación final; no hubo evaluación periódica sistemática | **1** | — |
| 12.12 | ¿Participación de las partes interesadas? | STK-01 aprueba cada entregable; STK-04 no participó en requisitos (2.4) y participa en la validación (pendiente); STK-03 no revisó requisitos | **1** | sesiones con E1 a E3 |

## 3. Métricas del proceso (12.9)

Datos tomados el 21/10/2026 de `git` (historia de `origin/dev`) y de la API pública de GitHub.

| Métrica | Valor | Comando o fuente |
|---|---|---|
| Periodo con commits | 09/09/2026 a 21/10/2026 | `git log origin/dev --reverse` |
| Commits (sin fusiones) | 206 | `git rev-list --count --no-merges origin/dev` |
| Commits por fase (sin fusiones) | Hasta v0.1.0: 35 · v0.1.0→v0.2.0: 41 · v0.2.0→v0.3.0: 18 · v0.3.0→v0.9.0: 26 · v0.9.0→v1.0.0: 79 · v1.0.0→v1.1.0: 4 · después de v1.1.0: 3 | `git rev-list --count --no-merges <etiqueta>..<etiqueta>` |
| Commits por tipo | feat 67 · docs 50 · test 35 · chore 22 · style 18 · fix 9 · refactor 3 · iniciales 2 | `git log --format=%s` agrupado por prefijo |
| Pull requests fusionados | 34 (#2 a #55) | API `/pulls?state=closed` |
| Pull requests con comentario de revisión en línea | 9 de 34 (#35, #38, #39, #45 a #49 y #55) | API `/pulls/{n}/comments` |
| De la creación a la fusión de un pull request | Mínimo 0.1 min · mediana 0.7 min · máximo 10.7 min; 28 de 34 en menos de 2 min | API, `merged_at − created_at` |
| Solicitudes de cambio | 10 (SC-01 a SC-10), todas autorizadas y cerradas | Issues con etiqueta `cambio` |
| Defectos con incidencia, por fase | Fase 0: 1 (#3) · Fases 1-3: 0 · Fase 4 y rediseño: 1 (#27) · Fase 5: 3 (#30, #31, #34) + 3 retroactivas (#50, #51, #52) · Fase 6: 1 (#37) · script de CA-08: 1 (#53) · operación del 28/09: 1 (#54) | Issues con etiqueta `defecto` |
| Defectos corregidos sin incidencia en su momento | 3 (Fase 5), registrados de forma retroactiva el 21/10/2026 (#50 a #52) | Issues |
| Problemas de integración | 14 (documento maestro 5.3) | documento maestro |
| Defectos abiertos | 0 | API |
| Versiones etiquetadas | 7 (v0.1.0, v0.2.0, v0.3.0, v0.9.0, v1.0.0-rc.1, v1.0.0, v1.1.0) | `git tag` |
| Pruebas automatizadas | 356 unitarias (29 archivos) · 20 de integración + 2 omitidas · 6 de interfaz · 28 de los scripts de validación | Ejecuciones del 05/10 y del 21/10 |
| Cobertura del motor (src/core) | 99.19 % líneas · 98.63 % ramas · 100 % funciones | `pnpm test:cov` (05/10; src sin cambios desde entonces) |
| Criterios de aceptación | 24 de 26 cumplidos, 1 en parte (CA-23), 1 pendiente (CA-20) | docs/liberacion.md 8.2 |
| Adelanto sobre el cronograma | Liberación el 04/10, planeada para el 06/11 (H6): unas 4.7 semanas | documento maestro 1.8.3 |

## 4. Qué cambiaría el resultado

| Acción | Puntos que afecta |
|---|---|
| Sesiones, informe de validación y acta de aceptación | 7.2 a 7.6, 12.12 (y 2.4 como evidencia) |
| Probar la reversión de 8.6 (por ejemplo, Instant Rollback en Vercel y regreso) | 8.6 y 9.6 |
| Enviar las revisiones en línea pendientes de los pull requests, si existen | 4.4 |

# Informe de validación de Ahorrito (Fase 7)

| Campo | Valor |
|---|---|
| Versión del informe | **1.2**, 22/10/2026, por la revisión de STK-01 del mismo día: las sesiones se fechan con la base de datos y no con las horas anotadas, se corrigen el orden y la separación de las sesiones (sección 2 y D-06) y se agrega D-08 (horas anotadas de E2). La 1.1 registró la consulta de defectos abiertos del 22/10 (0; sección 8); la 1.0 es la del pull request #57 |
| Proceso de la norma | Validación (lista de verificación, puntos 7.1 a 7.6) y revisión de requisitos con los interesados (2.4, retroactiva) |
| Versión validada | **v1.1.0**, commit `4d14004`, congelada durante toda la fase (`src/` sin cambios desde `4d14004`: `git diff --quiet 4d14004 -- src`, comprobado el 22/10/2026 a las 02:20) |
| URL | https://ahorrito-nine.vercel.app |
| Protocolo aplicado | `docs/validacion/protocolo-de-validacion.md`, **versión 1.2**, aprobada por STK-01 el 21/10/2026 a las 03:43, antes de cualquier sesión |
| Registro anonimizado | `docs/validacion/registros/registro-sesiones.json` (transcrito de las hojas del anexo A; solo E1, E2 y E3) |
| Procesamiento | `node docs/validacion/scripts/procesar-validacion.mjs docs/validacion/registros/registro-sesiones.json` (reglas en `validacion.mjs`, 28 de 28 pruebas) |
| Decisión | **Aceptado con concesión del cliente** (sección 8; acta en `docs/validacion/acta-de-aceptacion.md`) |

---

## 1. Resumen

| Criterio | Resultado | Evidencia |
|---|---|---|
| **CA-20** (RNF-02) | **2 de 3 demostrados; E2 pendiente** por grabación incompleta. No se cumple la condición "3 de 3" con evidencia completa | Sección 4 |
| **OBJ-02** (NEC-06) | Igual que CA-20: misma medición | Sección 4 |
| **OBJ-05** (NEC-05, NEC-07) | **Cumple:** E1 4 y 4; E2 5 y 5; E3 5 y 5 | Sección 5 |
| Parte B (evidencia adicional de RNF-07) | 11 de 11 en E2 y en E3, sin fallos. **Safari en macOS sin validar** (E2 usó Dia) | Sección 6 |
| Parte 0 (revisión de requisitos, 2.4 retroactiva) | Cinco observaciones; ninguna es un defecto | Sección 7 |
| Defectos nuevos | Ninguno | Partes A y B |

**Decisión de STK-01 (22/10/2026, 02:40):** cerrar la validación sin sustituto para E2, con la
opción "aceptado con concesión": el resultado de CA-20 se informa tal cual (pendiente para E2) y el
cliente acepta el riesgo de que no quede demostrado. Esta decisión **no figura** en la tabla de la
sección 14 del protocolo, se tomó **después** de conocer los resultados y se registra como
desviación (sección 3, D-07).

## 2. Sesiones realizadas

Sesiones autoadministradas, sin moderador. Horas del centro de México. **Las sesiones se fechan con
la base de datos** (creación de la cuenta y primer plan), que no depende del reloj ni de la memoria
del evaluador. Las horas anotadas se conservan en el registro como respaldo: las de E1 y E3
coinciden con la base de datos (menos de 2 min de diferencia) y las de E2 no (D-08).

| Orden | Evaluador | Perfil | Cuenta creada (base de datos) | Primer plan (base de datos) | Hora anotada por el evaluador | Dispositivo y navegador | Consentimiento | Nombre en acta |
|---|---|---|---|---|---|---|---|---|
| 1 | E3 | P3 | 21/10/2026, 23:57 | 22/10/2026, 00:00 (+194 s) | 23:56 a 00:01 | iPad, iPadOS 18.7.8, Safari 18.7.8 | Sí | Sí |
| 2 | E1 | P1 | 22/10/2026, 00:47:52 | 22/10/2026, 00:50 (+153 s) | 00:47 a 00:50 | **Fedora Linux 44**, Firefox 158.0 | Sí | Sí |
| 3 | E2 | P2 | 22/10/2026, 01:01:44 | 22/10/2026, 01:06:20 (+276 s) | 00:06 a 00:09 (D-08) | Mac, macOS Golden Gate 27.0, **Dia 1.53.0** | Sí | Sí |

- **Fuente de las horas:** revisión de STK-01 del 22/10/2026 sobre el resultado de la consulta de
  tiempos (evidencia privada). La hora de E1 se obtiene restando a la de E2 los 13 min 52 s que
  separan las dos cuentas. Los primeros planes de E3 y de E1 se calculan con la cuenta más el
  intervalo de la base de datos. Las horas de los primeros planes de E3 y de E1 coinciden con las
  de la lista de planes guardados (00:00 y 00:50).

- **Experiencia previa:** los tres respondieron que no ("Antes de hoy, ¿habías usado Ahorrito, o
  visto su código o sus documentos?"). Ninguno quedó excluido.
- **Consulta de tiempos:** una sola ejecución, el 22/10/2026 a las 01:36, para los tres.
- **Correo de confirmación:** llegó a los tres en menos de 10 minutos y a ninguno en spam.
- **Ayuda externa:** ninguno la recibió.
- **Explicación de la inteligencia artificial:** apareció a los tres, sin 429.
- Los nombres de los evaluadores solo aparecen en el acta firmada, fuera del repositorio
  (protocolo, sección 15).

## 3. Desviaciones respecto del protocolo

| # | Desviación | Protocolo | Efecto |
|---|---|---|---|
| D-01 | E1 usó **Fedora Linux con Firefox**, no Windows | Sección 3 | La combinación Windows queda sin medir en la validación. El tiempo de E1 es válido para CA-20, que no fija el sistema operativo |
| D-02 | E2 usó **Dia** (navegador basado en Chromium), no Safari | Sección 3 | **Safari en macOS queda sin validar.** No afecta el tiempo de CA-20; la Parte B de E2 no cuenta como evidencia de Safari |
| D-03 | E3 usó **iPad (iPadOS)**, no iPhone | Sección 3 | Safari sobre WebKit en tableta, no en teléfono. La pantalla del iPad es mayor que la del iPhone: el tiempo de E3 puede ser menor que el que tendría en un iPhone |
| D-04 | **Grabación de E2 cortada:** empieza cuando E2 ya está en su panel con sesión; no se ven la pantalla de registro ni "Crear mi cuenta". Causa declarada: problemas con la captura de pantalla | Secciones 7 y 8 | **E2 queda pendiente** (sección 4.2) |
| D-05 | La consulta de tiempos se ejecutó **después de la Parte B** para E2 y E3 | Sección 7 | Por regla, no se usan sus columnas de primer pago ni de último acceso. En E3, el primer pago vigente es posterior al primer plan (−1135 s), porque la Parte B borra y vuelve a crear pagos. El intervalo creación → primer plan no se altera: coincide con la grabación de E3 (diferencia de 1 s) |
| D-06 | Las sesiones ocurrieron del 21/10/2026 a las 23:57 al 22/10/2026 a las 01:06, en el orden **E3, E1 y E2** (no E1, E2 y E3), y entre las cuentas de E1 y E2 hubo **13 min 52 s**, menos de los 15 min propuestos. Entre E3 y E1 hubo unos 51 min | Sección 13 | Ninguno observado: no hubo 429. Dos sesiones pasaron al 22/10: el resultado esperado se recalculó con referencia 22/10/2026 (`docs/validacion/2026-10-22-perfiles-esperados.txt`); cambia P2, y P1 y P3 son idénticos al 21/10 |
| D-07 | **Cierre con concesión del cliente**, decisión que no está en la tabla de la sección 14 y que se tomó después de conocer los resultados | Sección 14 | El acta se firma sin evidencia completa de CA-20. Se declara aquí y en el acta; no cambia ningún resultado |
| D-08 | **Las horas anotadas por E2 no coinciden con la base de datos:** anotó de 00:06 a 00:09, y su cuenta se creó a las 01:01:44 y su primer plan a las 01:06:20, unos 55 min después. No coinciden ni la hora absoluta ni la duración (sección 4.2) | Secciones 7 (fuente 3) y anexo A | Ninguno sobre el resultado: las horas anotadas son respaldo y no deciden. Resta confianza a lo que E2 anotó de memoria y refuerza que su tiempo no se complete con esa fuente. Las sesiones se fechan con la base de datos (sección 2) |

## 4. CA-20 y OBJ-02: del registro al primer plan

### 4.1 Resultados por evaluador

Salida del script (22/10/2026). Fuente principal: la grabación; la base de datos es una cota
inferior (protocolo, sección 7).

| Evaluador | Perfil | Total (grabación) | Formulario | Correo | Captura | Generación | Cota inferior BD | Grabación − BD | Anotado | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| E1 | P1 | **2 min 49 s** | 15 s | 25 s | 2 min 8 s | 1 s | 2 min 33 s | 1 s | 3 min | **cumple** |
| E2 | P2 | pendiente | pendiente | pendiente | pendiente | pendiente | 4 min 36 s | — | 3 min | **pendiente** |
| E3 | P3 | **3 min 42 s** | 27 s | 25 s | 2 min 49 s | 1 s | 3 min 14 s | 1 s | 5 min | **cumple** |

- **CA-20: pendiente**, con 2 de 3 válidos que cumplen; se requieren 3 de 3.
- **OBJ-02:** pendiente, por la misma medición.
- **Mediana descriptiva** de los tiempos totales disponibles: 3 min 15.5 s. No decide el criterio.
- **Contraste:** en E1 y E3, la grabación y la base de datos difieren 1 s, muy por debajo de los
  60 s de tolerancia.
- **El tramo más largo** en los dos es la captura de datos: 76 % del tiempo en E1 y en E3.

### 4.2 E2: por qué queda pendiente y qué muestra la evidencia disponible

**Regla aplicada (protocolo, sección 7):** con la grabación cortada, el resultado es pendiente,
salvo que la cota inferior de la base de datos supere 8 minutos; **nunca se completa** con horas
anotadas ni estimaciones. La cota de E2 es de 276 s, menor de 480 s: **pendiente**.

**Evidencia indirecta**, que no cambia el resultado y que se informa para sustentar la concesión:

| Dato | Valor | Fuente |
|---|---|---|
| De la creación de la cuenta ("Crear mi cuenta") al primer plan | 276 s | Base de datos |
| Creación → confirmación del correo | 17 s | Base de datos |
| Confirmación → primer pago | 225 s. Incluye el inicio de sesión manual (el enlace abrió la sesión en otro navegador; protocolo, sección 9) | Base de datos; hoja de registro |
| De vuelta en el panel → plan visible | 53 s | Grabación (parte disponible) |
| Margen restante hasta 8 min | **204 s** para el tramo no grabado (pantalla de registro visible → "Crear mi cuenta") | Cálculo: 480 − 276 |
| El mismo tramo en los otros evaluadores | 15 s (E1) y 27 s (E3) | Grabaciones |

- **Lectura:** E2 habría superado los 8 minutos solo si el formulario de registro le hubiera tomado
  más de 3 min 24 s, de 7 a 13 veces lo que tomó a E1 y a E3. **No está demostrado**: es una
  inferencia, no una medición.
- **Horas anotadas de E2** (00:06 a 00:09): son incompatibles con la base de datos en dos sentidos
  (D-08):
  - **Hora absoluta:** la cuenta se creó a las 01:01:44 y el primer plan se generó a las 01:06:20,
    unos 55 min después de lo anotado.
  - **Duración:** la anotación da como máximo 3 min 59 s, y la base de datos registra 4 min 36 s solo
    desde la creación de la cuenta.

  Se registra como observación; las horas anotadas son respaldo y no deciden. Por eso tampoco se
  usan para estimar el tramo no grabado.

### 4.3 Comparación con el resultado esperado

| Evaluador | Primer plan observado | Esperado (motor real) | ¿Coincide? |
|---|---|---|---|
| E1 | 14 semanas (19/10/2026 a 20/01/2027); semana 1: aparta 839.17 | Igual (referencia 21 y 22/10) | Sí |
| E2 | 13 semanas (22/10/2026 a 16/01/2027); semana 1: aparta 3,600.00 | Igual (referencia 22/10) | Sí |
| E3 | 8 semanas (18/10 a 11/12/2026) | 9 semanas (18/10 a 18/12/2026) | **No** |

- **E3 cometió dos errores de captura, sin defecto de la aplicación:**
  - **La renta:** la capturó con fecha límite **11/11/2026** en lugar de 18/11/2026, según
    confirmó STK-01 en el video. Su segunda ocurrencia cae el 11/12, donde termina el horizonte de
    8 semanas.
  - **La meta:** la capturó como **2,500.00** en lugar de 25,000.00, y la aplicación la muestra
    alcanzable; con 25,000.00 no lo sería.
- **Efecto sobre CA-20:** ninguno. El criterio mide el tiempo; el protocolo no exige que la captura
  sea exacta, y la meta se captura después del primer plan.
- **Observación de usabilidad:** es el error de escritura en pantalla táctil que la sección 4 del
  protocolo anticipaba. Se propone como mejora futura que la aplicación confirme las fechas y los
  montos atípicos (sección 7, O-05).
- **Evidencia:** las capturas de los planes guardados están en la evidencia privada (contienen
  datos personales).

## 5. OBJ-05: claridad y accionabilidad

| Evaluador | Claridad | Accionabilidad | Resultado |
|---|---|---|---|
| E1 | 4 | 4 | cumple |
| E2 | 5 | 5 | cumple |
| E3 | 5 | 5 | cumple |

**OBJ-05: cumple.** Cada evaluador por separado y cada pregunta por separado, sin promediar, con
4 o más (protocolo, sección 12).

- **Comentarios, en resumen:** E2 escribió "todo bien"; E3 la considera una herramienta sencilla y
  no tuvo inconvenientes; E1 no comentó.
- **Sesgo declarado (RSG-03):** los evaluadores conocen al autor. Las calificaciones pueden estar
  inflando la percepción; los tiempos de la sección 4 no dependen de la opinión.

## 6. Parte B: guion de humo de CA-23 (evidencia adicional de RNF-07)

| Evaluador | Plataforma | Pasos correctos | Fallos | ¿Cuenta como Safari? |
|---|---|---|---|---|
| E2 | macOS Golden Gate 27.0, Dia 1.53.0 | 11 de 11 | Ninguno | **No** (D-02) |
| E3 | iPadOS 18.7.8, Safari 18.7.8 | 11 de 11 | Ninguno | Sí, en iPadOS |

- **Conclusión:** el guion de humo funciona en **Safari 18.7.8 sobre iPadOS**.
- **Safari en macOS sigue sin evidencia.**
- **CA-23 no cambia:** sigue "en parte", porque esta parte es evidencia adicional y no modifica el
  texto del criterio (protocolo, sección 1).

## 7. Parte 0: revisión de requisitos por los evaluadores (2.4, retroactiva)

| # | Observación | Evaluador | Tipo | Tratamiento propuesto |
|---|---|---|---|---|
| O-01 | Ingresos recurrentes e irregulares (fin de semana, dos o tres días de trabajo) | E1 | Funcionalidad nueva | Candidata a solicitud de cambio en una versión futura. Hoy solo hay un presupuesto semanal y un ingreso extra puntual |
| O-02 | Pagos semanales | E1 | Funcionalidad nueva | Candidata a solicitud de cambio. La periodicidad de los pagos hoy es en meses |
| O-03 | Aplicación móvil | E2 y E3 | Fuera de alcance | Fuera del alcance del proyecto (aplicación web adaptable). Se registra como necesidad |
| O-04 | Notificaciones o recordatorios | E3 | Funcionalidad nueva | Candidata a solicitud de cambio en una versión futura |
| O-05 | "No entiendo qué es un 'huevo de Pascua'" (requisito 14 de la lista de la Parte 0; RF-14) | E3 | Redacción de un requisito | Aclarar el término en la redacción para usuarios: "secuencia oculta que muestra los créditos del proyecto" (`docs/huevo-de-pascua.md`). Además, el error de captura de E3 (sección 4.3) sugiere confirmar fechas y montos atípicos |

- **E1 y E2** dicen que todo se entiende.
- **Ninguna observación es un defecto** de v1.1.0 ni se implementa en esta fase: la versión está
  congelada.
- **Quedan registradas** para el mantenimiento (`docs/mantenimiento.md`) como posibles solicitudes
  de cambio.

## 8. Decisión y concesión

| Condición de "aceptado" (protocolo, sección 14) | Estado |
|---|---|
| CA-20: 3 de 3 evaluadores válidos en 8 minutos o menos, sin ayuda | **No demostrada:** 2 de 3; E2 pendiente |
| OBJ-05: los tres con 4 o más en las dos preguntas | Cumplida |
| Sin defectos bloqueantes ni mayores abiertos | Cumplida: 0 incidencias abiertas (API pública de GitHub, `GET /repos/abdideev/ahorrito/issues?state=open`, 22/10/2026); las sesiones no reportaron defectos |

**Según el protocolo,** la decisión sería **"decisión aplazada"** hasta completar la evidencia con un
sustituto, o "no aceptado" si se declara CA-20 no cumplido.

**Concesión.** STK-01, como cliente y responsable del proyecto, decidió el 22/10/2026 a las 02:40:

- cerrar la validación **sin sustituto para E2**, por falta de tiempo antes de la entrega;
- **aceptar el riesgo** de que CA-20 y OBJ-02 no queden demostrados para E2, con la evidencia
  indirecta de la sección 4.2;
- informar los resultados **sin modificarlos**: CA-20 sigue "2 de 3 demostrados, E2 pendiente".

**Decisión registrada: aceptado con concesión**, con las observaciones de las secciones 3, 6 y 7.

**Cómo se levanta la concesión:** con un sustituto sin experiencia previa, en Mac con Safari, con P2
y grabación desde la pantalla de registro. Eso cerraría también D-02. Es trabajo pendiente fuera de
este cierre.

## 9. Limitaciones

1. **Tamaño de la muestra:** n = 3 (RSG-02), y en la práctica **2** tiempos completos.
2. **Una sola persona por combinación,** y las combinaciones no fueron las previstas (D-01 a D-03).
3. **Sin observador:** las dificultades que no se ven en pantalla solo se conocen si el evaluador
   las anota.
4. **Perfil de los evaluadores:** los tres cursan la misma carrera y conocen al autor (RSG-03).
5. **La Parte 0 va antes de la medición:** los tres leyeron los requisitos antes de usar la
   aplicación, lo que puede reducir el tiempo de captura (protocolo, sección 6).

## 10. Correspondencia con la lista de verificación

| Punto | Evidencia |
|---|---|
| 7.1 Plan de validación | Protocolo 1.2, aprobado antes de las sesiones |
| 7.2 Usuarios representativos | Tres estudiantes sin experiencia previa (sección 2) |
| 7.3 Ejecución | Sesiones del 21 y 22/10/2026; registro anonimizado |
| 7.4 Comprobación de las necesidades | OBJ-05 cumple; CA-20 y OBJ-02, 2 de 3, con concesión |
| 7.5 Observaciones y hallazgos | Secciones 3, 4.3, 6 y 7 |
| 7.6 Aceptación | Acta en `docs/validacion/acta-de-aceptacion.md`, aceptado con concesión |

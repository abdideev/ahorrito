# Acta de aceptación de Ahorrito

| Campo | Valor |
|---|---|
| Sistema | Ahorrito **v1.1.0** (commit `4d14004`), https://ahorrito-nine.vercel.app |
| Fecha de redacción | 22/10/2026 |
| Base | Informe de validación (`docs/informe-de-validacion.md`, versión 1.0) y protocolo de validación 1.2 |
| Sesiones | E3: 21/10/2026, 23:56 · E2: 22/10/2026, 00:06 · E1: 22/10/2026, 00:47 |

> **Versión del repositorio.** Los evaluadores aparecen como E1, E2 y E3. Los tres aceptaron que su
> nombre figure en el acta; los nombres solo se escriben en la copia firmada, que se guarda fuera
> del repositorio, en `C:\evidencia-validacion` (protocolo, sección 15).

## 1. Resultados

| Criterio | Resultado |
|---|---|
| CA-20 / OBJ-02 · del registro al primer plan en 8 min o menos, 3 de 3 | **2 de 3 demostrados:** E1, 2 min 49 s; E3, 3 min 42 s. **E2: pendiente** por grabación incompleta (cota inferior en la base de datos: 4 min 36 s) |
| OBJ-05 · claridad y accionabilidad, 4 o más | **Cumple:** E1 4 y 4; E2 5 y 5; E3 5 y 5 |
| Parte B · guion de humo de CA-23 | 11 de 11 en E2 (Dia, macOS) y en E3 (Safari, iPadOS). Safari en macOS sin validar |
| Defectos bloqueantes o mayores abiertos | Ninguno (informe, sección 8) |

## 2. Decisión

**ACEPTADO CON CONCESIÓN DEL CLIENTE.**

- **Qué dice el protocolo:** con un resultado pendiente, la sección 14 prevé "decisión aplazada".
- **Qué decide el cliente:** STK-01 acepta el sistema sin sustituto para E2, el 22/10/2026 a las
  02:40, y asume el riesgo de que CA-20 y OBJ-02 no queden demostrados para ese evaluador. La
  evidencia indirecta está en el informe, sección 4.2.
- **Cómo se registra:** como desviación D-07 del protocolo, tomada después de conocer los
  resultados. Ningún resultado se modificó.

## 3. Observaciones que acompañan la aceptación

1. **Dispositivos distintos de los previstos:**
   - E1, Fedora Linux con Firefox, en lugar de Windows;
   - E2, Dia en lugar de Safari;
   - E3, iPad en lugar de iPhone.

   **Safari en macOS queda sin validar.**
2. **Errores de captura de E3:** la renta con fecha 11/11/2026 y la meta de 2,500.00. No son un
   defecto de la aplicación; se propone confirmar fechas y montos atípicos en una versión futura.
3. **Necesidades expresadas en la Parte 0**, candidatas a solicitud de cambio, sin implementarse en
   v1.1.0:
   - ingresos recurrentes;
   - pagos semanales;
   - recordatorios;
   - aplicación móvil (fuera de alcance);
   - aclarar el término "huevo de Pascua".
4. **Cómo se levanta la concesión:** con un sustituto para E2, sin experiencia previa, en Mac con
   Safari, con P2 y grabación completa.

## 4. Participantes

| Código | Perfil | Dispositivo | Nombre en acta |
|---|---|---|---|
| E1 | P1 | Fedora Linux 44, Firefox 158.0 | Sí (solo en la copia firmada) |
| E2 | P2 | macOS Golden Gate 27.0, Dia 1.53.0 | Sí (solo en la copia firmada) |
| E3 | P3 | iPadOS 18.7.8, Safari 18.7.8 | Sí (solo en la copia firmada) |

## 5. Firma

| Rol | Nombre | Decisión | Firma | Fecha |
|---|---|---|---|---|
| Líder del proyecto y cliente (STK-01) | Abdiel Avila Neri | Aceptado con concesión | Pendiente | Pendiente |

## 6. Nota posterior a la firma (22/10/2026)

Esta nota se agrega después de la firma y no modifica el texto firmado de las secciones 1 a 5.

1. **Firma.** STK-01 firmó el acta el 22/10/2026. La copia firmada, que incluye los nombres de los
   evaluadores, se guarda fuera del repositorio, en `C:\evidencia-validacion` (protocolo, sección
   15). Por eso la tabla de la sección 5 de esta versión del repositorio dice "Pendiente".
2. **Horas de las sesiones.** La línea "Sesiones" del encabezado toma las horas que anotaron los
   evaluadores. Según la revisión del 22/10/2026, las sesiones se fechan con la base de datos
   (informe de validación 1.2, sección 2):

   | Orden | Evaluador | Cuenta creada |
   |---|---|---|
   | 1 | E3 | 21/10/2026, 23:57 |
   | 2 | E1 | 22/10/2026, 00:47 |
   | 3 | E2 | 22/10/2026, 01:01 |

   La hora anotada por E2 (00:06) no coincide con la base de datos y se declara como desviación
   D-08.
3. **Efecto.** Ninguno sobre los resultados de la sección 1 ni sobre la decisión de la sección 2.

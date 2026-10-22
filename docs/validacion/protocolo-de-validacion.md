# Protocolo de validación de Ahorrito

| Campo | Valor |
|---|---|
| Versión del protocolo | **1.2**: cambio de la ubicación de la evidencia privada, decidido y aprobado por STK-01 el 21/10/2026 a las 03:43, antes de cualquier sesión |
| Redactado | 20/10/2026 (1.0); corregido el 21/10/2026 (1.1) |
| Aprobación | 1.0 aprobada por STK-01 el 20/10/2026; 1.1 aprobada por STK-01 el 21/10/2026, registrada a las 02:40 (sección 17), antes de enviar cualquier instrucción a los evaluadores |
| Proceso de la norma | Validación (lista de verificación, puntos 7.1 a 7.6) y revisión de requisitos con los interesados (2.4, retroactiva) |
| Documentos relacionados | Hoja de datos (`hoja-de-datos-2026-10-20.md`), instrucciones (`instrucciones-evaluadores.md`), consulta de tiempos (`consulta-tiempos.sql`), plan de pruebas (`docs/plan-de-pruebas.md`, secciones 6.2 y 7.1) |

### Historial de versiones del protocolo

| Versión | Fecha y hora | Cambios | Estado |
|---|---|---|---|
| 1.0 | 20/10/2026. Redactada después de las 18:19 (salida del script de perfiles) y antes de las 18:23 (última escritura de la hoja de datos). La aprobación se registró en el archivo a las 23:38 | Versión inicial | Aprobada por STK-01 el 20/10/2026 |
| 1.1 | 21/10/2026, 02:34 (última escritura de los cuatro documentos) | **Corregida por revisión antes de cualquier sesión** (ningún evaluador recibió instrucciones ni abrió la aplicación). Cinco correcciones de STK-01: (1) en la Parte B, E3 borra también el ingreso extra y la meta, que impedían el cuadre (verificado con el motor); (2) la consulta de tiempos se ejecuta después de la Parte A y antes del mensaje 3 (sección 7 y anexo A); (3) nueva redacción de la pregunta de experiencia previa (sección 6); (4) grabación en Windows 10 e iPhone con botón de inicio (instrucciones); (5) consentimiento de participación y "nombre en acta" (sección 15). Además: las sesiones programadas para el 20/10/2026 no se realizaron ese día, y se corrige la programación (sección 13), no el registro; se recalculó el resultado esperado con referencia 21/10/2026 (idéntico al del 20/10) y se declara su validez (sección 5) | Aprobada por STK-01 el 21/10/2026, registrada a las 02:40 |
| 1.2 | 21/10/2026, 03:43 | La evidencia privada (videos, capturas sin recortar y correspondencia) se guarda en `C:\evidencia-validacion`, fuera del repositorio y fuera de OneDrive, en lugar de una carpeta del escritorio, que se sincronizaba con la nube (sección 15). Se ajustan el mensaje 1 y el paso 8 de la Parte A, y el plan de retiro. La 1.1 se fusionó en el pull request #45 (21/10/2026, 03:07) y ningún evaluador había recibido instrucciones | Decidido y aprobado por STK-01 el 21/10/2026, 03:43 |

---

## 1. Objetivo

Demostrar con usuarios representativos que Ahorrito satisface las necesidades y el uso previsto.
Esta fase **no repite la verificación**.

| Criterio | Texto vigente (documento maestro) | Qué se mide aquí |
|---|---|---|
| **OBJ-02** (NEC-06) | "Un usuario sin experiencia previa obtiene su primer plan en 8 minutos o menos, medido con los tres evaluadores." | Tiempo del registro al primer plan |
| **CA-20** (RNF-02) | "3 de 3 usuarios sin experiencia previa pasan del registro al primer plan en 8 min o menos, con los perfiles P1 a P3." | El mismo tiempo, con un perfil distinto por evaluador |
| **OBJ-05** (NEC-05, NEC-07) | "Cada uno de los tres evaluadores otorga una calificación igual o mayor a 4, en escala de 1 a 5, en claridad y en accionabilidad evaluadas por separado y sin promediar entre evaluadores." | Dos preguntas de escala (sección 12) |

**Además, y sin cambiar ningún criterio:**

- **Parte 0:** revisión de requisitos por los evaluadores. Es la revisión del punto 2.4 que no se
  hizo en agosto; se declara como retroactiva.
- **Parte B:** el guion de humo de CA-23 en Safari, en macOS e iOS. Se registra como evidencia
  adicional de RNF-07 y **no modifica el texto de CA-23**; cambiarlo exigiría una solicitud de
  cambio.

## 2. Versión bajo validación

| Campo | Valor |
|---|---|
| Versión | **v1.1.0**, commit `4d14004`, **congelada** durante toda la fase |
| URL | https://ahorrito-nine.vercel.app (producción, Vercel) |
| Base de datos | Proyecto de Supabase de producción, el mismo de las fases anteriores |
| Comprobación del 20/10/2026, 18:13 a 18:15 | HTTP 200; botón "Mostrar contraseña" presente (función de v1.1.0); Supabase `auth/v1/health` 200; clave de Gemini válida y una solicitud mínima con 200; prueba de humo E2E-04 contra producción en 1 de 1 (20.4 s) |

**Congelamiento.** Cualquier cambio a la aplicación durante la fase exige una solicitud de cambio
registrada y autorizada **antes** de programarlo, con su efecto declarado sobre CA-20 y OBJ-05. Un
cambio entre dos sesiones invalida la comparación entre evaluadores.

## 3. Participantes y dispositivos

Las sesiones son **autoadministradas**: no hay moderador ni observador. Cada evaluador sigue las
instrucciones por su cuenta y envía su evidencia.

| Evaluador | Dispositivo (uno solo, el mismo toda la sesión) | Navegador | Se registra | Perfil |
|---|---|---|---|---|
| **E1** | Computadora con Windows | El que use habitualmente | Navegador y su versión; versión de Windows | **P1** |
| **E2** | Mac | Safari | Versión de macOS y de Safari | **P2** |
| **E3** | iPhone | Safari | Versión de iOS | **P3** |

- **Quiénes son:** estudiantes de la misma carrera (STK-04).
- **Identificación:** en el repositorio y en todo documento solo aparecen como E1, E2 y E3
  (sección 15).
- **Cuentas:** cada uno crea la suya y la confirma con su propio correo.

## 4. Asignación de perfiles

Queda fijada **antes** de las sesiones y **no se reasigna** después de ver los resultados.

| Perfil | Datos que captura antes del primer plan | Campos | Dispositivo asignado |
|---|---|---|---|
| **P1** · Ingreso muy ajustado | Presupuesto (monto y día) y **4 pagos** de 4 campos cada uno | 18 | **E1**, Windows |
| **P2** · Vencimiento grande a corto plazo | Presupuesto y **3 pagos** | 14 | **E2**, Mac |
| **P3** · Meta poco realista | Presupuesto y **2 pagos**. El ingreso extra y la meta son opcionales y se capturan **después** del primer plan | 10 | **E3**, iPhone |

**Justificación:**

1. **El esfuerzo de captura va en sentido inverso a la velocidad de escritura del dispositivo.** El
   teclado físico de Windows es el más rápido; el del Mac, también físico, va después, pero el
   evaluador quizá no lo use a diario; la pantalla del iPhone es la más lenta y la que más errores
   de escritura produce. Así, el tiempo de cada evaluador refleja el uso previsto de su perfil, y
   no la suma de la peor captura con el peor dispositivo.
2. **P3 es el único perfil con datos opcionales.** En el iPhone, el más expuesto a pasarse de los
   8 minutos, esos datos se capturan después del primer plan y quedan fuera del tiempo. Es la
   resolución del conflicto 3 de la sección 2.9.

**Consecuencia que se declara:** la combinación más exigente, P1 en el iPhone, **no se mide**. Si
el iPhone hubiera recibido P1, un fallo de CA-20 no permitiría separar el efecto del dispositivo
del efecto del perfil.

## 5. Datos del día

Los perfiles del plan de pruebas se calcularon con fecha de referencia 05/10/2026, y varios
vencimientos ya pasaron.

- **Datos de hoy:** `hoja-de-datos-2026-10-20.md`, con **todas las fechas desplazadas +15 días** y
  la fecha de referencia **20/10/2026**. El resultado esperado se recalculó con el motor real:
  `docs/validacion/scripts/perfiles-validacion.sim.ts`, salida en `2026-10-20-perfiles-esperados.txt`.
- **Por qué +15:** es exactamente la distancia entre la referencia original (05/10) y la de hoy
  (20/10), así que cada vencimiento conserva su distancia a la fecha de referencia. Todas las
  fechas quedan después del 20/10/2026. El día de la semana sí cambia (05/10 fue lunes y el 20/10
  es martes), por lo que las semanas señaladas pueden diferir de las del plan de pruebas. Por eso
  se recalculó.
- **Validez del resultado esperado.** Con referencia 21/10/2026, el resultado es **idéntico** al
  del 20/10 (`2026-10-21-perfiles-esperados.txt`). Desde el 22/10 **cambia P2**, porque su semana
  empieza en jueves (13 semanas y otras semanas señaladas; se comprobó del 22 al 25/10). Por eso
  el resultado esperado vale si el plan se genera el **20 o el 21/10/2026**, hora del centro de
  México. Si una sesión ocurre otro día, se registra la fecha y se recalcula con
  `FECHA_REFERENCIA` antes de comparar. Los datos que captura el evaluador no cambian.
- **Cada evaluador recibe solo la hoja de su perfil**, sin el resultado esperado.

## 6. Experiencia previa (criterio de inclusión)

Al **inicio** de su sesión, antes de abrir la aplicación, cada evaluador responde la pregunta de la
Parte A: **"Antes de hoy, ¿habías usado Ahorrito, o visto su código o sus documentos?"**.

- **"Antes de hoy"** es necesario porque la Parte 0, que ya hicieron los tres, consiste en leer
  los requisitos. Esa lectura no debe contar como experiencia previa.
- La declaración previa del responsable no sustituye la del evaluador.

| Situación declarada | Efecto | Justificación |
|---|---|---|
| Usó la aplicación, en producción o en una copia local | **Queda excluido de CA-20** | CA-20 y OBJ-02 piden un usuario "sin experiencia previa". Haber recorrido el registro o la captura reduce el tiempo de aprendizaje, que es justo lo que se mide |
| Participó en su construcción o en sus pruebas | **Queda excluido de CA-20** | Mismo motivo, agravado: conoce el flujo por dentro |
| Leyó documentos, requisitos o código sin usar la aplicación | **No lo excluye.** Se registra y se declara como limitación (RSG-03) | Leer no entrena el uso de la interfaz; sí puede darle vocabulario y expectativas. La Parte 0 de hoy (leer los requisitos) cae en este caso para los tres, y por eso va antes de la medición y sin capturas ni instrucciones de uso |

- **Si un evaluador queda excluido,** su lugar lo ocupa un **sustituto sin experiencia**, con el
  mismo dispositivo y el mismo perfil, porque CA-20 pide 3 de 3.
- **El evaluador excluido** puede terminar la sesión: su tiempo se informa aparte, sin contar para
  CA-20, y sus respuestas de OBJ-05 se conservan como observación.
- **La sustitución se registra con su fecha.** Si no hay sustituto hoy, el resultado de CA-20 queda
  **pendiente**.

## 7. Medición del tiempo, sin moderador

**Inicio:** el momento en que la pantalla de registro (`/registro`) queda visible.

**Fin:** el momento en que aparece el **primer plan** (sección 8).

**Fuentes:**

| Prioridad | Fuente | Qué aporta | Límite |
|---|---|---|---|
| 1 | **Grabación de pantalla** del evaluador, desde que abre el registro hasta que ve su plan | Inicio y fin exactos, y el desglose de los cuatro tramos (sección 8) | Depende de que el evaluador la inicie a tiempo y no la corte |
| 2 | **Marcas de tiempo de la base de datos** (`consulta-tiempos.sql`): creación de la cuenta (`auth.users.created_at`), confirmación del correo (`email_confirmed_at`), primer pago (`compromisos.creado_en`) y primer plan (`planes.generado_en`) | Contraste objetivo, independiente del evaluador | No ve el inicio real: la cuenta se crea al **enviar** el formulario, no al abrirlo. Por eso su intervalo es una **cota inferior** del tiempo total |
| 3 | **Horas anotadas** por el evaluador en la plantilla | Respaldo | Reloj y memoria del evaluador |

**Cuál prevalece y por qué.** Prevalece la grabación: es la única fuente que cubre el inicio y el
fin tal como los define el criterio. La base de datos se usa para contrastar:

- **Se comparan** el intervalo de la grabación entre "Crear mi cuenta" pulsado y el plan visible,
  y el intervalo de la base de datos entre la creación de la cuenta y el primer plan.
- **Si difieren más de 60 s,** se revisa la grabación (cortes, pausas, reloj) y se anota la causa.
- **Si la grabación falta o está cortada:**
  - el resultado del evaluador es **pendiente**;
  - salvo que la cota inferior de la base de datos ya supere los 8 minutos, en cuyo caso es **no
    cumple**;
  - **nunca se completa** con las horas anotadas ni con estimaciones.

**Cuándo se ejecuta la consulta de la base de datos.** Para cada evaluador, **después** de recibir
su evidencia de la Parte A y **antes** de enviarle el mensaje 3 (Parte B).

- **Por qué:** la Parte B borra y vuelve a crear pagos e inicia sesión otra vez, y con eso altera
  `primer_pago` y `ultimo_acceso`.
- **La hora de ejecución** se anota en la hoja de registro (anexo A).
- **Si la consulta se ejecuta después de la Parte B,** sus columnas `primer_pago` y
  `ultimo_acceso` no se usan, y se declara.

**Sin resultados anticipados.** Ningún resultado se escribe antes de la sesión, ni se estima, ni
se completa con valores supuestos. Lo que no tenga evidencia es **pendiente**.

## 8. Regla de CA-20

**Tiempo evaluado:** el **total**, del inicio al fin (sección 7), porque así lo dice el criterio:
"pasan del registro al primer plan".

**Desglose informativo**, que no cambia el resultado:

1. **Formulario de registro:** de `/registro` visible a "Crear mi cuenta" pulsado.
2. **Espera y confirmación del correo:** hasta que el evaluador vuelve a la aplicación con sesión.
3. **Captura de datos:** presupuesto y pagos de su perfil.
4. **Generación:** de "Generar mi plan" pulsado al plan visible.

**Primer plan:** el primero generado con presupuesto y pagos. **Se considera visible** cuando
aparece la sección con el horizonte y la distribución semanal, sin esperar a la explicación de la
inteligencia artificial, que llega después (RNF-01, conflicto 1 de la sección 2.9). En P3, el
ingreso extra y la meta se capturan después y **no entran** en el tiempo.

**El correo de confirmación cuenta dentro del tiempo:**

- Confirmar el correo es un paso obligatorio del primer uso (RF-01, CA-01). Excluirlo mediría un
  flujo que ningún usuario real recorre.
- **El riesgo:** el correo puede llegar a la carpeta de spam. Ocurrió en CA-01 en producción
  (`docs/verificacion/2026-10-04-produccion.md`).
- **Para no medir la mala suerte del filtro de spam,** las instrucciones dicen a los tres, por
  igual y antes de empezar, que revisen spam si el correo no llega en un minuto. Es parte de las
  instrucciones, no una ayuda externa.
- **Si el correo no llega en 10 minutos:** el intento se registra como **no cumple por
  infraestructura**, con la causa, y el evaluador puede repetir con una cuenta nueva. El reintento
  se informa aparte y CA-20 se evalúa sobre el primer intento.

## 9. Confirmación del correo en iPhone y en Mac

- **La limitación:** el enlace de confirmación abre la sesión **solo en el mismo navegador** donde
  se hizo el registro (flujo PKCE; `src/app/(auth)/confirmar/route.ts`; documento maestro, 6.10).
- **Qué ve el evaluador si el enlace se abre en otro navegador:**
  - la pantalla de inicio de sesión dice "No pudimos abrir tu sesión desde el enlace. Si lo
    abriste en otro navegador, tu correo pudo quedar confirmado: inicia sesión con tu contraseña.";
  - el correo **sí queda confirmado**.
- **Riesgo en el iPhone:** la aplicación de correo puede abrir el enlace en su navegador interno, y
  no en Safari. [SUPUESTO: depende de la aplicación de correo; Mail suele abrir Safari y otras
  aplicaciones usan un navegador interno.] El Mac tiene el mismo riesgo si el correo se lee en una
  aplicación distinta de Safari.
- **Qué hace el evaluador, sin ayuda** (está en las instrucciones): volver a Safari, abrir la
  dirección de Ahorrito, pulsar "Iniciar sesión" y entrar con su correo y su contraseña.
- **Ese tiempo cuenta** dentro del total.
- **Riesgo declarado antes de las sesiones:** este paso añade de uno a dos minutos [SUPUESTO] y
  puede llevar a **E3** por encima de los 8 minutos. Si ocurre, se informa como causa conocida, no
  como hallazgo imprevisto, y se anota en el desglose (tramo 2).

## 10. Ayuda externa

- El evaluador **no pide ayuda** durante la parte medida (Parte A).
- **Si se traba, o alguien lo ayuda,** anota la hora y qué pasó. Ese intento se marca **"con
  ayuda"** y **no cuenta como cumplido** para CA-20, aunque el tiempo sea menor de 8 minutos.
- Leer las instrucciones y la hoja de datos **no es ayuda**.

## 11. Cuota de Gemini (respuesta 429)

- **Si la explicación no aparece** ("La explicación no está disponible en este momento"), el
  evaluador espera **2 minutos**, pulsa **"Recalcular y explicar" una sola vez** y lo anota.
- **El intento no se descarta:** el primer plan ya se midió y la explicación no forma parte del
  tiempo de CA-20.
- **Si tampoco aparece en el segundo intento,** el evaluador califica OBJ-05 con lo que ve y lo
  anota. La falta de explicación se informa como observación de RSG-01.

## 12. OBJ-05: preguntas de calificación

Se responden **después** de ver el plan y leer la explicación, y antes de enviar la evidencia.

> **Pregunta 1 · Claridad.** Pensando en el plan que te mostró Ahorrito, ¿qué tan fácil fue
> entender cuánto debes apartar cada semana y por qué? Escribe un número del 1 al 5, donde 1 es
> "no lo entendí" y 5 es "lo entendí por completo".
>
> **Pregunta 2 · Accionabilidad.** ¿Qué tan claro te quedó qué hacer con tu dinero a partir de este
> plan, por ejemplo cuánto apartar esta semana o qué ajustar? Escribe un número del 1 al 5, donde
> 1 es "no sabría qué hacer" y 5 es "sé exactamente qué hacer".
>
> **Comentarios (opcional).** ¿Qué te pareció confuso, qué te sobró o qué te faltó?

**Cómo se evalúa:**

- Cada evaluador por separado y cada pregunta por separado.
- **Sin promediar** entre evaluadores ni entre preguntas.
- Umbral: **4 o más en las dos**, para los tres.

## 13. Franjas de ejecución

- **Por qué escalonar:** sesiones simultáneas pueden agotar la cuota por minuto de Gemini (6 de 20
  solicitudes recibieron 429 en una ráfaga de menos de un minuto el 04/10/2026).
- **Propuesta:** iniciar con **al menos 15 minutos de separación**.

| Evaluador | Franja |
|---|---|
| E1 | Programada para el 21/10/2026, sin hora fija |
| E2 | Programada para el 21/10/2026, 15 minutos o más después del inicio de E1 |
| E3 | Programada para el 21/10/2026, 15 minutos o más después del inicio de E2 |

La hora real de cada sesión se registra cuando ocurre: la toma de la grabación, de la base de datos
y de lo que comunica el evaluador. No se escribe por adelantado.

**Corrección de la programación (21/10/2026):** las sesiones estaban programadas para el
20/10/2026 y **no se realizaron ese día**; ningún evaluador recibió instrucciones. Se reprograman
para el 21/10/2026 (decisión de STK-01, registrada a las 02:40), fecha en la que vale el resultado
esperado de la sección 5. Si alguna pasa al 22/10 o después, se recalcula.

- **Antes de cada franja,** el responsable comprueba que Supabase está activo: abre la URL y ve la
  portada.
- **Si una sesión se mueve,** se corrige esta programación; nunca el registro de lo ocurrido.

## 14. Criterio de decisión del acta de aceptación

| Decisión | Condición |
|---|---|
| **Aceptado** | CA-20: 3 de 3 evaluadores válidos (sección 6) en 8 minutos o menos, sin ayuda. OBJ-05: los tres con 4 o más en claridad y en accionabilidad. Sin defectos bloqueantes ni mayores abiertos |
| **Aceptado con observaciones** | CA-20 y OBJ-05 se cumplen, pero hay defectos menores o cosméticos abiertos, o limitaciones que se declaran (sección 16), o hallazgos de la Parte 0 o de la Parte B que piden una solicitud de cambio |
| **No aceptado** | CA-20 u OBJ-05 no se cumplen con evidencia completa, o hay un defecto bloqueante o mayor abierto |
| **Decisión aplazada** | Algún resultado es **pendiente** (falta evidencia o falta un sustituto). El acta no se firma hasta completar la evidencia o declarar el criterio no cumplido |

La decisión la firma STK-01. Un "no aceptado" no se convierte en "aceptado" sin una nueva sesión
válida.

## 15. Datos personales y resguardo de la evidencia

- **En el repositorio y en los documentos,** los evaluadores son E1, E2 y E3. **Ningún nombre,
  correo, video ni captura con datos reales** entra al repositorio.
- **Videos, capturas sin recortar y correspondencia** se guardan en **`C:\evidencia-validacion`**,
  en el equipo del responsable: **fuera del repositorio y fuera de OneDrive**, así que no se
  sincronizan con ninguna nube (decisión de STK-01, 21/10/2026, versión 1.2). La carpeta no se
  comparte con nadie. Se guardan hasta la calificación y después se borran según el plan de retiro
  (`docs/retiro.md`).
- **Consulta de tiempos:** usa marcadores (`CORREO_E1`…). Los correos reales se escriben solo en el
  editor del panel de Supabase y **no se guardan**.
- **Lo que sí entra al repositorio:** la hoja de registro anonimizada (anexo A), que el responsable
  llena a partir de la evidencia privada.
- **Consentimiento de participación.** El mensaje 1 termina con el consentimiento (texto en las
  instrucciones): responder implica aceptar participar; lo que envíen se usa solo para esta
  evaluación, se guarda fuera del proyecto y se borra al terminar; pueden retirarse cuando quieran.
  También se les pregunta si aceptan que su nombre aparezca en el acta de aceptación.
- **Registro del consentimiento:** en la hoja de registro se anota **"nombre en acta: sí/no"**,
  **sin el nombre**. Si es "sí", el nombre solo se escribe en el acta firmada, que queda fuera del
  repositorio. Si es "no", el acta lo nombra como E_.
- **Retiro de un evaluador:** su evidencia se borra, su resultado queda **pendiente** y se busca un
  sustituto (sección 6).
- **Contraseñas:** nunca se piden ni se guardan.
- **Cobertura legal:** las cuentas de los evaluadores son cuentas reales de la aplicación, cubiertas
  por el aviso de privacidad que aceptan al registrarse (RF-15).

## 16. Riesgos, contingencias y limitaciones

| Riesgo | Contingencia |
|---|---|
| **RSG-02**, n = 3: los resultados no se generalizan | Se acepta y se declara (sección 16, limitaciones) |
| **RSG-03**, los evaluadores conocen al autor: sesgo hacia calificaciones altas | Preguntas con extremos descritos; comentarios abiertos; los tiempos salen de la grabación y de la base de datos, no de la opinión. El docente tampoco revisó los requisitos (2.4) |
| Correo en spam o que no llega | Instrucción de revisar spam desde el inicio; regla de los 10 minutos (sección 8) |
| Enlace de confirmación en otro navegador | Instrucción de iniciar sesión a mano (sección 9); riesgo para E3 declarado |
| Supabase pausado por inactividad | Comprobación antes de cada franja (sección 13). Si está pausado, se reanuda desde el panel y la sesión se reprograma |
| Cuota de Gemini (429) | Franjas escalonadas y regla de la sección 11 |
| Grabaciones con datos personales (bandeja de correo, notificaciones) | Activar "No molestar" antes de grabar; recortar o enviar por privado; resguardo de la sección 15 |
| Evaluador con experiencia previa | Exclusión y sustituto (sección 6) |
| Cambio de fecha a medianoche | Recalcular el resultado esperado (sección 5) |

**Limitaciones declaradas:**

1. n = 3 (RSG-02).
2. **Cada combinación se prueba una vez y con una sola persona:** Windows con su navegador, macOS
   con Safari e iOS con Safari. No se separa el efecto de la persona del del dispositivo.
3. **Sin observador,** la medición depende de las grabaciones y de la base de datos; las
   dificultades que no se ven en pantalla solo se conocen si el evaluador las anota.
4. **Los tres cursan la misma carrera y pueden conocer la metodología del proyecto.** Su
   desempeño puede ser mejor que el de un estudiante cualquiera.
5. **La asignación de perfiles no mide el peor caso** (P1 en el iPhone; sección 4).
6. **La revisión de requisitos (Parte 0) es retroactiva:** ocurre con el sistema ya construido y
   no pudo cambiar la línea base de agosto.
7. **Las sesiones usan la base de datos de producción,** la misma de las pruebas (plan de pruebas,
   sección 12).

## 17. Aprobación

| Rol | Nombre | Decisión | Fecha |
|---|---|---|---|
| Líder del proyecto y cliente (STK-01) | Abdiel Avila Neri | Aprobado (versión 1.0), con la hoja de datos y las instrucciones que forman parte de él | 20/10/2026 |
| Líder del proyecto y cliente (STK-01) | Abdiel Avila Neri | Aprobado (versión 1.1), con la hoja de datos y las instrucciones 1.1 | 21/10/2026, registrada a las 02:40 |
| Líder del proyecto y cliente (STK-01) | Abdiel Avila Neri | Aprobado (versión 1.2, ubicación de la evidencia) | 21/10/2026, 03:43 |

---

## Anexo A. Hoja de registro anonimizada (una por evaluador)

La llena el responsable a partir de la evidencia privada y es lo único de las sesiones que entra
al repositorio. Los campos sin evidencia se escriben **pendiente**.

```text
Evaluador: E_
Consentimiento: sí/no            Nombre en acta: sí/no   (sin escribir el nombre)
Fecha de la sesión:
Dispositivo / sistema y versión (E1: Windows 10 u 11) / navegador y versión:
Perfil:
"Antes de hoy, ¿habías usado Ahorrito, o visto su código o sus documentos?" (respuesta literal):
¿Excluido de CA-20? (sí/no, motivo):

GRABACIÓN (fuente principal)                     ¿Completa? (sí / cortada / no entregada)
  Registro visible (mm:ss del video):
  "Crear mi cuenta" pulsado:
  De vuelta en la aplicación con sesión:
  "Generar mi plan" pulsado:
  Plan visible:
  Tramos (s): formulario __ / correo __ / captura __ / generación __      TOTAL (s): __
  ¿El correo llegó a spam?:     ¿Inició sesión a mano tras confirmar?:

BASE DE DATOS (contraste; consulta-tiempos.sql)
  Hora de ejecución de la consulta:        ¿Antes de enviar el mensaje 3? (sí/no):
  creación → confirmación (s):   confirmación → primer pago (s):   creación → primer plan (s):

ANOTADO POR EL EVALUADOR
  Hora de inicio:       Hora del plan visible:

¿Recibió ayuda? (hora y descripción):
¿Apareció la explicación? (sí / no / tras recalcular):
OBJ-05   Claridad (1-5):       Accionabilidad (1-5):
Comentarios (resumen sin datos personales):
Parte 0  ¿Falta algo?:         ¿Algo no se entiende?:
Parte B  (solo E2 y E3) pasos correctos de 11:     fallos (paso y descripción):
Resultado CA-20: cumple / no cumple / pendiente / con ayuda / excluido
```

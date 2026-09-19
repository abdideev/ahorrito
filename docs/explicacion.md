# Explicación del plan y orquestación (C-02, C-04)

Contrato del servicio de explicación, de la carga que sale hacia el proveedor de IA y de
`POST /api/planes`. La especificación normativa vive en el documento maestro, secciones
3.3 y 3.7; aquí está lo que el código implementa.

| Dato | Valor |
|---|---|
| Requisitos | RF-10, RNF-03, RNF-10 · RES-03, RES-05, RES-09, RES-10 |
| Interfaces | I-01 `POST /api/planes`, I-03 `src/ports/explicacion.ts`, I-05 API REST de Gemini |
| Componentes | C-02 `src/app/api/planes`, C-04 `src/adapters/ia` |
| Fase | 3, pasos 3.1 a 3.5 |
| Cambios de alcance aplicados | SC-05 (#17): entrada desde el repositorio, respuesta en dos tiempos y `guardarExplicacion` en I-04 |

---

## 1. Contrato del servicio de explicación (I-03)

```ts
interface ServicioExplicacion {
  explicarPlan(plan: Plan): Promise<string | null>;
}
```

| Regla | Motivo |
|---|---|
| Recibe el `Plan` numérico, no la `EntradaPlan` | El plan no tiene denominaciones, nombres ni correos: RNF-10 queda protegido por el tipo |
| Resuelve en texto plano o en `null` | Un plan sin explicación es un estado válido (regla de negocio 5) |
| **La promesa nunca se rechaza** | Cualquier falla del proveedor termina en `null`; el orquestador no puede olvidar un `catch` y romper RNF-03 |

## 2. Carga anonimizada (RNF-10, RES-10)

`construirCarga(plan)` en `src/adapters/ia/carga.ts` es el único punto donde el plan se
convierte en lo que sale del sistema.

| Decisión | Motivo |
|---|---|
| Se construye por **lista blanca**, campo por campo, sin `...` | Un campo que se agregue mañana al dominio no llega al proveedor sin que alguien lo escriba ahí a propósito |
| Los identificadores se sustituyen por etiquetas: "Compromiso 1", "Ingreso 1" | Minimización: un UUID es una clave de la base de datos y no aporta nada a la explicación |
| Importes en pesos como texto exacto (`"600.00"`) | Regla de negocio 4 también en esta frontera; el modelo no ve centavos que podría leer mal por un factor de 100 |
| Las denominaciones nunca llegan al orquestador | `obtenerDatosEntrada` no las lee: el tipo `Compromiso` del motor no tiene ese campo |

Las etiquetas siguen el orden de aparición en el plan, no el orden de registro. Por eso la
interfaz nunca debe mostrar la etiqueta al usuario: muestra la denominación real.

Advertencia del proveedor, verificada el 18 de septiembre de 2026 en ai.google.dev: en la capa
gratuita, Google declara que usa el contenido para mejorar sus productos. La anonimización
no es solo una buena práctica: es lo único que se entrega.

## 3. Adaptador de Gemini (I-05)

`crearServicioGemini` en `src/adapters/ia/gemini.ts`.

| Aspecto | Valor |
|---|---|
| Interfaz | `POST https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent` |
| Modelo por omisión | `gemini-3.5-flash-lite`: estable, con capa gratuita, elegido por latencia. Se cambia con `GEMINI_MODELO` |
| Autenticación | Encabezado `x-goog-api-key`. Nunca en la URL ni en el cuerpo |
| Tiempo límite | 20 s con `AbortSignal.timeout`; cubre también la lectura del cuerpo (sección 3.7.1) |
| Respuesta | JSON estructurado (`responseJsonSchema`) con `resumen`, `advertencias` y `sugerencias` |
| Normalización | Se rechaza lo que no termine en `STOP`; se quitan caracteres de control y se acota la longitud (1 200 caracteres el resumen, 5 elementos de 300 caracteres por lista); se une en texto plano con secciones |
| Solo servidor | `GEMINI_API_KEY` no lleva `NEXT_PUBLIC_`, así que Next.js nunca la incluye en el paquete del navegador (RES-03) |

La instrucción de sistema prohíbe recalcular cifras (RES-05) y recomendar productos
financieros (RES-09), y declara que el JSON del plan es un dato y no una instrucción.

**Registro para CA-11.** Cada solicitud se registra en la salida del servidor con el
prefijo `[ia]`, tal como sale y sin la clave, junto con su resultado (`exito`, `sin-clave`,
`tiempo-agotado`, `error-red`, `error-http`, `respuesta-invalida`) y su duración. En Vercel
queda en los registros de funciones.

## 4. `POST /api/planes` (I-01, modificado por SC-05)

La secuencia sigue la Figura 8. El orquestador (`orquestador.ts`) no importa Next.js y
recibe sus dependencias ya construidas; el Route Handler (`route.ts`) solo adapta HTTP.

1. Verifica la sesión; el proxy ya lo hace, y se repite por defensa en profundidad.
2. Lee la entrada del repositorio con la fecha de hoy en `America/Mexico_City`.
3. Calcula el plan y lo guarda.
4. **Escribe la línea del plan en el flujo antes de pedir la explicación** (RNF-01).
5. Pide la explicación, la guarda con `guardarExplicacion` y escribe la segunda línea.

**Cuerpo:** vacío, o `{"explicar": false}` para omitir la solicitud al modelo (conflicto 4
de la sección 2.9, que usará la regeneración de RF-13). Cualquier otro campo se rechaza.

**Respuesta 200:** `application/x-ndjson`, una línea JSON por evento.

```
{"tipo":"plan","id":"<uuid>","plan":{ ...Plan con importes en centavos... }}
{"tipo":"explicacion","explicacion":"<texto>" | null}
```

Con `explicar: false` solo llega la primera línea.

| Código | Caso |
|---|---|
| 400 | Cuerpo que no es vacío ni `{"explicar": boolean}` |
| 401 | Sin sesión |
| 422 | Falta el presupuesto o no hay compromisos (regla de negocio 6) |
| 503 | La base de datos no respondió: sin base de datos no se genera el plan (sección 3.7.2) |

Si el cliente cierra la conexión antes de la explicación, esta se guarda de todos modos y
aparece al consultar el plan después. Si falla su guardado, el usuario igual la recibe y el
fallo queda registrado.

## 5. Verificación

### Pruebas unitarias

```bash
pnpm test
```

| Archivo | Pruebas | Qué cubre |
|---|---|---|
| `src/adapters/ia/carga.test.ts` | 8 | Conversión, etiquetas y ausencia de datos identificables en un plan contaminado a propósito |
| `src/adapters/ia/gemini.test.ts` | 26 | Clave solo en encabezado, carga enviada, registro, normalización y degradación a `null` |
| `src/app/api/planes/orquestador.test.ts` | 18 | Secuencia, plan antes que explicación, validación del cuerpo y fecha de referencia |
| `src/app/api/planes/degradacion.test.ts` | 9 | CA-09 automatizado y fallos de guardado y de conexión |

Mutaciones comprobadas: agregar un `...` en la carga hace fallar 5 de las 8 pruebas de la
carga; pedir la explicación antes de escribir el plan hace fallar la prueba de orden.

### CA-09 · plan sin servicio de IA (RNF-03)

Ejecutado el 18 de septiembre de 2026 contra `pnpm start`, con el usuario de prueba A
autenticado y la clave cambiada solo en el proceso del servidor.

| Ronda | Clave | Resultado | Registro `[ia]` |
|---|---|---|---|
| 1 | Vacía (deshabilitada) | **5 de 5**: estado 200, plan de 12 semanas con 5 advertencias, `explicacion: null` | `sin-clave` ×5 |
| 2 | Inválida (clave revocada) | **5 de 5**: estado 200, plan completo entre 0.27 y 1.77 s, `explicacion: null` | `error-http` 400 ×5 |

El aviso visible para el usuario lo agrega la interfaz en la Fase 4; CA-09 se vuelve a
verificar con ella en la Fase 5.

### CA-11 · datos identificables en las solicitudes (RNF-10)

Misma fecha, con captura cuyas denominaciones incluían a propósito una institución
financiera, un número de cuenta y nombres propios. Búsqueda en el registro `[ia]`:

| Término | Apariciones |
|---|---|
| `BBVA` | 0 |
| `4152…` (número de cuenta) | 0 |
| `Mariana`, `Abdiel` | 0 |
| `@` | 0 |
| UUID del plan | 0 |

Es la primera evidencia; la Fase 5 la repite sobre el 100 % de las solicitudes registradas.

### Servicio real

Con la clave configurada: plan a los 1.06 s y explicación a los 2.88 s (Gemini respondió
en 1.7 s). Las cifras citadas por el modelo coinciden con las del motor.

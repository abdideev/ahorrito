# Interfaz de usuario (C-01)

Contrato de las pantallas, decisiones de diseño y evidencia de accesibilidad. La
especificación normativa vive en el documento maestro, secciones 3.2 y 3.9; aquí está lo
que el código implementa.

| Dato | Valor |
|---|---|
| Requisitos | RF-02 a RF-06, RF-08, RF-11, RF-12, RF-13, RF-14 · RNF-02, RNF-11 |
| Interfaces | I-01 (`/api/planes`), I-04 (captura y planes), I-07 (sesión) |
| Componente | C-01, `src/app` y `src/components` |
| Fase | 4, pasos 4.1 a 4.7 |
| Cambios de alcance aplicados | SC-02 (#8) huevo de Pascua · SC-06 (#21) operaciones de captura en I-04 |

---

## 1. Pantallas

| Ruta | Protegida | Contenido | Requisitos |
|---|---|---|---|
| `/` | No | Portada con el descargo de responsabilidad | RES-09 |
| `/registro`, `/iniciar-sesion` | No | Alta y acceso | RF-01 |
| `/panel` | Sí | Captura, generación del plan y resultado | RF-02 a RF-06, RF-08, RF-11, RF-13, RF-14 |
| `/planes` | Sí | Historial de planes guardados | RF-12 |
| `/demo` | No | Prototipo del motor, sin sesión ni persistencia | — |

**El panel reúne captura y resultado en una sola pantalla.** Cada navegación adicional suma
tiempo al umbral de ocho minutos que mide RNF-02, así que las cuatro secciones viven juntas:

1. Tu presupuesto (RF-02).
2. Tus pagos con fecha límite (RF-03, RF-04).
3. Tu plan semanal (RF-07, RF-08, RF-10, RF-11, RF-13).
4. Opcional: ingresos extra y meta de ahorro (RF-05, RF-06).

La sección 4 **solo aparece después del primer plan**, o si el usuario ya capturó algo. Es la
regla de negocio 6 expresada en la interfaz: lo opcional no estorba el camino al primer plan.

## 2. Cómo se comunica la interfaz con el servidor

| Operación | Mecanismo | Motivo |
|---|---|---|
| Captura (RF-02 a RF-06) | **Server Actions** en `src/app/(app)/acciones.ts` | Validan en el servidor (sección 3.6.2), funcionan sin JavaScript y no agregan endpoints públicos |
| Generar el plan | `POST /api/planes`, flujo NDJSON leído en el cliente | El plan debe pintarse sin esperar al modelo de lenguaje (RNF-01) |
| Consultar planes | `GET /api/planes` y `GET /api/planes/{id}` | Son operaciones de I-01; consumirlas desde la interfaz las deja verificadas de extremo a extremo |

Las páginas son **Server Components** que leen con el repositorio de la sesión
(`src/lib/supabase/repositorio.ts`). Solo son de cliente los formularios y la vista del plan,
que necesitan estado. Tras cada acción se llama a `revalidatePath`, de modo que la pantalla
muestra lo que está en la base de datos y no una copia que pueda divergir.

## 3. Decisiones de diseño

| Decisión | Motivo | Alternativa descartada |
|---|---|---|
| Los importes usan `type="text"` con `inputMode="decimal"` | Un campo numérico cambia de valor con la rueda del ratón y las flechas; en una cantidad de dinero eso es inaceptable | `type="number"` |
| Las ocurrencias son un desplegable de 1 a 6 | La regla de negocio 2 fija ese rango: con un desplegable el valor inválido no existe en la interfaz | Campo numérico con `min` y `max` |
| La baja pide confirmación en dos pasos, con botones propios | `window.confirm` bloquea el hilo, no se puede estilar y algunos lectores de pantalla lo anuncian mal | `window.confirm` |
| La edición vive en un `<details>` nativo | Se abre con Enter o Espacio, no necesita JavaScript propio y no saca al usuario de la página | Ventana modal, que exige confinar el foco a mano |
| "No encontramos ese pago" para un identificador ajeno o inexistente | La seguridad por fila no distingue ambos casos; distinguirlos revelaría qué identificadores existen (AM-01) | Mensajes distintos |
| Las etiquetas genéricas del modelo se traducen a denominaciones al presentar | El modelo nunca conoce las denominaciones (RNF-10), pero el usuario no debe leer "Compromiso 1" | Enviar la denominación al modelo |
| El etiquetado vive en `src/lib/plan/etiquetas.ts`, compartido con C-04 | Si el adaptador y la interfaz numeraran por separado y los órdenes divergieran, la interfaz atribuiría un pago a otro | Duplicar la numeración en cada lado |

## 4. El plan en pantalla

- **La tabla es una `<table>` real,** con `scope` en los encabezados y `<caption>`. Los datos
  son tabulares y un lector de pantalla necesita los encabezados para anunciar "Semana 3,
  apartar 200" en lugar de números sueltos.
- **Las semanas marcadas llevan texto además de color**: "No alcanza", "Carga alta" o "Al
  día". El color por sí solo no es perceptible para todos.
- **Las advertencias se ordenan por gravedad.** El núcleo emite códigos estructurados; la
  redacción vive en `src/lib/plan/advertencias.ts`, el único lugar que traduce un código a una
  frase en español.
- **El descargo (RF-11)** se coloca encima de las cifras. CA-07 exige que sea visible sin
  desplazamiento: como el panel reúne captura y resultado, al llegar el plan **el foco pasa a
  la sección del resultado**, que lo deja arriba y anuncia al lector de pantalla dónde quedó
  el usuario.
- **Explicación no disponible (RNF-03, CA-09).** Cuando la segunda línea del flujo trae un
  valor nulo, la interfaz muestra: "La explicación no está disponible en este momento. Tu plan
  y sus cifras están completos: solo falta el texto que los acompaña."

## 5. Regeneración (RF-13)

Recalcular rehace las cifras y **no** pide explicación; un botón aparte la solicita de forma
expresa. Es la resolución del conflicto 4 de la sección 2.9: explicar cada recálculo
multiplicaría las llamadas al modelo y agotaría antes la cuota gratuita (RSG-01).

Medición del 29 de septiembre de 2026: **162 ms** al recalcular sin explicación, frente a
**3.5 s** con ella.

## 6. Huevo de Pascua (RF-14, SC-02)

Desde esta fase vive en la vista real del plan y ya no en `/demo`, que lo alojaba de forma
temporal. Existe una sola implementación. La secuencia y su verificación están en
`docs/huevo-de-pascua.md`.

## 7. Accesibilidad (RNF-11)

### Método

El contraste se mide en el navegador sobre la pantalla renderizada, no sobre la paleta de
diseño. Dos advertencias aprendidas al hacerlo:

1. Tailwind 4 entrega los colores en `lab()`, así que leerlos como RGB produce cifras falsas.
2. Al convertirlos con un lienzo hay que **limpiarlo antes de cada color**: si no, un fondo
   transparente devuelve el píxel anterior y todo parece fallar con 1:1.

### Resultado del 29 de septiembre de 2026

| Comprobación | Resultado |
|---|---|
| Contraste, tema oscuro | 119 textos medidos, **mínimo 7.55:1** |
| Contraste, tema claro | 118 textos medidos, **mínimo 7.72:1** |
| Umbral exigido | 4.5:1 en texto normal, 3:1 en texto grande |
| Controles enfocables en el panel | 32, **ninguno con `tabindex` positivo** |
| Foco visible | Regla global `:focus-visible` en `globals.css`, contorno de 2 px |

La regla de foco se define **una sola vez** para que ningún control nuevo quede sin indicador
por olvido, y usa `:focus-visible` y no `:focus` para no dibujar el contorno al hacer clic.

### Atributos que no deben perderse

`aria-invalid` y `aria-describedby` en los campos con error, `aria-live` en el resultado del
plan, `role="alert"` y `role="status"` en los mensajes, `role="note"` en el descargo,
`aria-pressed` en las monedas del huevo de Pascua, y `scope` y `<caption>` en la tabla.

### Pendiente

- El paso 5 de CA-13, con "reducir movimiento" activado en el sistema operativo (Fase 5).
- La medición de RNF-02 con tres usuarios sin experiencia previa (Fase 7).
- CA-12 con herramienta de accesibilidad como verificación formal (Fase 5).

## 8. Verificación

```bash
pnpm test              # 330 pruebas unitarias
pnpm test:integracion  # 21 pruebas contra la base de datos real
pnpm lint
pnpm build
```

Las pruebas unitarias de esta fase cubren la validación de la captura, la redacción de las
advertencias, el etiquetado compartido y la lectura del flujo NDJSON, incluidos los casos de
una línea partida entre dos trozos de red y de un servidor que cierra sin salto final.

Las pruebas de integración verifican las doce operaciones de captura contra la base real y
repiten sobre ellas la comprobación de aislamiento de CA-10: el usuario B no lista, no
modifica ni borra la captura del usuario A.

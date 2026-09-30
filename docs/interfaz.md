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
| Cambios de alcance aplicados | SC-02 (#8) huevo de Pascua · SC-06 (#21) operaciones de captura en I-04 · SC-07 (#25) eliminar planes · SC-08 (#26) Motion y react-icons |

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
| Eliminar un plan (SC-07) | `DELETE /api/planes/{id}` | Misma razón; responde 204, o 404 sin distinguir un plan ajeno de uno inexistente |

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
| Presupuesto y pagos se muestran como resumen y el formulario se abre bajo demanda (`TarjetaEditable`, `FilaCompromiso`) | Se lee el dato guardado sin recorrer formularios; el botón declara `aria-expanded` y `aria-controls`, y el formulario oculto con `hidden` conserva su estado | `<details>` nativo, que obliga a poner el botón pegado a lo que despliega; ventana modal, que exige confinar el foco a mano |
| Las rutas entran y salen con `<ViewTransition>` de React (`TransicionRuta`) | Next 16 lo activa en cada navegación sin dependencias; un desvanecido y 8 px de subida, anulados con "reducir movimiento" | Animar el cambio de ruta con una biblioteca, que en el App Router no ve el desmontaje de la página |
| El historial es lista y detalle | En escritorio la lista paginada (8 por página) queda junto al plan abierto y el más reciente se abre solo; en móvil el detalle sustituye a la lista y "Volver" devuelve el foco a la fila. Cada fila se elimina en dos pasos (SC-07); el foco pasa a la fila siguiente y un `role="status"` anuncia "Plan eliminado" | Tarjetas en rejilla con el detalle debajo, que obligaba a desplazarse más allá de todos los planes |
| El tema viaja en una cookie que lee el layout raíz | El servidor entrega el HTML ya con la clase `dark`: no hay destello del tema contrario. Costo: todas las rutas se renderizan a demanda | Script en línea, que React rechaza al hidratar; `next/script` con `beforeInteractive`, que lo ejecuta después del primer pintado |
| El tema claro es el predeterminado, aunque el sistema prefiera el oscuro | Decisión del cliente (STK-01) para el rediseño Bento | `prefers-color-scheme` |
| Las clases propias viven en `@layer components` | Así las utilidades de Tailwind pueden ajustarlas (`hidden sm:inline-flex`, `w-full`); fuera de toda capa ganarían siempre | CSS sin capa, que provocó el defecto del botón "Crear cuenta" visible en móvil |
| "No encontramos ese pago" para un identificador ajeno o inexistente | La seguridad por fila no distingue ambos casos; distinguirlos revelaría qué identificadores existen (AM-01) | Mensajes distintos |
| Las etiquetas genéricas del modelo se traducen a denominaciones al presentar | El modelo nunca conoce las denominaciones (RNF-10), pero el usuario no debe leer "Compromiso 1" | Enviar la denominación al modelo |
| El etiquetado vive en `src/lib/plan/etiquetas.ts`, compartido con C-04 | Si el adaptador y la interfaz numeraran por separado y los órdenes divergieran, la interfaz atribuiría un pago a otro | Duplicar la numeración en cada lado |

## 3.1 Identidad visual

Rediseño aprobado el 30 de septiembre de 2026 en la rama `feature/rediseno-ui`.

| Elemento | Valor |
|---|---|
| Estilo | Cuadrícula Bento: clase `.bento` de 1 columna en móvil y 6 desde 768 px; cada celda es una `.tarjeta` |
| Fuente | Plus Jakarta Sans, autoalojada con `next/font` |
| Paleta | Primario `#10B981` · Secundario `#09090B` · Terciario `#15803D` · Neutro `#F8FAFC` |
| Botón principal | `#047857` con texto blanco (5.48:1). El primario `#10B981` con texto blanco da 2.54:1: solo se usa como acento o con texto `#09090B` (7.84:1) |
| Temas | Claro predeterminado; oscuro con la clase `dark` en `<html>` |
| Iconos | Conjunto Lucide de react-icons 5.7 (SC-08, #26). `src/components/ui/iconos.tsx` es un adaptador con nombres propios (`IconoCalendario`) y `aria-hidden` en todos |
| Movimiento | Motion 13.4 (SC-08, #26) con `MotionConfig reducedMotion="user"` |

Componentes de Magic UI (MIT), adaptados sin sus dependencias originales (`lucide-react`, `cn`):

| Componente | Uso |
|---|---|
| Interactive Hover Button | "Crear mi plan", envío de los formularios de acceso, "Generar mi plan". Al pasar el cursor solo se desvanece el texto y el círculo expandido queda como fondo (`--punto-interactivo`: `#10B981` en claro, `#FAFAFA` en oscuro, texto `#09090B`) |
| Animated Shiny Text | Rótulos al aparecer y esperas (explicación, historial) |
| Animated Theme Toggler | Selector de tema en la portada, el acceso y la barra autenticada. Omite la transición con "reducir movimiento" y la salta si el navegador no pinta en un segundo |
| Confetti | Diálogo de créditos (SC-02) |

Reparto del movimiento (SC-08):

| Efecto | Dónde | Con qué | Motivo |
|---|---|---|---|
| Entrada escalonada de celdas | Portada, acceso, panel, resultado del plan | CSS (`.aparecer`, 50 ms por `--orden`) | Motion dibuja la celda con `opacity: 0` en el servidor y la revela desde JavaScript; mientras hidrata, o si falla, el panel se vería en blanco. Se detectó en la verificación |
| Elevación al señalar y hundimiento al pulsar | Tarjetas de beneficios, botones animados | Motion (`whileHover`, `whileTap`) | CSS no coordina la escala con la entrada; la entrada usa `translate` y Motion `transform`, así no compiten |
| Despliegue en altura | Formularios de las tarjetas editables, edición de cada pago, confirmación de borrado | Motion (`RegionDesplegable`) | Anima hasta `height: auto`; al plegarse recibe `hidden` y sale del orden de tabulación |
| Salida y reacomodo de filas | Lista de pagos, historial | Motion (`AnimatePresence`, `layout`) | CSS no puede animar un elemento que React ya desmontó |
| Cambio de ruta | Todas las páginas | `<ViewTransition>` de React | El App Router desmonta la página sin avisar a `AnimatePresence` |

Motion agrega un fragmento de **46.4 kB comprimidos** (cota superior, medida sobre la
compilación del 01/10/2026), de 273.8 kB de JavaScript del cliente.

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
  el usuario. El foco se da con `enfocarAlInicio` (`src/components/plan/enfocar.ts`):
  `focus({ preventScroll: true })` y después `scrollIntoView({ block: "start" })`. Con
  `focus()` a secas, Chrome centra un elemento más alto que la ventana y el descargo quedaba
  480 px por encima del borde; se detectó en la revisión del rediseño.
- **La vista del plan es un solo componente,** `VistaPlan`, compartido por el panel y el
  historial. Sus tarjetas resumen la tabla con `src/lib/plan/resumen.ts`, que solo agrega
  cifras del motor; la tabla sigue siendo la fuente accesible completa.
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
| Foco visible | Regla global `:focus-visible` en `globals.css`, contorno de 3 px |

La regla de foco se define **una sola vez** para que ningún control nuevo quede sin indicador
por olvido, y usa `:focus-visible` y no `:focus` para no dibujar el contorno al hacer clic.

### Resultado del 30 de septiembre de 2026, tras el rediseño Bento

| Pantalla | Tema claro | Tema oscuro |
|---|---|---|
| `/`, `/registro`, `/iniciar-sesion` | Mínimo 5.48:1 | Mínimo 5.81:1 |
| `/demo` con plan | 148 textos, mínimo 5.48:1 | 148 textos, mínimo 6.91:1 |
| `/panel` con plan | 297 textos, mínimo 4.79:1 | 297 textos, mínimo 5.81:1 |
| `/planes` con detalle abierto | 423 textos, mínimo 4.79:1 | 423 textos, mínimo 5.81:1 |
| Diálogo de créditos | — | 230 textos, mínimo 5.81:1 |

El mínimo de 4.79:1 corresponde al chip "Al día" (`#15803D` sobre `#F0FDF4`). Ningún texto
queda bajo el umbral. Otras comprobaciones: CA-07 con el descargo a 16 px del borde superior
en el panel y a 80 px en el historial; CA-13 completo solo con teclado (Enter, Tab, Enter; el
diálogo enfoca "Cerrar", Esc lo cierra y el foco vuelve a la moneda); 53 controles
enfocables en el panel y ninguno con `tabindex` positivo; sin desplazamiento horizontal a
375 px.

Advertencia de método: una pestaña que no pinta congela las transiciones CSS, y medir justo
después de cambiar de tema lee los colores del tema anterior (dio un falso 1.12:1). Se mide
tras recargar la página.

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
pnpm test              # 343 pruebas unitarias
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

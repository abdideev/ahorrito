# Juego final de capturas de Ahorrito

| Dato | Valor |
|---|---|
| Versión capturada | `v1.0.0-rc.1` (`888c06c`), desplegada en producción |
| URL | https://ahorrito-nine.vercel.app |
| Fecha | 04/10/2026 |
| Cuenta | La cuenta de capturas (correo neutro `.test`). Ninguna captura muestra datos personales reales |
| Datos | Perfiles ficticios P1 a P3 del plan de pruebas (sección 7.1) y la receta del huevo |
| Navegador | Chrome 154 del responsable, ventana a pantalla completa. Las de móvil se toman con DevTools → *Toggle device toolbar* a 375 × 812 |
| Formato | PNG, con el nombre de la tabla. Pie de figura sugerido: "Ahorrito v1.0.0-rc.1 (`888c06c`), 04/10/2026" |

Origen de la lista: evidencia del punto 6, parte J, y plan de pruebas, sección 8. Cada ronda
necesita los datos que deja preparados la ronda anterior.

## Ronda 1 · Sin sesión (ventana de incógnito)

| Archivo | Pantalla | Pasos | Evidencia de |
|---|---|---|---|
| `01-portada-claro.png` | Portada en tema claro | Abrir `/` | RES-09, descargo al pie; enlace al aviso |
| `02-portada-oscuro.png` | Portada en tema oscuro | Botón de la luna | RNF-11, tema oscuro |
| `03-portada-movil.png` | Portada en móvil | DevTools a 375 × 812, recargar | Diseño adaptable |
| `04-aviso-privacidad.png` | Aviso integral | Pie → "Aviso de privacidad" | RF-15, CA-26 |
| `05-registro.png` | Registro | `/registro` | RF-01, RF-15 (aviso simplificado y casilla) |
| `06-registro-sin-casilla.png` | Error del aviso | Escribir un correo ficticio (`demo@ahorrito.test`) y una contraseña cualquiera de 8 caracteres o más, **sin** marcar la casilla, y "Crear mi cuenta" | CA-26 (no se crea la cuenta) |
| `07-inicio-sesion.png` | Inicio de sesión | `/iniciar-sesion` | RF-01 |
| `08-inicio-sesion-error.png` | Credenciales incorrectas | Correo de capturas con una contraseña equivocada | CA-01 (rechazo) |
| `09-redireccion-sin-sesion.png` | Protección de rutas | Abrir `/panel` sin sesión; capturar con la **barra de direcciones visible** (`/iniciar-sesion?siguiente=%2Fpanel`) | RNF-04, I-07 |
| `10-demo.png` | Prototipo del motor | `/demo`, "Calcular plan" | Demostración del motor |

## Ronda 2 · Cuenta de capturas sin pagos

Claude deja la cuenta con presupuesto, pero sin pagos, planes ni meta.

| Archivo | Pantalla | Pasos | Evidencia de |
|---|---|---|---|
| `11-panel-sin-pagos.png` | Panel sin pagos | `/panel` | Regla de negocio 6: "Generar mi plan" deshabilitado |
| `12-validacion-monto.png` | Error de validación | "Editar" el presupuesto, escribir `-500` y "Guardar presupuesto" | RF-02; mensaje en el campo |
| `13-historial-vacio.png` | Historial vacío | "Planes guardados" | RF-12 |

## Ronda 3 · Perfil P1 (ingreso muy ajustado)

| Archivo | Pantalla | Pasos | Evidencia de |
|---|---|---|---|
| `14-panel-p1.png` | Captura de P1 | `/panel`, sin generar todavía | RF-02 a RF-04 |
| `15-plan-p1.png` | Plan con descargo y semanas señaladas | "Generar mi plan"; capturar **sin desplazar** | RF-07, RF-08, RF-11, CA-07, CA-05 |
| `16-tabla-p1.png` | Tabla de semanas | Desplazar hasta la tabla ("No alcanza", "Carga alta", "Al día") | RF-08 |
| `17-explicacion-p1.png` | Explicación de la IA | Desplazar hasta "Qué significa tu plan" | RF-10 |
| `18-plan-p1-oscuro.png` | Plan en tema oscuro | Botón de la luna | RNF-11 |
| `19-plan-p1-movil.png` | Plan en móvil | DevTools a 375 × 812, "Recalcular con mis datos"; capturar sin desplazar | CA-07 en móvil |

## Ronda 4 · Perfil P2 (vencimiento grande a corto plazo)

| Archivo | Pantalla | Pasos | Evidencia de |
|---|---|---|---|
| `20-plan-p2.png` | Déficit concentrado al inicio | "Generar mi plan" | RF-08 |
| `21-recalcular.png` | Recálculo sin explicación | "Recalcular con mis datos": aviso "Este plan se recalculó sin pedir explicación" | RF-13 |

## Ronda 5 · Perfil P3 (meta poco realista)

| Archivo | Pantalla | Pasos | Evidencia de |
|---|---|---|---|
| `22-plan-p3-meta.png` | Meta no alcanzable con su faltante | "Generar mi plan"; tarjeta "Tu meta de ahorro" | RF-06, RF-09, CA-06 |
| `23-ingresos-meta.png` | Sección opcional | Desplazar a "Opcional: ingresos extra y meta de ahorro" | RF-05, RF-06 |
| `24-historial-detalle.png` | Historial con detalle | "Planes guardados" (pantalla completa: lista y detalle) | RF-12 |
| `25-historial-borrar.png` | Borrado en dos pasos | Icono de papelera de una fila: "¿Eliminar este plan?…" | RF-12, SC-07 |
| `26-historial-movil.png` | Historial en móvil | DevTools a 375 × 812 | Diseño adaptable |

## Ronda 6 · Receta del huevo

| Archivo | Pantalla | Pasos | Evidencia de |
|---|---|---|---|
| `27-monedas.png` | Plan que cuadra al centavo | "Generar mi plan": tres semanas en $0.00 como monedas | RF-14 |
| `28-creditos.png` | Diálogo de créditos | Monedas 1, 2 y 3 en orden | RF-14, CA-13 |

## Defecto visible en dos capturas

Las capturas **15** y **18** se tomaron con un solo plan guardado y muestran el enlace "Ver mis
plan guardado". Es el defecto **#37** (cosmético), descubierto al revisar este juego de capturas y
corregido después, en `feature/despliegue`: ahora dice "Ver mi plan guardado". Por decisión del
responsable (04/10/2026) **no se repitieron**. Todas las capturas son de `v1.0.0-rc.1`; la
corrección llega con `v1.0.0`.

## No incluidas (declaradas)

- **"Explicación no disponible" (CA-09):** en producción exigiría cambiar la clave de Gemini. Su
  evidencia es local (`docs/verificacion/2026-10-04-ca09-ca11-ca17.md`).
- **Panel completamente vacío** (sin presupuesto): la interfaz no permite borrar el presupuesto.
  Se usa el panel sin pagos (11).

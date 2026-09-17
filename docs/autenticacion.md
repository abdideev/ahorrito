# Autenticación y protección de rutas (C-06)

| Dato | Valor |
|---|---|
| Requisitos | RF-01, RNF-05 · control AM-02 · base de RNF-04 |
| Fase | 2, pasos 2.3 y 2.4 |
| Proveedor | Supabase Auth, con `@supabase/ssr` |

---

## 1. Tratamiento de la contraseña (RNF-05)

La contraseña **no se cifra de extremo a extremo**. Recibe dos tratamientos distintos, y
nombrarlos con precisión importa porque protegen contra amenazas diferentes:

| Tramo | Mecanismo | Qué garantiza |
|---|---|---|
| **En tránsito** (navegador → servidor de Next.js → Supabase Auth) | **Cifrado TLS** (HTTPS) | Nadie en la red puede leerla. Se descifra en el destino para verificarla |
| **En reposo** (tabla `auth.users`) | **Función de derivación de clave bcrypt**, factor de costo 10 | Es unidireccional y usa sal: nadie puede recuperar la contraseña original, ni siquiera el administrador de la base de datos |

**Redacción para el documento maestro:** *cifrado en tránsito mediante TLS y almacenamiento
mediante función de derivación de clave (bcrypt), nunca en texto claro.*

### Controles implementados

| Control | Dónde |
|---|---|
| Supabase Auth deriva y almacena la contraseña; la aplicación nunca la guarda ni la registra en logs | `src/app/(auth)/acciones.ts` |
| La URL de Supabase debe usar HTTPS; la aplicación no arranca contra un servidor remoto por HTTP | `src/lib/supabase/entorno.ts` |
| Longitud mínima de 8 caracteres, en el panel y en `supabase/config.toml` | `src/lib/autenticacion/validacion.ts` |
| Longitud máxima de **72 bytes**: bcrypt ignora lo que excede ese límite, así que dos contraseñas distintas después del byte 72 serían equivalentes. Se mide en bytes porque una "ñ" ocupa 2 y un emoji 4 | `src/lib/autenticacion/validacion.ts` |
| La contraseña nunca regresa al navegador en el estado del formulario | `src/lib/autenticacion/estado.ts` |

### Verificación

`supabase/verificacion/autenticacion.sql` confirma en la base de datos que toda contraseña
almacenada tiene formato bcrypt (prefijo `$2a$10$`, 60 caracteres). El tramo en tránsito se
verifica en la Fase 6: en desarrollo, `localhost` se sirve por HTTP, y el 100 % de tráfico
cifrado que exige RNF-05 aplica al despliegue.

---

## 2. Protección de rutas: tres capas

| Capa | Archivo | Función |
|---|---|---|
| 1 | `src/proxy.ts` → `src/lib/supabase/sesion.ts` | Renueva la sesión y redirige antes de renderizar. Next.js la considera una comprobación optimista |
| 2 | `src/app/(app)/layout.tsx` | Verifica la sesión en el servidor al renderizar cada pantalla autenticada |
| 3 | Seguridad por fila en la base de datos | Aunque las dos capas anteriores fallaran, ninguna consulta devuelve datos de otro usuario (RNF-04) |

**Denegación por omisión.** Toda ruta es protegida salvo que se declare pública en
`src/lib/autenticacion/rutas.ts`. Una pantalla nueva nace protegida aunque se olvide registrarla.

| Tipo | Rutas | Sin sesión | Con sesión |
|---|---|---|---|
| Pública | `/`, `/demo`, `/confirmar` | Acceso | Acceso |
| De invitado | `/iniciar-sesion`, `/registro` | Acceso | Redirige a `/panel` |
| API | `/api/*` | 401 en JSON | Acceso |
| Protegida | Todas las demás | Redirige a `/iniciar-sesion?siguiente=…` | Acceso |

**Identidad verificada.** Toda decisión de acceso usa `getClaims()`, que verifica la firma del
JWT. `getSession()` solo lee la cookie sin verificarla y no se usa para decidir acceso.

---

## 3. Decisiones de seguridad adicionales

| Riesgo | Control |
|---|---|
| **Redirección abierta** (CWE-601). La plantilla oficial de Supabase redirige al parámetro `next` sin validarlo | `rutaInternaSegura` solo admite rutas internas; rechaza `//dominio`, `/\dominio` y variantes con caracteres de control |
| **Enumeración de cuentas** | El registro responde igual para correos nuevos y existentes; el inicio de sesión no distingue si falló el correo o la contraseña |
| **Filtración de detalles internos** | Los mensajes de Supabase nunca se muestran ni se colocan en la URL; se traducen a mensajes propios |
| **Cliente compartido entre usuarios** | Se crea un cliente de Supabase por petición, nunca uno global |
| **Clave con privilegios totales** | La aplicación usa solo la clave pública; la clave de servicio, que ignora la seguridad por fila, no se configura |

---

## 4. Confirmación del correo

`/confirmar` admite los dos flujos de Supabase Auth:

| Flujo | Cuándo | Qué hace la ruta | Limitación |
|---|---|---|---|
| **Código PKCE** (`?code=`) | Plantilla de correo por omisión. **Es el flujo vigente** | Supabase ya confirmó el correo; la ruta canjea el código por la sesión | El enlace debe abrirse en el mismo navegador del registro, donde está la cookie del verificador. Si se abre en otro, el correo sí queda confirmado y basta con iniciar sesión |
| **Token** (`?token_hash=&type=`) | Plantilla personalizada, disponible solo con SMTP propio | Verifica el token y abre la sesión | Ninguna; funciona desde cualquier navegador |

**Por qué no hay plantilla personalizada todavía.** Supabase solo permite editar las plantillas
cuando el proyecto configura un servidor SMTP propio. Se pospone a la Fase 6, donde será
inevitable por las restricciones del proveedor por omisión (siguiente sección). Cuando se
configure, bastará con cambiar el enlace de la plantilla a
`{{ .SiteURL }}/confirmar?token_hash={{ .TokenHash }}&type=email`, sin modificar código.

## 5. Configuración requerida en Supabase

| Sección del panel | Valor |
|---|---|
| Authentication → URL Configuration → Site URL | `http://localhost:3000` en desarrollo; la URL de producción en la Fase 6 |
| Authentication → URL Configuration → Redirect URLs | `http://localhost:3000/confirmar`; en la Fase 6, también la de producción |
| Authentication → Sign In / Providers → Email | Confirmación de correo activa; longitud mínima de contraseña 8 |

**Limitación del proveedor de correo por omisión.** Solo entrega mensajes a los miembros del
equipo del proyecto, como máximo 2 por hora, y no permite editar plantillas. Basta para
desarrollo, pero impide el registro de usuarios reales: la Fase 6 debe configurar SMTP
propio. Mientras tanto, los usuarios adicionales para pruebas se crean desde
Authentication → Users → Add user, con la opción de autoconfirmar.

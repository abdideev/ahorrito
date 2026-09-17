# Persistencia y aislamiento de datos (C-05, C-07)

| Dato | Valor |
|---|---|
| Requisitos | RF-12, RNF-04 · control AM-01 |
| Interfaz | I-04, `src/ports/repositorio.ts` |
| Fase | 2, pasos 2.1, 2.2, 2.5 y 2.6 |
| Cambios de alcance aplicados | SC-03 (#10) modelo de datos · SC-04 (#13) firma de I-04 |

---

## 1. Contrato del repositorio (I-04, modificado por SC-04)

```ts
interface RepositorioPlanes {
  guardarPlan(plan: Plan): Promise<string>;
  listarPlanes(): Promise<ResumenPlan[]>;
  obtenerPlan(id: string): Promise<PlanGuardado | null>;
  obtenerDatosEntrada(fechaReferencia: FechaIso): Promise<EntradaPlan | null>;
}
```

**Ninguna operación recibe el identificador del usuario.** El repositorio se construye con
el cliente de la sesión y la seguridad por fila decide qué registros alcanza. Un parámetro
`usuarioId` invitaría a tomarlo de la petición del cliente, que es la amenaza AM-01.

`obtenerPlan` devuelve `null` tanto si el plan no existe como si pertenece a otro usuario:
distinguir ambos casos revelaría qué identificadores existen.

## 2. Modelo de datos (SC-03)

Siete tablas conforme a la sección 3.4, con los ajustes de SC-03 para almacenar el plan tal
como lo produce el motor: fechas del horizonte, evaluación de la meta, advertencias y las
cifras de cada semana.

| Decisión | Motivo |
|---|---|
| Los importes usan `numeric(12,2)` | Decisión de diseño 3.4.3: el punto flotante acumula error al repartir |
| El detalle de apartados y vencimientos se guarda como instantánea en `jsonb` | RF-04 permite modificar y eliminar compromisos; un plan generado es un hecho histórico |
| Restricciones que replican identidades del motor: `remanente = disponible − apartado`, `fecha_fin = fecha_inicio + 6`, aporte a la meta acotado por el remanente | Protegen la integridad ante un adaptador defectuoso |
| Los criterios de sobrecarga y déficit **no** se replican en SQL | Son reglas de negocio de M-04; duplicarlas permitiría que diverjan |
| El presupuesto semanal no se almacena en cada asignación | Es derivable: lo disponible menos los ingresos extraordinarios |

## 3. Seguridad por fila (RNF-04)

| Principio | Implementación |
|---|---|
| RLS explícita en las siete tablas | No se depende de la opción automática del panel, que no forma parte del repositorio (RNF-09) |
| Privilegios mínimos | Solo el rol `authenticated` recibe permisos; `anon` no recibe ninguno |
| Una política por operación, con `to authenticated` | `for all` ocultaría qué regla cubre cada operación |
| `(select auth.uid())` | Se evalúa una vez por consulta, no una vez por fila |
| Las cifras de un plan son inmutables | El privilegio de actualización se concede solo sobre la columna `explicacion` |
| Ninguna tabla queda expuesta al crearse | La migración del esquema revoca todo antes de que la de seguridad conceda lo justo |

Verificación: `supabase/verificacion/seguridad_por_fila.sql` y `supabase/verificacion/persistencia.sql`.

## 4. Guardado atómico

`public.guardar_plan(plan jsonb, asignaciones jsonb)` inserta el plan y todas sus semanas en
una sola transacción (sección 3.7.1). Es **`security invoker`**: se ejecuta con los permisos
del usuario, así que la seguridad por fila sigue aplicándose; `security definer` la saltaría.
El propietario se toma de `auth.uid()`, nunca de un parámetro del cliente.

`privado.importe` rechaza cualquier texto que no tenga dos decimales exactos, en un esquema
que la API de datos no expone. Sin esa validación, un `123.456` se guardaría redondeado en
silencio y el plan almacenado dejaría de cuadrar con el calculado.

## 5. Importes sin punto flotante

PostgREST devuelve los `numeric` como números JSON, que JavaScript interpreta en punto
flotante. El adaptador los lee con `columna::text` y los convierte a centavos con aritmética
entera; al escribir hace lo inverso. Una prueba recorre el viaje completo de ida y vuelta,
incluidos los valores que el punto flotante altera.

## 6. Verificación

### Pruebas unitarias

```bash
pnpm test
```

Incluyen la conversión exacta de importes y la ida y vuelta de tres planes reales del motor
(sin meta con sobrecarga, con meta viable e ingresos, y con déficit y advertencias).

### Pruebas de integración (CA-10)

```bash
pnpm test:integracion
```

Se conectan a la base de datos real con la **clave pública** y dos usuarios distintos, como lo
haría el navegador. No usan la clave de servicio, que ignoraría la seguridad por fila y
volvería la prueba inútil. Requieren en `.env.local` los cuatro valores declarados en
`.env.example` (`PRUEBA_USUARIO_*`); si faltan, las pruebas se omiten en lugar de fallar.

Los usuarios de prueba se crean en Authentication → Users → Add user, con autoconfirmación y
un dominio reservado (`.test`).

**Resultado del 17 de septiembre de 2026: 7 pruebas en verde.**

| Verificación | Resultado |
|---|---|
| El plan guardado vuelve idéntico al calculado | Correcto |
| El plan aparece en la lista con su número de semanas | Correcto |
| Una lista de asignaciones vacía se rechaza y no deja planes huérfanos | Correcto |
| Un importe con tres decimales es rechazado | Correcto |
| **Once intentos de acceso cruzado del usuario B: cero filas en todos** | **CA-10 cumplido** |
| B no puede crear un plan a nombre de A | Error `42501` |
| Una sesión anónima no obtiene ninguna fila de ninguna tabla | Correcto |

Los once intentos: por el puerto (`obtenerPlan` y `listarPlanes`), consulta directa del plan
por su identificador, de sus asignaciones, lectura completa de las seis tablas con datos del
usuario, y una actualización de la explicación ajena.

# Motor de cálculo determinista (C-03)

Contrato de entrada y salida del núcleo de dominio. Es la referencia para quien
consuma la interfaz **I-02** desde el orquestador (C-02) y para quien mantenga el
motor. La especificación normativa vive en el documento maestro, secciones 3.2.2 y
3.3.2; aquí está lo que el código realmente implementa.

| Dato | Valor |
|---|---|
| Componente | C-03, `src/core` |
| Interfaz | I-02, `calcularPlan(entrada: EntradaPlan): Plan` |
| Requisitos | RF-07, RF-08, RF-09, RNF-06, RNF-08 |
| Módulos | M-01 `calendario.ts`, M-02 `vencimientos.ts`, M-03 `distribucion.ts`, M-04 `evaluacion.ts` |
| Pruebas | 94 casos en `src/core/*.test.ts` |

---

## 1. Propiedades del motor

1. **Función pura.** Ante la misma entrada devuelve siempre la misma salida. No lee el
   reloj, ni variables de entorno, ni la red, y no modifica lo que recibe. La fecha
   desde la que se planifica llega como dato (`fechaReferencia`). Sin esta propiedad
   RNF-06 no sería verificable.
2. **Sin dependencias.** No importa Next.js, React, Supabase, el SDK de IA ni ninguna
   otra capa del sistema (RNF-08). Una regla de ESLint lo verifica en cada `pnpm lint`.
3. **Aritmética entera en centavos.** Ningún importe pasa por punto flotante (regla de
   negocio 4). Las divisiones del reparto se hacen sobre múltiplos exactos.
4. **Fechas sin zona horaria.** Cadenas `AAAA-MM-DD` convertidas internamente a número
   de día con aritmética entera. No se usa `Date`.

---

## 2. Entrada

```ts
interface EntradaPlan {
  fechaReferencia: FechaIso;              // AAAA-MM-DD, día desde el que se planifica
  presupuesto: {
    montoSemanal: Centavos;               // entero > 0
    diaInicioSemana: DiaSemana;           // 0 = domingo … 6 = sábado
  };
  compromisos: readonly Compromiso[];     // al menos uno
  ingresosExtra?: readonly IngresoExtra[];
  metaAhorro?: MetaAhorro | null;
}

interface Compromiso  { id: string; monto: Centavos; fechaLimite: FechaIso; ocurrencias: number; }
interface IngresoExtra { id: string; monto: Centavos; fecha: FechaIso; }
interface MetaAhorro  { montoObjetivo: Centavos; fechaObjetivo: FechaIso; }
```

| Campo | Regla | Verificada en |
|---|---|---|
| `fechaReferencia` | Fecha real en formato `AAAA-MM-DD` | `plan.ts` |
| `presupuesto.montoSemanal` | Entero de centavos mayor que cero | `distribucion.ts` |
| `presupuesto.diaInicioSemana` | Entero de 0 a 6 | `calendario.ts` |
| `compromisos` | Al menos uno (regla de negocio 6) | `plan.ts` |
| `compromiso.id` | Cadena no vacía y única entre compromisos | `vencimientos.ts` |
| `compromiso.monto` | Entero de centavos mayor que cero | `vencimientos.ts` |
| `compromiso.ocurrencias` | Entero de 1 a 6 (regla de negocio 2) | `vencimientos.ts` |
| `ingresoExtra.monto` | Entero de centavos mayor que cero | `distribucion.ts` |
| `metaAhorro.montoObjetivo` | Entero de centavos mayor que cero | `evaluacion.ts` |

**`Centavos` y `FechaIso` son tipos marcados.** No se construyen con una literal: se
usan `centavos(n)` de `tipos.ts` y `fechaIso("AAAA-MM-DD")` de `calendario.ts`, que
validan al ejecutar. El compilador impide pasar un `number` o un `string` cualquiera.

Toda violación de las reglas anteriores lanza `RangeError`. El motor **no** devuelve
resultados parciales ante una entrada inválida: la validación de esquema previa
corresponde a C-02, conforme a la sección 3.6.2 del documento maestro.

---

## 3. Salida

```ts
interface Plan {
  fechaReferencia: FechaIso;
  inicioHorizonte: FechaIso;              // primer día de la semana 1
  finHorizonte: FechaIso;
  asignaciones: readonly AsignacionSemanal[];
  evaluacionMeta: EvaluacionMeta | null;  // null si la entrada no trae meta
  advertencias: readonly Advertencia[];
}

interface AsignacionSemanal {
  numeroSemana: number;                   // empieza en 1
  fechaInicio: FechaIso;
  fechaFin: FechaIso;                     // fechaInicio + 6 días
  presupuesto: Centavos;
  ingresosExtra: Centavos;
  montoDisponible: Centavos;              // presupuesto + ingresosExtra
  montoApartado: Centavos;                // lo que debe reservarse esa semana
  montoVencimientos: Centavos;            // lo que vence esa semana
  remanente: Centavos;                    // disponible − apartado; negativo = déficit
  aporteMeta: Centavos;                   // parte del remanente sugerida para la meta
  apartados: readonly Apartado[];         // desglose por compromiso y ocurrencia
  vencimientos: readonly Vencimiento[];
  sobrecargada: boolean;                  // RF-08
  enDeficit: boolean;
}

interface EvaluacionMeta {
  montoObjetivo: Centavos;
  fechaObjetivo: FechaIso;
  ahorroPosible: Centavos;                // suma de remanentes positivos hasta la fecha
  viable: boolean;
  faltante: Centavos;                     // 0 si es viable
  aportes: readonly { numeroSemana: number; monto: Centavos }[];
}
```

El plan **no incluye la explicación en lenguaje natural**: la agrega C-02 tras
consultar a C-04, y puede quedar nula (regla de negocio 5, RNF-03). Tampoco incluye la
denominación de los compromisos: el motor no la necesita y omitirla evita que llegue a
la carga enviada al proveedor de IA (RNF-10).

---

## 4. Reglas del cálculo

### 4.1 Horizonte (SUP-01, modificado por SC-01)

```
finHorizonte = mín( fechaReferencia + 6 meses,
                    máx( último vencimiento, fecha objetivo de la meta ) )
```

Nunca queda antes de la fecha de referencia. La suma de meses conserva el día y lo
ajusta al último día del mes cuando el destino es más corto (31 ene + 1 mes = 28 feb).

### 4.2 Semanas (M-01)

La semana 1 empieza en el día configurado más reciente que no sea posterior a la fecha
de referencia; puede iniciar hasta seis días antes de ella. Las siguientes son bloques
contiguos de siete días hasta cubrir el fin del horizonte. El presupuesto de cada
semana está disponible desde su primer día, porque ese día es también el de cobro.

### 4.3 Vencimientos (M-02)

Cada ocurrencia se calcula como `fechaLimite + n meses` **desde la fecha original**, no
desde la ocurrencia anterior, de modo que un pago del día 31 vuelve al 31 tras pasar
por un mes corto. Los vencimientos no se almacenan: se derivan en cada cálculo (SUP-04).

Se clasifican en tres grupos: anteriores a la fecha de referencia, dentro del horizonte
y posteriores al fin del horizonte. Solo los del segundo grupo entran al reparto; los
otros dos generan advertencia.

### 4.4 Reparto (M-03, RF-07)

Cada ocurrencia se aparta **en partes iguales desde la semana siguiente al vencimiento
anterior del mismo compromiso** —o desde la semana 1 si no hay anterior— **hasta la
semana en que vence**. Los centavos que no dividen exacto se asignan a las primeras
semanas: apartar de más al principio nunca provoca un pago tardío.

Ejemplo. Renta de 600 con vencimientos el 25 de septiembre y el 25 de octubre,
semanas de lunes a domingo desde el 14 de septiembre:

| Semana | 14-20 sep | 21-27 sep | 28 sep-4 oct | 5-11 oct | 12-18 oct | 19-25 oct |
|---|---|---|---|---|---|---|
| Apartado | 300 | 300 | 150 | 150 | 150 | 150 |
| Vence | — | 600 | — | — | — | 600 |

Lo que sobra en una semana **no pasa a la siguiente**: ese remanente ya tiene destino
(la meta o el gasto libre), y arrastrarlo ocultaría semanas que CA-05 exige marcar.

El motor no redistribuye cuando el presupuesto no alcanza: reparte igual y marca el
déficit. Una redistribución "inteligente" es la complejidad que advierte el riesgo
RSG-08 y no aporta al usuario una decisión que no pueda tomar él.

### 4.5 Evaluación (M-04, RF-08 y RF-09)

Dos marcas distintas, que no deben confundirse:

| Marca | Criterio | Significado |
|---|---|---|
| `sobrecargada` | `montoVencimientos > montoDisponible` | Lo que **vence** esa semana supera lo disponible (RF-08, CA-05) |
| `enDeficit` | `remanente < 0` | Lo que hay que **apartar** supera lo disponible |

Una semana puede estar en déficit sin estar sobrecargada, porque el apartado reúne por
adelantado pagos que vencen después.

**Meta de ahorro.** Se consideran las semanas que inician hasta la fecha objetivo. Cada
una aporta como máximo su remanente positivo; las semanas en déficit aportan cero. La
meta es viable si la suma de esas capacidades alcanza el objetivo; si no, se informa el
faltante (CA-06) y se reparte todo lo que sí puede ahorrarse.

El aporte se reparte en dos pasadas: una cuota uniforme limitada por el remanente de
cada semana y por lo que falta del objetivo, y un segundo recorrido que completa desde
las primeras semanas con capacidad libre. Así la meta se alcanza siempre que la
capacidad total lo permita, incluso si está concentrada en pocas semanas.

---

## 5. Advertencias

Son códigos estructurados, no texto: la interfaz decide la redacción y el adaptador de
IA los usa como dato.

| Tipo | Campos | Cuándo |
|---|---|---|
| `semana-sobrecargada` | `numeroSemana`, `excedente` | Los vencimientos de la semana superan lo disponible |
| `semana-en-deficit` | `numeroSemana`, `faltante` | El apartado de la semana supera lo disponible |
| `meta-no-alcanzable` | `faltante` | El ahorro posible no cubre el objetivo |
| `meta-fuera-de-horizonte` | `fechaObjetivo`, `finHorizonte` | La fecha objetivo cae más allá del horizonte; la evaluación es parcial |
| `vencimiento-anterior-a-referencia` | `compromisoId`, `ocurrencia`, `fecha` | El pago venció antes de la fecha de referencia |
| `vencimiento-fuera-de-horizonte` | `compromisoId`, `ocurrencia`, `fecha` | El pago cae después del fin del horizonte |
| `ingreso-fuera-de-horizonte` | `ingresoId`, `fecha` | El ingreso queda fuera del periodo planificado |

---

## 6. Supuestos vigentes

Acordados durante la construcción de la Fase 1. Cambiarlos exige una solicitud de
cambio conforme a la sección 2.8 del documento maestro.

| # | Supuesto |
|---|---|
| S1 | El presupuesto es semanal. La periodicidad variable no forma parte de la Fase 1 |
| S2 | La fecha de referencia llega como dato de entrada |
| S3 | El presupuesto de la semana está disponible desde su primer día |
| S4 | Un vencimiento el día 31 cae el último día de los meses que no lo tienen |
| S5 | Los centavos sobrantes del reparto van a las primeras semanas |
| S6 | El remanente de una semana no se arrastra a la siguiente |
| S7 | Los vencimientos anteriores a la fecha de referencia se excluyen y se advierten |
| S8 | Si el apartado supera lo disponible, no se redistribuye: se marca el déficit |

---

## 7. Invariantes verificadas por las pruebas

1. Lo apartado en el horizonte iguala exactamente el total de los vencimientos que
   caen dentro de él. Ningún centavo se pierde ni se inventa.
2. Un reparto en partes iguales suma siempre el monto original, verificado sobre 1 624
   combinaciones de monto y número de partes.
3. El aporte a la meta nunca excede el objetivo ni el remanente de ninguna semana.
4. La aritmética de fechas coincide con la implementación de referencia del entorno en
   los 73 414 días entre 1900 y 2100.
5. `calcularPlan` devuelve resultados idénticos ante entradas idénticas y no modifica
   lo que recibe.

---

## 8. Trazabilidad

| Requisito | Módulo | Archivo | Pruebas |
|---|---|---|---|
| RF-07 | M-01, M-02, M-03 | `calendario.ts`, `vencimientos.ts`, `distribucion.ts` | CA-02, CA-03, CA-04 |
| RF-08 | M-04 | `evaluacion.ts` | CA-05 |
| RF-09 | M-04 | `evaluacion.ts` | CA-06 |
| RNF-06 | Todo C-03 | `src/core/*.test.ts` | 94 casos en verde |
| RNF-08 | Todo C-03 | `eslint.config.mjs` | Cobertura ≥ 80 % y ninguna importación del marco |

---

## 9. Cómo ejecutar las pruebas

```bash
pnpm test
```
```bash
pnpm test:cov
```
```bash
pnpm lint
```

`pnpm test:cov` exige un mínimo de 80 % en líneas y funciones y 70 % en ramas dentro de
`src/core`; por debajo de ese umbral la ejecución falla.

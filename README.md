# Ahorrito

Sistema web que calcula un **plan semanal de asignación de dinero** a partir del
presupuesto declarado por el usuario, sus compromisos de pago con fecha límite y su
meta de ahorro. Indica cuánto apartar cada semana para que ningún pago llegue tarde,
señala las semanas sobrecargadas y acompaña el resultado con una explicación en
lenguaje natural.

> El plan es una **sugerencia de organización personal y no constituye asesoría
> financiera profesional**.

Proyecto académico de la asignatura Administración de la Calidad del Software, UAEH
Escuela Superior de Tlahuelilpan, documentado conforme a ISO/IEC/IEEE 12207:2026.

---

## Estado

| Fase | Contenido | Estado |
|---|---|---|
| 0 | Preparación del entorno | Completada |
| 1 | Motor de cálculo determinista (C-03) | Completada, 94 pruebas unitarias |
| 2 | Persistencia y autenticación | Pendiente |
| 3 | Integración con la API de Gemini | Pendiente |
| 4 | Interfaz de usuario | Pendiente |
| 5 y 6 | Verificación, despliegue y liberación | Pendientes |

La interfaz web todavía no está construida: hoy el repositorio contiene el motor de
cálculo y sus pruebas.

---

## Requisitos previos

| Herramienta | Versión |
|---|---|
| Node.js | 20 o superior |
| pnpm | 12 o superior |

**Este proyecto usa pnpm exclusivamente.** No se admiten `package-lock.json` ni
`yarn.lock`; el único archivo de bloqueo válido es `pnpm-lock.yaml`.

## Instalación

```bash
pnpm install
```

```bash
cp .env.example .env.local
```

Completa `.env.local` con tus credenciales. Ese archivo **nunca se versiona**.

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio; solo servidor |
| `GEMINI_API_KEY` | Clave de la API de Gemini; solo servidor |

## Comandos

| Acción | Comando |
|---|---|
| Servidor de desarrollo | `pnpm dev` |
| Compilar | `pnpm build` |
| Pruebas | `pnpm test` |
| Pruebas en modo continuo | `pnpm test:watch` |
| Pruebas con cobertura | `pnpm test:cov` |
| Análisis estático | `pnpm lint` |

---

## Estructura

```
src/
├── app/          C-01 y C-02: interfaz web y orquestador
├── core/         C-03: motor de cálculo determinista, sin dependencias externas
├── ports/        Contratos I-02, I-03 e I-04
├── adapters/     C-04 adaptador de IA y C-05 adaptador de persistencia
├── components/   C-01
└── lib/          Utilidades compartidas
```

**Regla estructural no negociable:** ningún archivo de `src/core` puede importar
Next.js, React, Supabase ni otra capa de la aplicación. Es el requisito RNF-08 y lo
verifica una regla de ESLint en cada `pnpm lint`.

## Documentación

| Documento | Contenido |
|---|---|
| [docs/Ahorrito-PLAN.md](docs/Ahorrito-PLAN.md) | Arquitectura, requisitos, reglas de desarrollo y plan por fases |
| [docs/GITFLOW.md](docs/GITFLOW.md) | Modelo de ramas, convención de commits y publicación de versiones |
| [docs/motor-calculo.md](docs/motor-calculo.md) | Contrato de entrada y salida del motor (I-02) |
| [docs/diagramas/](docs/diagramas) | Diagramas de arquitectura, clases, secuencia y modelo de datos |
| `docs/ACS-U1-APP-AvilaNeriAbdiel.docx` | Documento maestro normativo |

## Licencia

Distribuido bajo la licencia incluida en [LICENSE](LICENSE).

# Regresión final de la Fase 5 · 04/10/2026

Plan de pruebas, sección 9. Rama `feature/verificacion` en `248fa5f` (último commit de la Fase 5
antes del informe), compilación de producción. Node 25.7.0, pnpm 12.3.4. Se ejecutó después de
corregir todos los defectos de la fase (#27, #30, #31 por SC-09 y #34), del rediseño del aviso
simplificado y de CA-23.

| Suite | Comando | Resultado | Evidencia |
|---|---|---|---|
| Unitarias | `pnpm exec vitest run --reporter=json` | **354 de 354** en 28 archivos (`success: true`) | `2026-10-04-unitarias.json` |
| Integración | `pnpm exec vitest run --config vitest.integracion.mts` | **20 de 20**, más 2 marcadores omitidos; 0 fallidas (`success: true`) | `2026-10-04-integracion.json` y `.log` (con la salida `[CA-10]`) |
| Interfaz | `pnpm test:e2e` | **6 de 6**: 6 esperadas, 0 inesperadas, 0 inestables y 0 omitidas | `2026-10-04-e2e.json` |
| Estática | `pnpm lint` y `pnpm exec tsc --noEmit` | Código de salida 0, sin advertencias | — |

**Integración:** las 20 pruebas corrieron con las tres cuentas de prueba configuradas. Los 2
marcadores omitidos son los que solo se ejecutan cuando faltan las credenciales (plan,
sección 9.5).

**Credenciales:** ninguno de los cuatro archivos contiene el correo ni la contraseña de las cuentas
A, B o C. Se comprobó contra `.env.local` sin imprimir los valores. `test-results/` se borró tras
la ejecución de interfaz.

## Evolución de la suite durante la fase

| Momento | Unitarias | Integración | Interfaz | Evidencia |
|---|---|---|---|---|
| Línea base, 03/10/2026 (Node 25 y Node 24) | 350 de 350 | No ejecutada | No existía | `../2026-10-03-unitarias-node25.json`, `../2026-10-03-unitarias-node24.json` |
| Tras #27, 03/10/2026 | 350 de 350 | 19 de 20: **1 fallida**, falso positivo #30 | — | `../2026-10-03-integracion-27.json` |
| Tras SC-09, 03/10/2026 | 354 de 354 (+4) | — | — | `../2026-10-03-unitarias-sc09.json` |
| Tras #30, 03/10/2026 | — | **20 de 20** | — | `../2026-10-03-integracion-30-despues.json` |
| SC-10 antes de #34, 04/10/2026 | — | — | 5 de 6: **E2E-04 falla** | `../2026-10-04-e2e-antes.json` |
| Tras #34, 04/10/2026 | 354 de 354 | — | **6 de 6**, dos veces | `../2026-10-04-e2e-despues.json` |
| **Final, 04/10/2026** | **354 de 354** | **20 de 20** | **6 de 6** | Esta carpeta |

import { defineConfig } from "vitest/config";

/**
 * Pruebas de las reglas de evaluación de la validación (Fase 7). No forman parte de `pnpm test`.
 *
 *   pnpm exec vitest run --config docs/validacion/scripts/vitest.validacion.mts
 */
const RAIZ = `${import.meta.dirname}/../../..`;

export default defineConfig({
  root: RAIZ,
  test: {
    environment: "node",
    include: ["docs/validacion/scripts/validacion.test.mjs"],
  },
});

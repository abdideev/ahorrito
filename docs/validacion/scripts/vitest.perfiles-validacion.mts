import { defineConfig } from "vitest/config";

/**
 * Configuración del script de perfiles de la validación (Fase 7, protocolo, sección 5). No forma
 * parte de `pnpm test`.
 *
 *   FECHA_REFERENCIA=2026-10-20 pnpm exec vitest run --config docs/validacion/scripts/vitest.perfiles-validacion.mts
 */
const RAIZ = `${import.meta.dirname}/../../..`;

export default defineConfig({
  root: RAIZ,
  test: {
    environment: "node",
    include: ["docs/validacion/scripts/perfiles-validacion.sim.ts"],
  },
  resolve: {
    alias: { "@": `${RAIZ}/src` },
  },
});

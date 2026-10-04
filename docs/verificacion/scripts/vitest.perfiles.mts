import { defineConfig } from "vitest/config";

/**
 * Configuración del script de perfiles (plan de pruebas, secciones 7.1 y 10.1). No forma parte
 * de `pnpm test`: calcula los resultados esperados de P1 a P3 con el motor real para la fecha
 * de referencia del día de la ejecución.
 *
 *   pnpm exec vitest run --config docs/verificacion/scripts/vitest.perfiles.mts
 *
 * FECHA_REFERENCIA=AAAA-MM-DD fija otra fecha; por omisión, hoy en America/Mexico_City.
 */
const RAIZ = `${import.meta.dirname}/../../..`;

export default defineConfig({
  root: RAIZ,
  test: {
    environment: "node",
    include: ["docs/verificacion/scripts/perfiles.sim.ts"],
  },
  resolve: {
    alias: { "@": `${RAIZ}/src` },
  },
});

import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas de interfaz de extremo a extremo (SC-10, #33). Protegen los defectos de interfaz que
 * las pruebas unitarias no pueden ver: posiciones, capas de CSS y HTML servido sin JavaScript.
 *
 * Corren contra la compilación de producción, como recomienda la guía de Next.js
 * (`node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md`), en un puerto propio
 * para no chocar con un servidor de desarrollo abierto:
 *
 *   pnpm build && pnpm test:e2e
 *
 * Contra un despliegue ya publicado, sin levantar el servidor local (prueba de humo del Bloque 6):
 *
 *   E2E_URL_BASE=https://ahorrito-nine.vercel.app pnpm test:e2e e2e/humo.spec.ts
 *
 * Usan la cuenta de prueba C (`PRUEBA_USUARIO_C_*` en .env.local), que preparan y limpian ellas
 * mismas. Sin esas variables, las pruebas que necesitan sesión se omiten.
 */
// Playwright carga este archivo como CommonJS: `__dirname` y no `import.meta.dirname`.
const ARCHIVO_ENTORNO = `${__dirname}/.env.local`;
if (existsSync(ARCHIVO_ENTORNO)) {
  process.loadEnvFile(ARCHIVO_ENTORNO);
}

const PUERTO = 3100;
/** URL de un despliegue publicado. Si se define, no se arranca el servidor local. */
const URL_REMOTA = process.env.E2E_URL_BASE;

export default defineConfig({
  testDir: "./e2e",
  // Comparten la cuenta C: en serie, para que una prueba no borre lo que otra está usando.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "test-results/e2e.json" }]],
  use: {
    baseURL: URL_REMOTA ?? `http://localhost:${PUERTO}`,
    locale: "es-MX",
    timezoneId: "America/Mexico_City",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: URL_REMOTA
    ? undefined
    : {
        command: `pnpm exec next start -p ${PUERTO}`,
        url: `http://localhost:${PUERTO}`,
        reuseExistingServer: false,
        timeout: 60_000,
      },
});

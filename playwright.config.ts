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
 * Usan la cuenta de prueba C (`PRUEBA_USUARIO_C_*` en .env.local), que preparan y limpian ellas
 * mismas. Sin esas variables, las pruebas que necesitan sesión se omiten.
 */
// Playwright carga este archivo como CommonJS: `__dirname` y no `import.meta.dirname`.
const ARCHIVO_ENTORNO = `${__dirname}/.env.local`;
if (existsSync(ARCHIVO_ENTORNO)) {
  process.loadEnvFile(ARCHIVO_ENTORNO);
}

const PUERTO = 3100;

export default defineConfig({
  testDir: "./e2e",
  // Comparten la cuenta C: en serie, para que una prueba no borre lo que otra está usando.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "test-results/e2e.json" }]],
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    locale: "es-MX",
    timezoneId: "America/Mexico_City",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec next start -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});

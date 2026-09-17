import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

/**
 * Configuración de las pruebas de integración, que sí tocan la base de datos real.
 *
 * Van separadas de `pnpm test` porque requieren credenciales y red: las pruebas
 * unitarias deben poder ejecutarse en cualquier equipo sin configuración previa.
 *
 * Las variables se leen de .env.local con process.loadEnvFile, incluido en Node, para
 * no agregar una dependencia solo con ese fin. Ese archivo nunca se versiona.
 */
const ARCHIVO_ENTORNO = `${import.meta.dirname}/.env.local`;
if (existsSync(ARCHIVO_ENTORNO)) {
  process.loadEnvFile(ARCHIVO_ENTORNO);
}

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integracion.test.ts"],
    // Las pruebas comparten usuarios y datos en una base real: no pueden correr en paralelo.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: { "@": `${import.meta.dirname}/src` },
  },
});

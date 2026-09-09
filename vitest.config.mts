import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/core/**"],
      thresholds: { lines: 80, functions: 80, branches: 70 },
    },
  },
  resolve: {
    alias: { "@": `${import.meta.dirname}/src` },
  },
});
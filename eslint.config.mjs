import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // RNF-08: el nucleo de dominio (C-03) no depende del marco, de servicios externos
  // ni de las capas que lo rodean. Si esta regla falla, el problema es el codigo.
  {
    files: ["src/core/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: ["next", "next/*", "@next/*", "react", "react/*", "react-*"],
            message: "RNF-08: src/core no puede depender de Next.js ni de React.",
          },
          {
            group: ["@supabase/*", "@google/*"],
            message: "RNF-08: los servicios externos se integran en src/adapters, no en src/core.",
          },
          {
            group: ["@/app/*", "@/components/*", "@/adapters/*", "@/ports/*", "@/lib/*"],
            message: "RNF-08: las capas externas dependen del nucleo, nunca al reves.",
          },
          {
            regex: "^\\.\\./",
            message: "RNF-08: src/core no sale de su carpeta mediante rutas relativas.",
          },
        ],
      }],
      "no-restricted-syntax": ["error", {
        selector: "ImportExpression",
        message: "RNF-08: el nucleo es sincrono y determinista; no usa importaciones dinamicas.",
      }],
    },
  },
]);

export default eslintConfig;

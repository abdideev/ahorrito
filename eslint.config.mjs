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
  {
    files: ["src/core/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          "next", "next/*",
          "react", "react-*",
          "@supabase/*",
          "@/app/*", "@/components/*", "@/adapters/*"
        ]
      }]
    }
  }
]);

export default eslintConfig;

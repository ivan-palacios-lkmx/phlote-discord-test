import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

import plugin from "./eslint-rules/no-relative-imports.js";

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.config({
    plugins: ["prettier", "import"],
    settings: {
      "import/resolver": {
        typescript: {
          project: ["./tsconfig.json"],
        },
      },
    },
    rules: {
      "prettier/prettier": ["error", { endOfLine: "auto" }],
      "no-relative-imports/use-alias": "error",
      // You can add more rules here or in the overrides section below
    },
  }),
  {
    plugins: {
      "no-relative-imports": plugin,
    },
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;

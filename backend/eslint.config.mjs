import { defineConfig, globalIgnores } from "eslint/config";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextTs,
  eslintConfigPrettier,
  globalIgnores([
    "node_modules/**",
    "dist/**",
    "*.db",
  ]),
]);

export default eslintConfig;

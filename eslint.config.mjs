import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ".open-next/**",
      ".wrangler/**",
      ".claude/**",
      "cloudflare-env.d.ts",
      // Vendored stageshow kit (MIT, benjitaylor/skills), kept as published
      "src/components/stageshow/kit/**",
    ],
  },
];

export default eslintConfig;

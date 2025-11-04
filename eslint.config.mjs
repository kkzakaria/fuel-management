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
      "scripts/**", // Node.js utility scripts (CommonJS allowed)
    ],
  },
  {
    // Exception pour le pattern "enabled after mount" dans les hooks de données
    // Ce pattern est nécessaire pour éviter l'erreur "state update before mount"
    // avec TanStack Query qui peut s'exécuter avant le montage du composant
    files: ["hooks/use-*.ts"],
    rules: {
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;

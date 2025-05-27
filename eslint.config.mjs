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
      ".next/**/*",
      "node_modules/**/*",
      "dist/**/*",
      "build/**/*",
      "out/**/*",
      "*.d.ts",
      "tsconfig.tsbuildinfo"
    ]
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-wrapper-object-types": "error",
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "no-unused-expressions": ["error", { 
        "allowShortCircuit": true, 
        "allowTernary": true 
      }],
      "react/no-unescaped-entities": "error",
      "react/display-name": "warn",
      "prefer-const": "error",
      "no-var": "error"
    }
  },
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: {
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly"
      }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  }
];

export default eslintConfig;

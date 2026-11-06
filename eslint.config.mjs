import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

/**
 * ESLint 9 flat config, replacing `.eslintrc.js` + `.eslintignore` — `next
 * lint` (and the legacy config format it read) no longer exists in Next 16.
 * `eslint-config-next` 16 ships flat-config arrays from its subpath exports,
 * so they spread directly. `prettier` last, so formatting rules never fight
 * the formatter.
 *
 * No `overrides` on purpose, matching the old config: every file in the app
 * lints under the same rules with no per-file exemptions.
 */
export default [
  { ignores: [".next/**", "node_modules/**", "public/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

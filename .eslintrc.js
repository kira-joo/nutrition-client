/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["next/core-web-vitals", "next/typescript", "prettier"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "react-hooks/exhaustive-deps": "warn",
  },
  // No `overrides` on purpose: the per-file rule exemptions that used to live
  // here all pointed at legacy pages (15-day-camp, the MUI-era AppLink and
  // DesktopNavbar) that no longer exist, so every file in the app now lints
  // under the same strict rules with no exemptions.
};

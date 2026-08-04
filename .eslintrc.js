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
  overrides: [
    {
      // The 15-day-camp bespoke campaign page folds into the generic
      // Campaign block renderer in Phase 6 and is deleted outright,
      // including its react-hooks/rules-of-hooks bug in BottomCTABar.tsx.
      files: ["src/app/\\[locale\\]/15-day-camp/**"],
      rules: {
        "react-hooks/rules-of-hooks": "off",
        "react/no-unescaped-entities": "off",
      },
    },
    {
      // MUI-era AppLink/nav components, replaced by frontend-toolkit-core's
      // buildAppHref and a rebuilt nav in Phase 4/6.
      files: [
        "src/app/components/AppLink/**",
        "src/app/components/header/DesktopNavbar.tsx",
      ],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-object-type": "off",
      },
    },
  ],
};

import { readFileSync } from "node:fs";
import path from "node:path";
import type { Config } from "tailwindcss";

/**
 * Every value here reads from the CSS custom properties defined in
 * `src/app/globals.css` — this file only wires those tokens into Tailwind's
 * utility classes, it never introduces a new raw value of its own. See
 * docs/theme.md for the full token reference and usage examples.
 */

/**
 * Built from the canonical token list rather than hand-written, so the
 * `text-*` utilities Tailwind generates and the size names `src/lib/cn.ts`
 * feeds to tailwind-merge can never disagree. See
 * `src/lib/design/font-size-tokens.ts`.
 */
type FontSizeEntry = [fontSize: string, configuration: { lineHeight: string }];

/**
 * Read via `fs` rather than imported: Tailwind loads this config through
 * jiti, which does not resolve a JSON module import the way `tsc` and
 * webpack do. Importing it left `fontSize` undefined, Tailwind fell back to
 * a themeless config, and the build "succeeded" while emitting nothing but
 * preflight — every token utility silently absent.
 */
const lineHeights: Record<string, string> = JSON.parse(
  readFileSync(path.join(__dirname, "src/lib/design/font-size-tokens.json"), "utf8")
);

const fontSize: Record<string, FontSizeEntry> = Object.fromEntries(
  Object.entries(lineHeights).map(([token, lineHeight]): [string, FontSizeEntry] => [token, [`var(--text-${token})`, { lineHeight }]])
);
const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/sections/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-muted": "var(--color-surface-muted)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        border: "var(--color-border)",
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          soft: "var(--color-primary-soft)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          soft: "var(--color-accent-soft)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        destructive: "var(--color-destructive)",
        focus: "var(--color-focus)",
        "focus-on-dark": "var(--color-focus-on-dark)",
        overlay: "var(--color-overlay)",
        "overlay-light": "var(--color-overlay-light)",
        "disabled-bg": "var(--color-disabled-bg)",
        "disabled-text": "var(--color-disabled-text)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize,
      spacing: {
        "section-y": "var(--space-section-y)",
        "section-y-sm": "var(--space-section-y-sm)",
        "content-gap": "var(--space-content-gap)",
        "touch-min": "var(--touch-target-min)",
        "control-sm": "var(--control-height-sm)",
        "control-md": "var(--control-height-md)",
        "control-lg": "var(--control-height-lg)",
        "icon-sm": "var(--icon-size-sm)",
        "icon-md": "var(--icon-size-md)",
        "icon-lg": "var(--icon-size-lg)",
        "icon-xl": "var(--icon-size-xl)",
      },
      maxWidth: {
        narrow: "var(--container-narrow)",
        content: "var(--container-content)",
        wide: "var(--container-wide)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      borderWidth: {
        hairline: "var(--border-width-hairline)",
        focus: "var(--border-width-focus)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        raised: "var(--shadow-raised)",
      },
      backgroundImage: {
        hero: "var(--gradient-hero)",
        cta: "var(--gradient-cta)",
        scrim: "var(--gradient-scrim)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
        reveal: "var(--duration-reveal)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        emphasized: "var(--ease-emphasized)",
        "in-out": "var(--ease-in-out)",
        soft: "var(--ease-soft)",
      },
      zIndex: {
        header: "var(--z-header)",
        "sticky-cta": "var(--z-sticky-cta)",
        drawer: "var(--z-drawer)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },
    },
  },
  plugins: [],
};
export default config;

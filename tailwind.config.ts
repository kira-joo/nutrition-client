import { readFileSync } from "node:fs";
import path from "node:path";
import plugin from "tailwindcss/plugin";
import { toolkitContentGlob, toolkitPreset } from "@kira-joo/frontend-toolkit-tailwind/tailwind-preset";
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
  readFileSync(path.join(__dirname, "src/lib/design/font-size-tokens.json"), "utf8"),
);

const fontSize: Record<string, FontSizeEntry> = Object.fromEntries(
  Object.entries(lineHeights).map(([token, lineHeight]): [string, FontSizeEntry] => [
    token,
    [`var(--text-${token})`, { lineHeight }],
  ]),
);
const config: Config = {
  darkMode: "class",
  /*
    The toolkit preset supplies the semantic role vocabulary its components
    render (`bg-surface`, `border-border-strong`, …). This app's own
    `theme.extend.colors` below shadows the roles it already names, which is
    intentional: those resolve straight to the measured `--color-*` values, and
    the `--ftk-*` aliases in `globals.css` cover the rest. Renaming ~90
    variables whose contrast ratios are recorded against those names would have
    been a far larger and riskier change for no runtime difference.
  */
  presets: [toolkitPreset],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/sections/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    /*
      Without this the toolkit's components are compiled from classes this app
      never scans, so whichever ones it happens to use elsewhere survive and the
      rest are purged. That is not theoretical: it silently removed the entire
      visible error state from the consultation form — the site's only lead
      capture — leaving `text-red-600` computing to the body text colour and
      `border-red-500` to the neutral border, plus a default blue focus ring on
      a green-branded site. Measured in the browser, not inferred.

      It has to live here rather than in the preset: Tailwind 3 discards
      `content` declared by a preset.
    */
    toolkitContentGlob,
  ],
  theme: {
    extend: {
      colors: {
        /*
          The five `rgb(var(--x-rgb) / <alpha-value>)` entries are the colours
          that take an `/opacity` modifier somewhere in the app. Tailwind
          cannot derive alpha from an opaque `var(--x)`, so declaring them the
          plain way silently emitted no rule at all for `bg-surface/95` and
          friends. Every other entry stays `var(--color-x)` because nothing
          applies a modifier to it; `scripts/verify-design-tokens.mjs` fails
          the build if that stops being true.
        */
        background: "rgb(var(--color-background-rgb) / <alpha-value>)",
        surface: "rgb(var(--color-surface-rgb) / <alpha-value>)",
        "surface-muted": "var(--color-surface-muted)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        border: "var(--color-border)",
        primary: {
          DEFAULT: "rgb(var(--color-primary-rgb) / <alpha-value>)",
          hover: "var(--color-primary-hover)",
          soft: "var(--color-primary-soft)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent-rgb) / <alpha-value>)",
          hover: "var(--color-accent-hover)",
          soft: "var(--color-accent-soft)",
        },
        rating: "var(--color-rating)",
        gold: {
          DEFAULT: "var(--color-gold)",
          "on-dark": "var(--color-gold-on-dark)",
          soft: "var(--color-gold-soft)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        destructive: "rgb(var(--color-destructive-rgb) / <alpha-value>)",
        focus: "var(--color-focus)",
        "focus-on-dark": "var(--color-focus-on-dark)",
        overlay: "var(--color-overlay)",
        "disabled-bg": "var(--color-disabled-bg)",
        "disabled-text": "var(--color-disabled-text)",
        "surface-inverse": "var(--color-surface-inverse)",
        "on-inverse": "var(--color-text-on-inverse)",
        "on-inverse-muted": "var(--color-text-on-inverse-muted)",
        "border-inverse": "var(--color-border-on-inverse)",
        "accent-on-inverse": "var(--color-accent-on-inverse)",
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
        "heading-gap": "var(--space-heading-gap)",
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
        package: "var(--shadow-package)",
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
  plugins: [
    // Bare `hover:` fires on tap on touch devices (the hover state sticks
    // until the next tap elsewhere) — every "hover elevation" the redesign
    // adds to cards/packages must be pointer-gated instead, so it never
    // shows as a stuck highlight after a tap. Not a Tailwind core variant,
    // so it needs this one-line plugin rather than a new dependency.
    plugin(({ addVariant }) => {
      addVariant("pointer", "@media (hover: hover) and (pointer: fine)");
      /*
        `touch:` for TARGET SIZING, which is a different question from hover and
        needs a different query. `pointer: fine` describes the *primary* pointer,
        so a touchscreen laptop whose primary pointer is its trackpad matches it —
        and would have been handed compact 33px rows while still being operated by
        finger. `any-pointer: coarse` asks whether a coarse pointer is available
        at all, which is the question that actually decides how big a target must
        be. Sizing therefore stays compact by default and grows under `touch:`.
      */
      addVariant("touch", "@media (any-pointer: coarse)");
    }),
  ],
};
export default config;

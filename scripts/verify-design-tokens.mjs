#!/usr/bin/env node
/**
 * Guards the typography token contract, run automatically via the
 * `predev`/`prebuild` npm scripts alongside the motion-token generator.
 *
 * `tailwind.config.ts` and `src/lib/cn.ts` both read their token names from
 * `src/lib/design/font-size-tokens.json`, so those two can't drift from each
 * other by construction. What a shared import can't catch is a token name
 * that has no matching CSS custom property — Tailwind would happily emit
 * `text-foo { font-size: var(--text-foo) }` for a variable that doesn't
 * exist, producing an element with no font size at all and no error.
 *
 * So this checks the direction the shared import leaves open:
 *   - every token has a `--text-<token>` declaration in globals.css;
 *   - every `var(--leading-*)` line-height it references is declared too;
 *   - every `--text-*` variable declared in CSS is a known token, catching
 *     the reverse case where a variable is added but never registered (and
 *     so silently has no utility and is unknown to tailwind-merge).
 *
 * It then guards a second, unrelated contract: that every `/opacity` utility
 * the app writes on a token colour can actually be compiled. Tailwind cannot
 * synthesise an alpha channel from an opaque `var(--x)` colour, so such a
 * utility is dropped with no rule and no warning. Ten of them existed here and
 * none worked — including the sticky header's `bg-surface/95`, which left it
 * fully transparent on every page. A colour that takes a modifier must be
 * declared as `rgb(var(--color-x-rgb) / <alpha-value>)`.
 *
 * Exits non-zero with the specific mismatch, failing the build rather than
 * shipping invisible text or an uncompiled background.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const tokens = JSON.parse(readFileSync(path.join(projectRoot, "src/lib/design/font-size-tokens.json"), "utf8"));
const css = readFileSync(path.join(projectRoot, "src/app/globals.css"), "utf8");

const declared = new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((match) => match[1]));
const problems = [];

for (const [token, lineHeight] of Object.entries(tokens)) {
  if (!declared.has(`--text-${token}`)) {
    problems.push(`token "${token}" has no --text-${token} declaration in globals.css`);
  }
  const referenced = lineHeight.match(/var\((--[a-z0-9-]+)\)/)?.[1];
  if (referenced && !declared.has(referenced)) {
    problems.push(`token "${token}" references ${referenced}, which is not declared in globals.css`);
  }
}

const tokenNames = new Set(Object.keys(tokens));
for (const variable of declared) {
  if (!variable.startsWith("--text-")) continue;
  const name = variable.slice("--text-".length);
  if (!tokenNames.has(name)) {
    problems.push(`${variable} is declared in globals.css but "${name}" is not in font-size-tokens.json — it has no text-* utility and tailwind-merge cannot see it`);
  }
}

/*
 * Every `<prefix>-<token>/<opacity>` utility written in the app, checked against
 * the colour entries that can actually express alpha.
 *
 * Reads `tailwind.config.ts` as text rather than importing it: the config is
 * TypeScript and reads a JSON file off disk at module scope, so importing it
 * from a plain `.mjs` would need a loader for no benefit — the two things this
 * needs are the colour keys and whether each carries `<alpha-value>`.
 */
const configSource = readFileSync(path.join(projectRoot, "tailwind.config.ts"), "utf8");
const alphaCapable = new Set(
  [...configSource.matchAll(/^\s*"?([a-z-]+)"?:\s*"rgb\(var\(--color-[a-z-]+-rgb\) \/ <alpha-value>\)"/gim)].map((m) => m[1])
);
/* A nested `primary: { DEFAULT: ... }` reports its key as `DEFAULT`, so map
   those back to the family name by reading the enclosing key. */
for (const match of configSource.matchAll(/^\s*([a-z-]+):\s*\{[^}]*?DEFAULT:\s*"rgb\(var\(--color-[a-z-]+-rgb\) \/ <alpha-value>\)"/gims)) {
  alphaCapable.add(match[1]);
}
alphaCapable.delete("DEFAULT");

/* Colour names the config defines at all, so a typo'd utility is not mistaken
   for an alpha problem. */
const configuredColors = new Set([...configSource.matchAll(/^\s*"?([a-z-]+)"?:\s*"(?:var\(--color-|rgb\(var\(--color-)/gim)].map((m) => m[1]));

const sourceDirs = ["src/components", "src/sections", "src/app", "src/pages"];
const sourceFiles = [];
const collect = (dir) => {
  const abs = path.join(projectRoot, dir);
  if (!existsSync(abs)) return;
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (entry.isDirectory()) collect(path.join(dir, entry.name));
    else if (/\.(tsx?|jsx?|mdx)$/.test(entry.name)) sourceFiles.push(path.join(dir, entry.name));
  }
};
sourceDirs.forEach(collect);

const ALPHA_UTILITY = /\b(?:bg|text|border|ring|from|via|to|fill|stroke|divide|shadow|outline|decoration|placeholder|caret|accent)-([a-z][a-z-]*)\/(\d{1,3})\b/g;
for (const file of sourceFiles) {
  const contents = readFileSync(path.join(projectRoot, file), "utf8");
  for (const [utility, color] of contents.matchAll(ALPHA_UTILITY)) {
    if (!configuredColors.has(color)) continue; // not one of ours
    if (alphaCapable.has(color)) continue;
    problems.push(
      `${file}: "${utility}" cannot compile — "${color}" is declared as an opaque var(), so Tailwind emits no rule for it. ` +
        `Declare it as rgb(var(--color-${color}-rgb) / <alpha-value>) and add the channel triplet to globals.css.`
    );
  }
}

if (problems.length > 0) {
  console.error("[verify-design-tokens] token contract violation:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `[verify-design-tokens] ${tokenNames.size} typography tokens verified against globals.css; ` +
    `${sourceFiles.length} files checked for uncompilable /opacity utilities (${alphaCapable.size} colours are alpha-capable)`
);

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
 * Exits non-zero with the specific mismatch, failing the build rather than
 * shipping invisible text.
 */
import { readFileSync } from "node:fs";
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

if (problems.length > 0) {
  console.error("[verify-design-tokens] typography token mismatch:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`[verify-design-tokens] ${tokenNames.size} typography tokens verified against globals.css`);

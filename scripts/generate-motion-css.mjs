#!/usr/bin/env node
/**
 * Generates src/app/_generated/motion-tokens.css from
 * src/lib/animation/motion-tokens.json — the ONE canonical source for
 * animation durations/eases. Never hand-edit the generated CSS file.
 *
 * Run automatically via the `predev`/`prebuild` npm scripts, so the
 * generated file can never go stale relative to the JSON it's built from —
 * there's nothing to manually keep in sync.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const sourcePath = path.join(projectRoot, "src/lib/animation/motion-tokens.json");
const outDir = path.join(projectRoot, "src/app/_generated");
const outPath = path.join(outDir, "motion-tokens.css");

const source = JSON.parse(readFileSync(sourcePath, "utf8"));
const { durationsMs, ambientMs, intervalsMs, eases } = source;

/**
 * Fail on a group this generator does not know about, rather than dropping it.
 * The JSON is documented as the one canonical source, so a new token group that
 * silently produced no CSS would break that promise quietly — the next person
 * would add a token, see nothing appear, and have no idea why.
 */
const KNOWN_GROUPS = ["durationsMs", "ambientMs", "intervalsMs", "eases"];
const unknown = Object.keys(source).filter((key) => !KNOWN_GROUPS.includes(key));
if (unknown.length > 0) {
  throw new Error(
    `[generate-motion-css] unhandled token group(s): ${unknown.join(", ")}. ` +
      `Add them to this generator (and to motion-tokens.ts) or remove them from the JSON.`
  );
}
/* And the other direction: a missing group would otherwise fail deep inside
   `Object.entries(undefined)` with nothing pointing at the JSON. */
const missing = KNOWN_GROUPS.filter((key) => typeof source[key] !== "object" || source[key] === null);
if (missing.length > 0) {
  throw new Error(`[generate-motion-css] missing or non-object token group(s): ${missing.join(", ")}.`);
}

/** camelCase token name -> kebab-case CSS custom-property segment. */
const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const lines = [
  "/**",
  " * GENERATED FILE — do not edit by hand.",
  " * Source: src/lib/animation/motion-tokens.json",
  " * Generator: scripts/generate-motion-css.mjs (runs via predev/prebuild)",
  " */",
  ":root {",
  ...Object.entries(durationsMs).map(([name, ms]) => `  --duration-${name}: ${ms}ms;`),
  ...Object.entries(ambientMs).map(([name, ms]) => `  --duration-ambient-${kebab(name)}: ${ms}ms;`),
  ...Object.entries(intervalsMs).map(([name, ms]) => `  --interval-${kebab(name)}: ${ms}ms;`),
  ...Object.entries(eases).map(([name, { cssCubicBezier }]) => {
    const cssName = name === "inOut" ? "in-out" : name;
    return `  --ease-${cssName}: ${cssCubicBezier};`;
  }),
  "}",
  "",
];

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, lines.join("\n"), "utf8");

console.log(`[generate-motion-css] wrote ${path.relative(projectRoot, outPath)}`);

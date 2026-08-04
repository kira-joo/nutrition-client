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

const { durationsMs, eases } = JSON.parse(readFileSync(sourcePath, "utf8"));

const lines = [
  "/**",
  " * GENERATED FILE — do not edit by hand.",
  " * Source: src/lib/animation/motion-tokens.json",
  " * Generator: scripts/generate-motion-css.mjs (runs via predev/prebuild)",
  " */",
  ":root {",
  ...Object.entries(durationsMs).map(([name, ms]) => `  --duration-${name}: ${ms}ms;`),
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

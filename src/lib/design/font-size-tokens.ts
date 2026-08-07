import raw from "./font-size-tokens.json";

/**
 * The ONE canonical source for this app's typography token names.
 *
 * Two places need the same list and must never disagree:
 *   1. `tailwind.config.ts`, which turns each name into a `text-<name>`
 *      utility reading `--text-<name>` / the line-height below.
 *   2. `src/lib/cn.ts`, which passes the names to the toolkit's `createCn`
 *      so tailwind-merge can tell a size from a colour.
 *
 * Both import from here, so config-vs-merge drift is impossible by
 * construction rather than by convention — if a token exists as a utility,
 * `cn` knows about it. (Before this, the two lists were maintained by hand;
 * a token present in Tailwind but missing from `cn` silently re-introduces
 * the merge bug that dropped `text-white` from filled buttons.)
 *
 * The remaining drift a shared import cannot catch — a name added here with
 * no matching CSS custom property in `globals.css` — is enforced by
 * `scripts/verify-design-tokens.mjs`, run from the `predev`/`prebuild` npm
 * lifecycle exactly like the motion-token generator.
 *
 * Values are each token's line-height, since that's the one part of the
 * Tailwind entry that isn't derivable from the name (`button` is unitless
 * `1`, not a `--leading-*` variable).
 */
export const FONT_SIZE_LINE_HEIGHTS: Record<string, string> = raw;

/** Token names only — what `createCn` needs. */
export const FONT_SIZE_TOKENS = Object.keys(raw) as (keyof typeof raw)[];

export type FontSizeToken = (typeof FONT_SIZE_TOKENS)[number];

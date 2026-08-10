import { createCn } from "@kira-joo/frontend-toolkit-tailwind/server";
import { FONT_SIZE_TOKENS } from "@/lib/design/font-size-tokens";

/**
 * The app's `cn`, built from the toolkit's factory so tailwind-merge knows
 * this project's type scale.
 *
 * This is NOT a local reimplementation of the toolkit's `cn` — it's the
 * toolkit's own `createCn` configured with the one thing a generic package
 * cannot know: the custom `fontSize` names in our Tailwind theme. Without
 * them, tailwind-merge can't distinguish `text-button` (a size) from
 * `text-white` (a color), treats them as one conflict group, and drops
 * whichever came first. That silently shipped dark text on every filled
 * `primary` button at roughly 1.8:1 contrast until it was measured.
 *
 * The token list is not repeated here: both this file and
 * `tailwind.config.ts` read the same canonical source, so a new token is
 * known to Tailwind and to tailwind-merge in one edit.
 */
export const cn = createCn({ fontSize: FONT_SIZE_TOKENS });

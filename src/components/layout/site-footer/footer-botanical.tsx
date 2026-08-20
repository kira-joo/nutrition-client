import Image from "next/image";

/**
 * The "Botanical Trust" signature element for the footer: the real
 * `footer-leaf.png` artwork (1536×1024, verified ~84% fully-transparent
 * alpha, zero fully-opaque pixels) doing genuine compositional work in the
 * footer's inline-start corner — a deliberate botanical presence anchored
 * behind the brand block, not a small decorative sticker dropped in as
 * filler.
 *
 * Purely presentational and inert: empty `alt` *and* `aria-hidden` (belt
 * and suspenders — either alone is enough, but the brief calls for both
 * explicitly), plus `pointer-events-none` so it can never sit between a
 * pointer and a real link even though it's absolutely positioned over
 * live content.
 *
 * `rtl:-scale-x-100` — the same directional-flip pattern already used for
 * icons elsewhere (`section-header.tsx`, `recipe-detail.tsx`) — mirrors the
 * artwork's own asymmetric shape, not just its position. The leaf cluster's
 * stem sits toward one side with the leaves fanning toward the other; the
 * parent's logical `start-0` placement alone would only move the *box* to
 * the correct corner in Arabic, leaving the unflipped pixels inside it
 * fanning back toward the corner instead of into the page — i.e. still
 * wrong, just wrong on the other side. Flipping the image itself is what
 * makes the whole composition genuinely mirror.
 *
 * Sized on the standard Tailwind spacing scale only (no arbitrary bracket
 * values) and kept lazy (no `priority`) since it's below-the-fold, purely
 * decorative, and never the LCP element.
 */
export function FooterBotanical() {
  return (
    <Image
      src="/images/books/footer-leaf.png"
      alt=""
      aria-hidden="true"
      width={1536}
      height={1024}
      sizes="(min-width: 1280px) 20rem, (min-width: 1024px) 16rem, (min-width: 640px) 11rem, 7rem"
      className="pointer-events-none absolute bottom-0 start-0 z-0 h-auto w-28 select-none opacity-60 sm:w-44 lg:w-64 xl:w-80 rtl:-scale-x-100"
    />
  );
}

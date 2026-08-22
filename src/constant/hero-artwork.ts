import { Locale } from "@/constant/Locale.enum";

export interface HeroArtwork {
  /** Full-bleed section background, `xl` and up. Landscape. */
  desktop: string;
  /** Bounded 4:5 panel behind the doctor portrait, below `xl`. Portrait. */
  mobile: string;
}

/**
 * Hero artwork per locale and per breakpoint.
 *
 * **One pair of masters, not four.** The original plan assumed the copy's
 * quiet zone would sit on opposite physical sides in each direction, which
 * would have forced separately composed `/ar` and `/en` files. The real
 * supplied artwork (`hero-section.jpg`, `mobile-hero-section.jpg`) is a
 * botanical border framing a quiet centre — measured column-density
 * left-half vs right-half within 1-3%, i.e. genuinely symmetric — so one
 * asset per breakpoint reads correctly in both directions without
 * mirroring. `HeroArtwork` still keys by locale (not just breakpoint) so a
 * future asset that *is* directional can be dropped in per locale without
 * touching call sites.
 *
 * **Desktop is under-resolved.** The supplied master is 1672×941; the
 * artwork box reaches 1921×1037 at a 1920px viewport, so the widest common
 * desktop width upscales the source by roughly 15%, with zero headroom for
 * high-DPI beyond that. `docs/asset-requirements.md` carries the numbers
 * for a proper 3200×1800 re-export. Mobile is fine as supplied: 1122×1402
 * against a largest panel render of 552×704 is almost exactly the 2×
 * minimum this asset needs.
 *
 * Both files were converted from the supplied PNG to JPEG (quality 88,
 * mean per-channel difference under 1.1/255 against the source) — they are
 * opaque photographic/illustrative artwork with no transparency need, and
 * the PNG originals were 1.4-1.8MB against ~200-300KB as JPEG.
 */
const DESKTOP_ARTWORK = "/images/hero-section.jpg";
const MOBILE_ARTWORK = "/images/mobile-hero-section.jpg";

export const HERO_ARTWORK: Record<Locale, HeroArtwork> = {
  [Locale.AR]: {
    desktop: DESKTOP_ARTWORK,
    mobile: MOBILE_ARTWORK,
  },
  [Locale.EN]: {
    desktop: DESKTOP_ARTWORK,
    mobile: MOBILE_ARTWORK,
  },
};

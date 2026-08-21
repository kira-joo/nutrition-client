import { Locale } from "@/constant/Locale.enum";

export interface HeroArtwork {
  /** Full-bleed section background, `lg` and up. Landscape. */
  desktop: string;
  /** Bounded 4:5 panel behind the doctor portrait, below `lg`. Portrait. */
  mobile: string;
}

/**
 * Hero artwork per locale and per breakpoint.
 *
 * **Four masters, not one flipped image.** The hero's quiet zone has to sit on
 * the opposite side in each direction — Arabic puts the copy on the inline start,
 * which is the physical right — and mirroring photographic artwork also mirrors
 * any text on packaging and the subject's own asymmetry, which reads as a
 * mistake rather than a translation. So `/ar` and `/en` get separately composed
 * files, and there is deliberately no `rtl:-scale-x-100` on the hero.
 *
 * **Two breakpoints, because one aspect ratio cannot serve both.** Measured, the
 * artwork box runs from 0.26:1 on a phone to 1.85:1 on a wide desktop. The
 * desktop entry is a landscape background; the mobile entry is a bounded 4:5
 * panel, which is why the mobile source is portrait rather than a crop of the
 * same landscape frame.
 *
 * Every entry currently points at the one existing artwork, which is landscape.
 * That is provisional and deliberately visible here rather than hidden behind a
 * fallback: it means the desktop rendering is already correct, and the mobile
 * panel is centre-cropped from a landscape source until the real portrait
 * masters land. `docs/asset-requirements.md` carries the dimensions to supply;
 * swapping each in is a one-line change per entry.
 */
const PROVISIONAL_SHARED_ARTWORK = "/images/heroSection.png";

export const HERO_ARTWORK: Record<Locale, HeroArtwork> = {
  [Locale.AR]: {
    desktop: PROVISIONAL_SHARED_ARTWORK,
    mobile: PROVISIONAL_SHARED_ARTWORK,
  },
  [Locale.EN]: {
    desktop: PROVISIONAL_SHARED_ARTWORK,
    mobile: PROVISIONAL_SHARED_ARTWORK,
  },
};

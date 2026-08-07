import type { LocalizedResult, ImageAsset, LocalizedString } from "@kira-joo/toolkit-common";

/** Mirrors `GET /api/public/doctor-profile` — a singleton. */
export interface DoctorProfile {
  name: LocalizedString;
  tagline: LocalizedString;
  avatar?: ImageAsset | null;
  avatarAlt: LocalizedString;
  bioSections: { heading?: LocalizedString; body: LocalizedString; order: number }[];
  programHeading: LocalizedString;
  programHighlights: { text: LocalizedString; order: number }[];
  whyChooseHeading: LocalizedString;
  whyChooseReasons: { text: LocalizedString; order: number }[];
  featuredInLabel: LocalizedString;
  gallery: { id: string; image: ImageAsset; altText: LocalizedString; order: number }[];
}

/**
 * The shape this app actually renders: the raw contract above with every
 * bilingual field resolved to a plain string. Derived from the raw type
 * rather than hand-written, so the two can't drift.
 */
export type LocalizedDoctorProfile = LocalizedResult<DoctorProfile>;

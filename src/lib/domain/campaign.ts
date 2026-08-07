import type { LocalizedResult, ImageAsset, LocalizedString, VideoAsset } from "@kira-joo/toolkit-common";

interface CampaignBlockBase {
  id: string;
  order: number;
}

export interface HeroBlock extends CampaignBlockBase {
  type: "hero";
  heading: LocalizedString;
  subheading?: LocalizedString;
  image?: ImageAsset | null;
  ctaLabel?: LocalizedString;
  ctaUrl?: string;
}

/** Plain multi-line text only — no HTML/rich formatting. Presentation must earn "designed" through layout, not markup. */
export interface RichTextBlock extends CampaignBlockBase {
  type: "richText";
  heading?: LocalizedString;
  body: LocalizedString;
}

export interface FeatureGridBlock extends CampaignBlockBase {
  type: "featureGrid";
  heading?: LocalizedString;
  items: { id: string; heading: LocalizedString; description?: LocalizedString }[];
}

export interface MediaBlock extends CampaignBlockBase {
  type: "media";
  image?: ImageAsset | null;
  video?: VideoAsset | null;
  caption?: LocalizedString;
}

export interface CtaBlock extends CampaignBlockBase {
  type: "cta";
  heading: LocalizedString;
  description?: LocalizedString;
  buttonLabel: LocalizedString;
  buttonUrl: string;
}

/** References a whole FaqSection by id — resolved against already-fetched FAQ data by the caller, not a second network round trip (see docs/architecture.md). */
export interface FaqRefBlock extends CampaignBlockBase {
  type: "faqRef";
  heading?: LocalizedString;
  faqSectionId: string;
}

export interface CountdownBlock extends CampaignBlockBase {
  type: "countdown";
  heading: LocalizedString;
  targetDate: string;
  expiredLabel?: LocalizedString;
}

export type CampaignBlock =
  | HeroBlock
  | RichTextBlock
  | FeatureGridBlock
  | MediaBlock
  | CtaBlock
  | FaqRefBlock
  | CountdownBlock;

/**
 * Mirrors `GET /api/public/campaigns/[slug]`. The endpoint itself already
 * enforces `status === "published"` AND `now` within `[startDate,
 * endDate]` server-side (a 404-equivalent otherwise) — this type doesn't
 * carry a `status` field because a caller that got a response at all
 * already knows the campaign is currently live.
 */
export interface Campaign {
  _id: string;
  title: LocalizedString;
  slug: string;
  startDate: string;
  endDate: string;
  blocks: CampaignBlock[];
}

/**
 * The shape this app actually renders: the raw contract above with every
 * bilingual field resolved to a plain string. Derived from the raw type
 * rather than hand-written, so the two can't drift.
 */
export type LocalizedCampaign = LocalizedResult<Campaign>;

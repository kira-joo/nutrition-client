import { getTranslations } from "next-intl/server";
import type { LocalizedReview } from "@/lib/domain/review";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import AppRoute from "@/constant/AppRoute.enum";
import { TestimonialRail } from "@/sections/home/testimonial-rail";

export interface ReviewsPreviewSectionProps {
  reviews: LocalizedReview[];
}

/**
 * Rebuilt from a static grid of `ReviewCard`s into a full-bleed,
 * continuously-travelling testimonial rail (`TestimonialRail`) with a card
 * built specifically for it (`TestimonialCard`, in `components/reviews/`)
 * rather than another visual pass on the old concept. `/reviews` itself
 * and its grid are unchanged — this is the homepage section only.
 *
 * The heading stays inside `Container` (aligned with the rest of the
 * page); the rail itself renders as `Container`'s sibling, not its child,
 * which is what makes it full-bleed — `Section` carries only vertical
 * padding, no max-width, so an unwrapped child spans edge to edge the same
 * way `CampaignBannerSection`'s full-width bar does.
 *
 * `reviews` is passed through unsorted — `TestimonialRail` interleaves
 * featured and standard itself (see `interleaveByFeatured`), which a
 * simple "featured first" sort here would have defeated.
 */
export async function ReviewsPreviewSection({ reviews }: ReviewsPreviewSectionProps) {
  if (reviews.length === 0) return null;
  const t = await getTranslations("home");

  return (
    <Section>
      <Container>
        <SectionHeader title={t("reviews.heading")} actionLabel={t("reviews.viewAll")} actionHref={AppRoute.Reviews} />
      </Container>
      <div className="mt-heading-gap">
        <TestimonialRail reviews={reviews} />
      </div>
    </Section>
  );
}

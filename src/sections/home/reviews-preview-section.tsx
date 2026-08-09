import { getTranslations } from "next-intl/server";
import type { LocalizedReview } from "@/lib/domain/review";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { RevealGroup } from "@/components/ui/reveal";
import { ReviewCard } from "@/components/reviews/review-card";
import AppRoute from "@/constant/AppRoute.enum";

export interface ReviewsPreviewSectionProps {
  reviews: LocalizedReview[];
}

/**
 * Renders the exact same `ReviewCard` the `/reviews` page uses — there is
 * no second, homepage-only review card. The previous inline version here
 * was a visibly different design (different rounding/border treatment)
 * and, because it was plain `<Image>` markup with no lightbox wiring, it
 * silently dropped the before/after and single-photo click-to-enlarge
 * feature entirely on the homepage. `className="mb-0 h-full"` neutralizes
 * the card's own default masonry margin (`ReviewCard` is normally used
 * inside a CSS-columns wall) for this grid layout instead — the same
 * override `FeaturedReviewsCarousel` already uses for its own flex
 * layout. Featured reviews are surfaced first via a stable client-side
 * sort of the already-fetched page (no server `featured` filter param
 * exists); this never re-orders across pages, only within what was
 * already fetched.
 */
export async function ReviewsPreviewSection({ reviews }: ReviewsPreviewSectionProps) {
  if (reviews.length === 0) return null;
  const t = await getTranslations("home");
  const ordered = [...reviews].sort((a, b) => Number(b.featured) - Number(a.featured));

  return (
    <Section>
      <Container>
        <SectionHeader title={t("reviews.heading")} actionLabel={t("reviews.viewAll")} actionHref={AppRoute.Reviews} />

        <RevealGroup className="mt-heading-gap grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((review) => (
            <ReviewCard key={review._id} review={review} className="mb-0 h-full" />
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}

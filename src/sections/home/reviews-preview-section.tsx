import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { resolveLocalized } from "@kira-joo/toolkit-common";
import type { Review } from "@/lib/domain/review";
import type { Locale } from "@/constant/Locale.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export interface ReviewsPreviewSectionProps {
  reviews: Review[];
  locale: Locale;
}

/**
 * One shared "quote" shell, four internal content recipes depending on
 * which fields are actually populated (text-only / image-only /
 * before-after split / text+thumbnail) — per docs/design-system.md, never
 * one canonical review shape assumed. Featured reviews are surfaced first
 * via a stable client-side sort of the already-fetched page (no server
 * `featured` filter param exists — see docs/HANDOFF.md's tech-debt table);
 * this never re-orders across pages, only within what was already fetched.
 */
export async function ReviewsPreviewSection({ reviews, locale }: ReviewsPreviewSectionProps) {
  if (reviews.length === 0) return null;
  const t = await getTranslations("home");
  const ordered = [...reviews].sort((a, b) => Number(b.featured) - Number(a.featured));

  return (
    <Section>
      <Container>
        <Reveal>
          <h2 className="text-heading-1 font-bold text-text-primary">{t("reviews.heading")}</h2>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((review, index) => (
            <Reveal key={review._id} delay={index * 0.08} className="flex flex-col overflow-hidden rounded-xl border-hairline border-border bg-surface shadow-sm">
              {review.beforeImage && review.afterImage ? (
                <div className="grid grid-cols-2">
                  <div className="relative aspect-square">
                    <Image src={review.beforeImage.secureUrl} alt="" fill sizes="20rem" className="object-cover" />
                  </div>
                  <div className="relative aspect-square">
                    <Image src={review.afterImage.secureUrl} alt="" fill sizes="20rem" className="object-cover" />
                  </div>
                </div>
              ) : review.image ? (
                <div className="relative aspect-[4/3]">
                  <Image src={review.image.secureUrl} alt="" fill sizes="24rem" className="object-cover" />
                </div>
              ) : null}

              <div className="flex flex-1 flex-col gap-3 p-5">
                {review.content && resolveLocalized(review.content, locale) && <p className="text-body text-text-secondary">“{resolveLocalized(review.content, locale)}”</p>}
                <span className="mt-auto text-body-sm font-semibold text-text-primary">{resolveLocalized(review.authorName, locale)}</span>
                {resolveLocalized(review.authorLabel, locale) && <span className="text-caption text-text-muted">{resolveLocalized(review.authorLabel, locale)}</span>}
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button href="/reviews" variant="ghost">
            {t("reviews.viewAll")}
          </Button>
        </div>
      </Container>
    </Section>
  );
}

import {
  getActiveCampaign,
  getDoctorProfile,
  getFaqSectionsWithItems,
  getPackages,
  getPackagesPageSettings,
  getRecipes,
  getReviews,
  getVideos,
} from "@/lib/data";
import { safe } from "@/lib/safe";
import type { Locale } from "@/constant/Locale.enum";
import { HeroSection } from "@/sections/home/hero-section";
import { CampaignBannerSection } from "@/sections/home/campaign-banner-section";
import { TrustBandSection } from "@/sections/shared/trust-band-section";
import { ProgramHighlightsSection } from "@/sections/shared/program-highlights-section";
import { PackagesPreviewSection } from "@/sections/home/packages-preview-section";
import { ReviewsPreviewSection } from "@/sections/home/reviews-preview-section";
import { DiscoverySection } from "@/sections/home/discovery-section";
import { FaqPreviewSection } from "@/sections/home/faq-preview-section";
import { ClosingCtaSection } from "@/sections/shared/closing-cta-section";

interface HomePageProps {
  params: { locale: Locale };
}

/**
 * Every source fetched independently and defensively (`safe()`) — a
 * reviews-fetch failure must never blank out packages, and vice versa.
 * `doctorProfile` is the one exception: without it there's no hero, so a
 * failure there is allowed to propagate to the route's error boundary
 * rather than rendering a heroless homepage.
 *
 * `locale` is passed to the data layer, not down into sections: each data
 * function localizes its payload immediately after fetching, so sections
 * receive resolved strings and never see `{ ar, en }`.
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params;

  const [doctorProfile, activeCampaign, packagesPageSettings, packages, reviewsResult, recipesResult, videosResult, faqSections] =
    await Promise.all([
      getDoctorProfile(locale),
      safe(() => getActiveCampaign(locale)),
      safe(() => getPackagesPageSettings(locale)),
      safe(() => getPackages(locale)),
      safe(() => getReviews(locale, { limit: 6 })),
      safe(() => getRecipes(locale, { limit: 8 })),
      safe(() => getVideos(locale, { limit: 6 })),
      safe(() => getFaqSectionsWithItems(locale)),
    ]);

  return (
    <>
      <HeroSection doctorProfile={doctorProfile} />
      <CampaignBannerSection campaign={activeCampaign} />
      <TrustBandSection doctorProfile={doctorProfile} />
      <ProgramHighlightsSection doctorProfile={doctorProfile} />
      {packagesPageSettings && packages && <PackagesPreviewSection packages={packages} packagesPageSettings={packagesPageSettings} />}
      {reviewsResult && <ReviewsPreviewSection reviews={reviewsResult.data} />}
      {/* One section, not two: an empty recipes rail and an empty videos rail would read as two broken bands, so DiscoverySection renders nothing at all unless at least one of them has content. */}
      <DiscoverySection recipes={recipesResult?.data ?? []} videos={videosResult?.data ?? []} />
      {faqSections && <FaqPreviewSection faqSections={faqSections} />}
      <ClosingCtaSection />
    </>
  );
}

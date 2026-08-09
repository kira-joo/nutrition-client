import {
  getActiveCampaign,
  getDoctorProfile,
  getFaqSectionsWithItems,
  getPackages,
  getPackagesPageSettings,
  getRecipes,
  getReviews,
  getSiteSettings,
  getVideos,
} from "@/lib/data";
import { safe } from "@/lib/safe";
import type { Locale } from "@/constant/Locale.enum";
import { HeroSection } from "@/sections/home/hero-section";
import { CampaignBannerSection } from "@/sections/home/campaign-banner-section";
import { DoctorPreviewSection } from "@/sections/home/doctor-preview-section";
import { TrustBandSection } from "@/sections/shared/trust-band-section";
import { ProgramHighlightsSection } from "@/sections/shared/program-highlights-section";
import { PackagesPreviewSection } from "@/sections/home/packages-preview-section";
import { ReviewsPreviewSection } from "@/sections/home/reviews-preview-section";
import { RecipesPreviewSection } from "@/sections/home/recipes-preview-section";
import { VideosPreviewSection } from "@/sections/home/videos-preview-section";
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

  const [doctorProfile, activeCampaign, packagesPageSettings, packages, siteSettings, reviewsResult, recipesResult, videosResult, faqSections] =
    await Promise.all([
      getDoctorProfile(locale),
      safe(() => getActiveCampaign(locale)),
      safe(() => getPackagesPageSettings(locale)),
      safe(() => getPackages(locale)),
      safe(() => getSiteSettings(locale)),
      safe(() => getReviews(locale, { limit: 6 })),
      safe(() => getRecipes(locale, { limit: 3 })),
      safe(() => getVideos(locale, { limit: 3 })),
      safe(() => getFaqSectionsWithItems(locale)),
    ]);
  // Mirrors the shell's own fallback (layout.tsx) for the same reason: a
  // packages-specific currency shouldn't be blocked on an unrelated
  // Site Settings hiccup.
  const currencyCode = siteSettings?.currencyCode ?? "EGP";

  return (
    <>
      <HeroSection doctorProfile={doctorProfile} />
      <CampaignBannerSection campaign={activeCampaign} />
      <TrustBandSection doctorProfile={doctorProfile} />
      <ProgramHighlightsSection doctorProfile={doctorProfile} />
      <DoctorPreviewSection doctorProfile={doctorProfile} />
      {packagesPageSettings && packages && (
        <PackagesPreviewSection packages={packages} packagesPageSettings={packagesPageSettings} currencyCode={currencyCode} />
      )}
      {reviewsResult && <ReviewsPreviewSection reviews={reviewsResult.data} />}
      {recipesResult && <RecipesPreviewSection recipes={recipesResult.data} />}
      {videosResult && <VideosPreviewSection videos={videosResult.data} />}
      {faqSections && <FaqPreviewSection faqSections={faqSections} />}
      <ClosingCtaSection />
    </>
  );
}

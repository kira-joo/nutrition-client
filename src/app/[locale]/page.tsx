import { getDoctorProfile, getFaqSectionsWithItems, getPackages, getPackagesPageSettings, getReviews } from "@/lib/data";
import { safe } from "@/lib/safe";
import type { Locale } from "@/constant/Locale.enum";
import { HeroSection } from "@/sections/home/hero-section";
import { TrustBandSection } from "@/sections/home/trust-band-section";
import { ProgramHighlightsSection } from "@/sections/home/program-highlights-section";
import { PackagesPreviewSection } from "@/sections/home/packages-preview-section";
import { ReviewsPreviewSection } from "@/sections/home/reviews-preview-section";
import { FaqPreviewSection } from "@/sections/home/faq-preview-section";
import { ClosingCtaSection } from "@/sections/home/closing-cta-section";

interface HomePageProps {
  params: { locale: Locale };
}

/**
 * Every source fetched independently and defensively (`safe()`) — a
 * reviews-fetch failure must never blank out packages, and vice versa.
 * `doctorProfile` is the one exception: without it there's no hero, so a
 * failure there is allowed to propagate to the route's error boundary
 * rather than rendering a heroless homepage.
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params;

  const [doctorProfile, packagesPageSettings, packages, reviewsResult, faqSections] = await Promise.all([
    getDoctorProfile(),
    safe(() => getPackagesPageSettings()),
    safe(() => getPackages()),
    safe(() => getReviews({ limit: 6 })),
    safe(() => getFaqSectionsWithItems()),
  ]);

  return (
    <>
      <HeroSection doctorProfile={doctorProfile} locale={locale} />
      <TrustBandSection doctorProfile={doctorProfile} locale={locale} />
      <ProgramHighlightsSection doctorProfile={doctorProfile} locale={locale} />
      {packagesPageSettings && packages && <PackagesPreviewSection packages={packages} packagesPageSettings={packagesPageSettings} locale={locale} />}
      {reviewsResult && <ReviewsPreviewSection reviews={reviewsResult.data} locale={locale} />}
      {faqSections && <FaqPreviewSection faqSections={faqSections} locale={locale} />}
      <ClosingCtaSection />
    </>
  );
}

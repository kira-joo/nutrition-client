import { notFound } from "next/navigation";
import type { Locale } from "@/constant/Locale.enum";
import { getCampaign, getFaqSectionsWithItems } from "@/lib/data";
import { CampaignBlockRenderer } from "@/components/campaigns/campaign-block-renderer";

interface CampaignPageProps {
  params: { locale: Locale; slug: string };
}

/**
 * Deliberately a plain, unwrapped async Server Component — no `Suspense`
 * boundary here, and no sibling `loading.tsx` for this exact segment,
 * matching `/recipes/[id]/page.tsx`'s own shape exactly. Once a page's
 * response starts streaming (which any Suspense boundary around it
 * triggers, whether from a sibling `loading.tsx` or an inline
 * `<Suspense>`), Next.js has already committed the HTTP status by the
 * time an inner `notFound()` runs — a wrong/expired slug measured as a
 * 200 with not-found-shaped content instead of a real 404. Only a plain,
 * fully-awaited async component lets `notFound()` set the status before
 * anything is sent. The tradeoff (no bespoke loading skeleton for this
 * route) mirrors the same accepted tradeoff on `/recipes/[id]`.
 *
 * `getCampaign` returns `null` for anything that isn't currently a real,
 * published, in-date-range campaign (wrong slug, draft, expired, not yet
 * started — all indistinguishable on purpose, enforced server-side)
 * rather than throwing, so that becomes this real 404.
 *
 * FAQ data is fetched only when a block actually needs it — most
 * campaigns won't reference a FAQ section, and `faqRef` resolves against
 * already-fetched data rather than adding a second round trip for every
 * campaign that doesn't use the block type at all.
 */
export default async function CampaignPage({ params }: CampaignPageProps) {
  const campaign = await getCampaign(params.slug, params.locale);
  if (!campaign) notFound();

  const needsFaq = campaign.blocks.some((block) => block.type === "faqRef");
  const faqSections = needsFaq ? await getFaqSectionsWithItems(params.locale) : [];

  return <CampaignBlockRenderer blocks={campaign.blocks} faqSections={faqSections} campaignTitle={campaign.title} />;
}

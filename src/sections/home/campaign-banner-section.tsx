import { Megaphone } from "lucide-react";
import type { LocalizedCampaign } from "@/lib/domain/campaign";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { appHref } from "@/constant/AppRoute.enum";

export interface CampaignBannerSectionProps {
  campaign: LocalizedCampaign | null;
}

/**
 * The homepage banner deferred from Phase 6.1: appears only when
 * nutrition-staff resolves a real, currently published, in-date-range
 * active campaign (`getActiveCampaign` — never a raw
 * `SiteSettings.activeCampaignId` this app would have to resolve itself).
 * Renders nothing when there isn't one; never a fabricated placeholder
 * campaign.
 *
 * Deliberately slim — a full hero-sized treatment here would compete with
 * the homepage's own hero, and the campaign's own page is where its actual
 * hero block gets to be the main event. This is a teaser/link, not a
 * second homepage section pretending to be the first.
 */
export function CampaignBannerSection({ campaign }: CampaignBannerSectionProps) {
  if (!campaign) return null;

  return (
    <Link
      href={appHref.campaign(campaign.slug)}
      className="focus-ring-on-dark block bg-accent text-white transition-colors duration-fast hover:bg-accent/90"
    >
      <Container className="flex items-center justify-center gap-2 py-3 text-center">
        <Megaphone aria-hidden="true" className="size-icon-sm shrink-0" />
        <span className="text-body-sm font-semibold">{campaign.title}</span>
      </Container>
    </Link>
  );
}

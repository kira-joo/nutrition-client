import { Container } from "@/components/ui/container";
import { CampaignCta } from "@/components/campaigns/campaign-cta";
import type { LocalizedCtaBlock } from "@/lib/domain/campaign";

export interface CtaBlockProps {
  block: LocalizedCtaBlock;
}

/**
 * A high-contrast band, visually related to the homepage's closing CTA
 * (`bg-primary`, same family) so a campaign's own closing moment feels like
 * it belongs to the same site rather than a bespoke one-off.
 */
export function CtaBlock({ block }: CtaBlockProps) {
  return (
    <div className="bg-primary py-16 text-center">
      <Container width="narrow" className="flex flex-col items-center gap-4">
        <h2 className="text-heading-1 font-bold text-white">{block.heading}</h2>
        {block.description && <p className="max-w-xl text-body-lg text-white/90">{block.description}</p>}
        <CampaignCta label={block.buttonLabel} url={block.buttonUrl} variant="secondary" className="mt-2" />
      </Container>
    </div>
  );
}

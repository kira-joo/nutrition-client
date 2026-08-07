import { Button, type ButtonVariant } from "@/components/ui/button";

export interface CampaignCtaProps {
  label: string;
  /** CMS-authored — an internal app path (starts with `/`) or a full external URL. Never assumed to be one or the other. */
  url: string;
  variant?: ButtonVariant;
  className?: string;
}

/**
 * Shared by `HeroBlock` and `CtaBlock` (the only two block types with a
 * CMS-authored `ctaUrl`/`buttonUrl`): a campaign author can point a button
 * at either an internal page (`/consultation`, `/packages`) or an external
 * one (a WhatsApp link, a partner site) — `Button` only knows how to be a
 * locale-aware internal `Link` by default, so this decides which case it is
 * rather than assuming, using `Button`'s `external` escape hatch for the
 * off-site case instead of ad hoc anchor markup.
 */
export function CampaignCta({ label, url, variant = "primary", className }: CampaignCtaProps) {
  if (url.startsWith("/")) {
    return (
      <Button href={url} variant={variant} className={className}>
        {label}
      </Button>
    );
  }

  return (
    <Button href={url} external variant={variant} className={className}>
      {label}
    </Button>
  );
}

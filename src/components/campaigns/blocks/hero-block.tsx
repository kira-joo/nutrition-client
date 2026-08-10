import Image from "next/image";
import { cn } from "@/lib/cn";
import type { LocalizedHeroBlock } from "@/lib/domain/campaign";
import { CampaignCta } from "@/components/campaigns/campaign-cta";

export interface HeroBlockProps {
  block: LocalizedHeroBlock;
  /**
   * The page's `<h1>` is whichever heading a visitor actually meets first
   * — a hero opening the page IS that heading; a hero appearing later
   * (or not at all, handled by the renderer's own sr-only fallback) is
   * not, and must not create a second `<h1>`. Defaults to `1` since a
   * hero is the common case for a campaign's opening block.
   */
  headingLevel?: 1 | 2;
}

/**
 * Full-bleed image with a scrim gradient behind the heading, per the design
 * brief's campaign hero treatment — the one block type a campaign is most
 * likely to open with, so it gets the most "occasion" presentation on the
 * page (docs/design-system.md's card-family variety rule applies to blocks
 * too, not just top-level page sections).
 */
export function HeroBlock({ block, headingLevel = 1 }: HeroBlockProps) {
  const hasImage = Boolean(block.image);
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <div className="relative flex min-h-[28rem] items-end overflow-hidden bg-surface-muted sm:min-h-[34rem]">
      {block.image && (
        <Image
          src={block.image.secureUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          placeholder={block.image.placeholderUrl ? "blur" : undefined}
          blurDataURL={block.image.placeholderUrl}
        />
      )}
      {/* Scrim only when there's an image to darken — an imageless hero needs no gradient over a flat surface color. */}
      {hasImage && <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />}

      <div className="relative z-10 flex w-full flex-col gap-3 px-4 pb-10 pt-24 sm:px-8 sm:pb-14 lg:px-12">
        <Heading className={cn("max-w-3xl text-display font-extrabold", hasImage ? "text-white" : "text-text-primary")}>{block.heading}</Heading>
        {block.subheading && (
          <p className={cn("max-w-2xl text-body-lg", hasImage ? "text-white/90" : "text-text-secondary")}>{block.subheading}</p>
        )}
        {block.ctaLabel && block.ctaUrl && (
          <CampaignCta label={block.ctaLabel} url={block.ctaUrl} variant="primary" className="mt-4 self-start" />
        )}
      </div>
    </div>
  );
}

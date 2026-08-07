import type { LocalizedCampaignBlock } from "@/lib/domain/campaign";
import type { LocalizedFaqSectionWithItems } from "@/lib/domain/faq";
import { Reveal } from "@/components/ui/reveal";
import { HeroBlock } from "@/components/campaigns/blocks/hero-block";
import { RichTextBlock } from "@/components/campaigns/blocks/rich-text-block";
import { FeatureGridBlock } from "@/components/campaigns/blocks/feature-grid-block";
import { MediaBlock } from "@/components/campaigns/blocks/media-block";
import { CtaBlock } from "@/components/campaigns/blocks/cta-block";
import { FaqRefBlock } from "@/components/campaigns/blocks/faq-ref-block";
import { CountdownBlock } from "@/components/campaigns/blocks/countdown-block";

export interface CampaignBlockRendererProps {
  blocks: LocalizedCampaignBlock[];
  /** Only actually read by a `faqRef` block — the page fetches this conditionally, only when at least one block needs it. */
  faqSections: LocalizedFaqSectionWithItems[];
  /** Every campaign has this unconditionally — the fallback `<h1>` source when the page doesn't open with a hero block. */
  campaignTitle: string;
}

/**
 * One typed registry, not a giant switch full of page-specific markup —
 * each block type maps to exactly one component that owns its own
 * layout/spacing entirely. No shared wrapper imposes one rhythm on every
 * block: a hero is full-bleed, a cta is a colored band, richText wants a
 * narrow reading measure, and forcing all three through one shared
 * `<Section><Container>` shell would flatten exactly the visual variety
 * the design brief asks for (docs/design-system.md's card-family rule
 * applies at the block level too, not just the page-section level).
 *
 * An unrecognized `type` — nutrition-staff shipping a block type this
 * frontend hasn't caught up to yet — throws immediately in development
 * (schema drift should be loud for whoever's building against it) but is
 * skipped silently in production: one unrenderable block must never take
 * an entire campaign page down for a real visitor.
 */
export function CampaignBlockRenderer({ blocks, faqSections, campaignTitle }: CampaignBlockRendererProps) {
  const ordered = [...blocks].sort((a, b) => a.order - b.order);
  // Every other block type is hardcoded `<h2>` (see each block's own
  // heading markup) — the only genuinely contextual heading is the page's
  // `<h1>` itself, and only a hero opening the page can supply it visibly.
  // A campaign that doesn't open with one still needs exactly one real
  // `<h1>` for correct document structure, so an sr-only fallback (built
  // from a field every campaign has unconditionally) fills that role
  // without duplicating a heading a sighted visitor would otherwise see
  // twice.
  const firstBlockIsHero = ordered[0]?.type === "hero";

  return (
    <>
      {!firstBlockIsHero && <h1 className="sr-only">{campaignTitle}</h1>}
      {ordered.map((block, index) => {
        switch (block.type) {
          case "hero":
            // Never scroll-revealed, matching the homepage's own hero —
            // a hero is the common opener and typically already in the
            // viewport at load, where a scroll-triggered animation either
            // doesn't fire meaningfully or reads as an unwanted delay on
            // the first thing a visitor sees.
            return <HeroBlock key={block.id} block={block} headingLevel={index === 0 ? 1 : 2} />;
          case "richText":
            return (
              <Reveal key={block.id}>
                <RichTextBlock block={block} />
              </Reveal>
            );
          case "featureGrid":
            return (
              <Reveal key={block.id}>
                <FeatureGridBlock block={block} />
              </Reveal>
            );
          case "media":
            // Media and countdown get the "occasion" treatment (a drop-in
            // from above) rather than the standard content rise, matching
            // the design brief's call for these two block types to carry
            // the most presence on the page.
            return (
              <Reveal key={block.id} direction="down">
                <MediaBlock block={block} />
              </Reveal>
            );
          case "cta":
            return (
              <Reveal key={block.id}>
                <CtaBlock block={block} />
              </Reveal>
            );
          case "faqRef":
            return (
              <Reveal key={block.id}>
                <FaqRefBlock block={block} faqSections={faqSections} />
              </Reveal>
            );
          case "countdown":
            return (
              <Reveal key={block.id} direction="down">
                <CountdownBlock block={block} />
              </Reveal>
            );
          default: {
            // Exhaustiveness check: adding a block type to the union
            // without a case above fails the build right here. Real
            // network data isn't bound by that compile-time guarantee
            // though, so this still needs to behave correctly against an
            // actual unrecognized `type` string at runtime.
            const unrecognized = block as { id: string; type: string };
            if (process.env.NODE_ENV === "development") {
              throw new Error(`Unknown campaign block type "${unrecognized.type}" (block id: ${unrecognized.id})`);
            }
            console.error(`[campaign] Unknown block type "${unrecognized.type}" (block id: ${unrecognized.id}) — skipped`);
            return null;
          }
        }
      })}
    </>
  );
}

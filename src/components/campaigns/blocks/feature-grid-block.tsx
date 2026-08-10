import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/container";
import type { LocalizedFeatureGridBlock } from "@/lib/domain/campaign";

export interface FeatureGridBlockProps {
  block: LocalizedFeatureGridBlock;
}

/**
 * An offset 2-column arrangement on larger screens (not a plain 3-up grid —
 * the homepage's trust/program bands already own that shape, and per the
 * anti-repetition rule a campaign block needs its own identity) that
 * collapses to a single column on mobile. Item count is author-controlled
 * and unbounded, so the layout has to stay coherent whether there are 2
 * items or 8 — a CSS grid with auto rows does that without a special case
 * per count.
 */
export function FeatureGridBlock({ block }: FeatureGridBlockProps) {
  if (block.items.length === 0) return null;

  return (
    <Container>
      {block.heading && <h2 className="text-heading-1 font-bold text-text-primary">{block.heading}</h2>}
      <ul className={cn("grid gap-x-8 gap-y-10 sm:grid-cols-2", block.heading && "mt-8")}>
        {block.items.map((item, index) => (
          <li key={item.id} className={index % 2 === 1 ? "sm:mt-10" : undefined}>
            <h3 className="text-heading-3 font-bold text-text-primary">{item.heading}</h3>
            {item.description && <p className="mt-2 text-body text-text-secondary">{item.description}</p>}
          </li>
        ))}
      </ul>
    </Container>
  );
}

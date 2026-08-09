import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  /** Appended after `title` in `text-primary` — e.g. PackagesPageSettings' separately-authored `title` + `titleAccent` pair. */
  titleAccent?: string;
  description?: string;
  /** Both required together, or neither — a CTA with no destination isn't renderable, and a bare href with no label has nothing accessible to read. */
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

/**
 * The one heading+CTA composition every homepage preview section with a
 * "view the full page" destination uses — title/description on one side,
 * the action on the other, above the content rather than a small text
 * link centered underneath it. Previously each section (Recipes,
 * Packages, Reviews, Videos, FAQ) reimplemented this heading block by
 * hand, and the CTA lived in its own centered `<div>` below the grid; that
 * pattern is retired entirely in favor of this one primitive.
 *
 * RTL/LTR need no JS branching: `sm:flex-row` plus logical flow already
 * puts the action on the correct side under `dir="rtl"` (CSS Grid/Flex
 * respect direction automatically), and the arrow icon mirrors via the
 * `rtl:` variant already used elsewhere in this codebase (e.g.
 * `recipe-detail.tsx`'s back link) rather than a `useIsRtl()` check.
 *
 * Below `sm`, the action wraps onto its own line rather than being
 * squeezed into a narrow row next to the title — still left-aligned
 * (RTL: end-aligned) and full-width-tappable, never shrunk to fit.
 */
export function SectionHeader({ eyebrow, title, titleAccent, description, actionLabel, actionHref, className }: SectionHeaderProps) {
  const hasAction = Boolean(actionLabel && actionHref);

  return (
    <Reveal className={cn("flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex flex-col items-start gap-2">
        {eyebrow && <p className="text-label font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>}
        <h2 className="text-heading-1 font-bold text-text-primary">
          {title} {titleAccent && <span className="text-primary">{titleAccent}</span>}
        </h2>
        {description && <p className="max-w-narrow text-body text-text-secondary">{description}</p>}
      </div>

      {hasAction && (
        <Button href={actionHref!} variant="soft" className="group shrink-0 self-start sm:self-end">
          {actionLabel}
          <ArrowRight
            aria-hidden="true"
            className="size-icon-sm shrink-0 rtl:-scale-x-100 motion-safe:transition-transform motion-safe:duration-base motion-safe:ease-standard motion-safe:group-hover:translate-x-1 rtl:motion-safe:group-hover:-translate-x-1"
          />
        </Button>
      )}
    </Reveal>
  );
}

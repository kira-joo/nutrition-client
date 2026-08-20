import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { LABEL_TYPE } from "@/components/ui/typography";

export interface PageHeaderProps {
  title: ReactNode;
  /**
   * Rendered after `title` in the brand colour. Exists because the CMS authors
   * `title` and `titleAccent` as two separate fields (PackagesPageSettings), so
   * the emphasis is content, not markup a component may invent.
   */
  titleAccent?: string;
  eyebrow?: string;
  description?: ReactNode;
  /**
   * Heading level, which also selects the scale and the text cluster's spacing:
   * `h1` renders `text-display` with `gap-3`, `h2` renders `text-heading-1` with
   * `gap-2`. Level and presentation are conceptually independent, and are tied
   * together here only because the two call sites this serves happen to pair
   * them that way — a page owns one `h1` masthead, a section inside it an `h2`.
   * Split them the day a real consumer needs a different pairing, not before.
   */
  as?: "h1" | "h2";
  /** Centres the whole block. Only the consultation page needs it. */
  align?: "start" | "center";
  /**
   * Renders the description one step larger. For a short page that opens with a
   * genuine lead paragraph rather than a supporting line — the FAQ empty state
   * and the consultation intro.
   */
  lead?: boolean;
  /**
   * Both fields or neither: a CTA with no destination cannot render, and an
   * href with no label has nothing for a screen reader to announce.
   */
  action?: { label: string; href: string };
  className?: string;
}

/**
 * The page/section heading block: optional eyebrow, a heading, an optional
 * description, and an optional action opposite them.
 *
 * Seven page sections had each rebuilt this — videos, recipes, reviews, books,
 * consultation and both FAQ branches — agreeing on the substance and differing
 * only by accident: four different wrapper elements, `items-start` on some,
 * `gap-3` on most but `mt-3` on one, and `max-w-narrow` on the description
 * sometimes. None of those differences was a decision anyone made.
 *
 * `max-w-narrow` on the description is now unconditional, which sounds like a
 * change and is not: inside a `width="narrow"` container the same value is
 * already the available width, so it resolves to no constraint at all. That is
 * what let the prop disappear instead of becoming a flag.
 *
 * **No animation here, deliberately** — but the wrapper stays wherever it was.
 * `SectionHeader` wraps this in `Reveal`, and so do the videos and books page
 * headers, which had one before. Whether a given header reveals is the call
 * site's decision and was left exactly as found; what moved out is only the
 * *coupling*. Baking the reveal into the heading is what made a plain,
 * non-animating page header impossible to express, which is a large part of why
 * there were seven copies of this block.
 *
 * Kept free of CMS types, `next-intl` and Motion: every value arrives as a plain
 * prop. If the redesign gives this a second consuming app it can move to the
 * toolkit unchanged, which is the promotion criterion doc 04 sets out.
 */
export function PageHeader({
  title,
  titleAccent,
  eyebrow,
  description,
  as: Heading = "h1",
  align = "start",
  lead = false,
  action,
  className,
}: PageHeaderProps) {
  const centred = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        /* The action sits opposite the text from `sm` up, and wraps onto its own
           line below that rather than being squeezed into a narrow row. Logical
           flow puts it on the correct side under RTL with no JS branching. */
        action && "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col",
          /* Follows the level, like the scale does, and reproduces both callers
             exactly: the page headers used `gap-3`, `SectionHeader` used
             `gap-2`. A section heading is smaller, so the same gap around it
             reads as looser — matching them was never arbitrary. */
          Heading === "h1" ? "gap-3" : "gap-2",
          centred ? "items-center text-center" : "items-start"
        )}
      >
        {eyebrow ? <p className={cn(LABEL_TYPE, "text-accent")}>{eyebrow}</p> : null}
        <Heading
          className={cn(
            "text-text-primary",
            Heading === "h1" ? "text-display font-extrabold" : "text-heading-1 font-bold"
          )}
        >
          {title}
          {titleAccent ? <> <span className="text-primary">{titleAccent}</span></> : null}
        </Heading>
        {description ? (
          <p className={cn("max-w-narrow text-text-secondary", lead ? "text-body-lg" : "text-body", centred && "mx-auto")}>
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <Button href={action.href} variant="soft" className="group shrink-0 self-start sm:self-end">
          {action.label}
          {/* Mirrors under RTL via the `rtl:` variant rather than a direction
              check, matching how every other directional icon here works. */}
          <ArrowRight
            aria-hidden="true"
            className="size-icon-sm shrink-0 rtl:-scale-x-100 motion-safe:transition-transform motion-safe:duration-base motion-safe:ease-standard motion-safe:group-hover:translate-x-1 rtl:motion-safe:group-hover:-translate-x-1"
          />
        </Button>
      ) : null}
    </div>
  );
}

import { Reveal } from "@/components/ui/reveal";
import { PageHeader } from "@/components/ui/page-header";

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  /** Appended after `title` in `text-primary` — e.g. PackagesPageSettings' separately-authored `title` + `titleAccent` pair. */
  titleAccent?: string;
  description?: string;
  /** Both required together, or neither — a CTA with no destination isn't renderable, and a bare href with no label has nothing accessible to read. */
  actionLabel?: string;
  actionHref?: string;
}

/**
 * The heading+CTA composition every homepage preview section with a "view the
 * full page" destination uses — title and description on one side, the action on
 * the other, above the content rather than a small text link centred underneath.
 *
 * Now just `PageHeader` inside a `Reveal`. The composition itself, the RTL
 * mirroring and the responsive wrap all live in `PageHeader`, which the page-level
 * headers share; the only thing this adds is the scroll reveal, and the only
 * thing it fixes is the heading level — a preview section sits under a page that
 * already owns the `h1`.
 *
 * `actionLabel`/`actionHref` stay two flat props here rather than `PageHeader`'s
 * single `action` object, because that is the signature its five consumers
 * (Recipes, Packages, Reviews, Videos, FAQ previews) already use.
 *
 * `className` is gone rather than forwarded. It had no consumers, and it used to
 * land on the outer `Reveal` — where a margin or grid-placement class needs to
 * be — so passing it through to `PageHeader` would have kept the name while
 * quietly changing what it did. Reintroduce it on the `Reveal` if a caller ever
 * needs it.
 */
export function SectionHeader({
  eyebrow,
  title,
  titleAccent,
  description,
  actionLabel,
  actionHref,
}: SectionHeaderProps) {
  return (
    <Reveal>
      <PageHeader
        as="h2"
        eyebrow={eyebrow}
        title={title}
        titleAccent={titleAccent}
        description={description}
        action={actionLabel && actionHref ? { label: actionLabel, href: actionHref } : undefined}
      />
    </Reveal>
  );
}

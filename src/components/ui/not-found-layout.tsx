import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export interface NotFoundLayoutProps {
  /** Names the kind of thing that is missing — a compass for the site, a book for a book. */
  icon: LucideIcon;
  title: string;
  /**
   * Optional, and genuinely so. A recipe or video that does not exist needs no
   * elaboration; a campaign might have ended or not started yet, which is worth
   * saying because it tells someone the link was not broken.
   */
  description?: string;
  action: { href: string; label: string };
  /**
   * Forces text direction for a route that renders in one language regardless
   * of the active locale. Only `/ar/books/[slug]` needs it: Books is
   * Arabic-only end to end (see `middleware.ts`), so its copy is hardcoded
   * Arabic rather than translated, and it must read right-to-left even though
   * nothing about the surrounding locale guarantees that.
   */
  dir?: "rtl" | "ltr";
}

/**
 * The shared shape of every "this does not exist" page.
 *
 * Five routes had rebuilt it: the `[locale]` boundary plus one each for books,
 * videos, recipes and campaigns. They agreed on everything that matters — a
 * muted icon, one heading, an optional line of explanation, and a single way
 * back — and disagreed only by accident. Two of the five had lost the `py-16`
 * that gave the other three room to breathe, so those two 404s sat noticeably
 * tighter for no reason anyone chose. Collapsing them fixes that by making the
 * spacing a property of the layout rather than of whoever wrote the page.
 *
 * What deliberately stays per-route is the part that is actually different:
 * the icon, the copy, and where "back" goes. A missing recipe returns to the
 * recipe catalogue, not to the homepage — routing someone to the top of the
 * site after they followed a dead recipe link is the kind of small
 * carelessness this component must not centralise away.
 *
 * A Server Component with no client JS, like the pages it replaces. Nothing
 * here is interactive beyond a link.
 */
export function NotFoundLayout({ icon: Icon, title, description, action, dir }: NotFoundLayoutProps) {
  return (
    <Section>
      <Container width="narrow" className="flex flex-col items-center gap-4 py-16 text-center" dir={dir}>
        <Icon aria-hidden="true" className="size-icon-xl text-text-muted" />
        <h1 className="text-heading-1 font-bold text-text-primary">{title}</h1>
        {description ? <p className="text-body text-text-secondary">{description}</p> : null}
        <Button href={action.href} variant="secondary" className="mt-2">
          {action.label}
        </Button>
      </Container>
    </Section>
  );
}

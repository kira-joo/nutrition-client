import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Mail, Phone } from "lucide-react";
import type { LocalizedSiteSettings } from "@/lib/domain/site-settings";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";
import { ARABIC_ONLY_NAV_KEYS, PRIMARY_NAV_ITEMS, MORE_NAV_ITEMS } from "@/components/layout/site-header/nav-items";
import { LABEL_TYPE } from "@/components/ui/typography";
import { SocialIcon } from "./social-icon";
import { FooterBotanical } from "./footer-botanical";

export interface SiteFooterProps {
  siteSettings: LocalizedSiteSettings;
  clinicName: string;
  /** `doctorProfile.tagline` — the real short description this footer uses; absent only when the shell's defensive doctor-profile fetch failed. */
  doctorTagline?: string;
}

/** Shared by every plain (non-filled) interactive element sitting directly
 * on the dark inverse surface — nav links, social icons, contact links.
 * `focus-ring-inverse` is required here specifically: the site-wide default
 * `:focus-visible` ring measures only 2.78:1 against `surface-inverse`
 * (fails the 3:1 non-text/UI-indicator threshold), so every focusable
 * element on this surface needs the white inverse ring instead. */
const INVERSE_LINK =
  "text-body-sm text-on-inverse-muted transition-colors duration-fast pointer:hover:text-on-inverse focus-ring-inverse " +
  /* Each row is a real `--touch-target-min` (44px) target rather than a ~34px
     line of text, using the project's own token so the footer cannot drift from
     the minimum the rest of the app is held to.

     Enlarged by POINTER CAPABILITY, not viewport width. `sm:min-h-0` was wrong
     and shipped that way once: a 768px tablet is wide enough to pass an `sm`
     breakpoint and still has no mouse, so it got the 34px rows straight back.
     `touch:` asks `any-pointer: coarse`, which also covers a touchscreen laptop
     whose primary pointer is a trackpad. Centring is still a phone-composition
     decision, so that one stays on `sm`. */
  "flex items-center justify-center touch:min-h-touch-min sm:justify-start";

/**
 * Column heading: centred on phones with the rest of the composition, and back
 * to inline-start from `sm` up where the real columns exist.
 *
 * Rendered as `h2`, not `h3`. These are top-level sections of the footer
 * landmark — siblings of each other, subordinate to nothing but the page `h1` —
 * so `h3` was a skipped level. It only *showed* on `/reviews`, the one page whose
 * own content has no `h2`: everywhere else a content heading happened to bridge
 * the gap, which is exactly why an outline bug like this survives a page-by-page
 * look. The visual size is unchanged; it comes from `LABEL_TYPE`, not the tag.
 */
const COLUMN_HEADING = `flex items-center justify-center gap-2 ${LABEL_TYPE} text-on-inverse-muted sm:justify-start`;

/**
 * "Botanical Trust" — the footer's dark brand-green surface now does real
 * compositional work instead of just being a dark strip: the real
 * `footer-leaf.png` artwork anchors the brand corner (see
 * `FooterBotanical`), and a small terracotta (`--color-accent`) detail
 * marks each column heading — the one deliberate, restrained use of the
 * secondary accent here, never a primary action color.
 *
 * Still a Server Component with zero client JS (`getTranslations`, not
 * `useTranslations`): nothing here needs interactivity beyond plain
 * navigation and mailto/tel links, and no animation was worth trading that
 * away for — a subtle reveal/drift would need either a new keyframe token
 * (out of scope: token vocabulary changes belong to the primary session)
 * or a Client Component + Motion for a marginal decorative gain, which
 * fails the "restraint" bar for a footer.
 *
 * Four columns: brand (real logo + the doctor's own tagline + socials),
 * the primary nav, the "More" nav (replacing the old fourth column that
 * just repeated the clinic name with nothing new in it), and contact.
 * Deliberately no newsletter form — that capability doesn't exist
 * server-side (the old dead route was removed on purpose), and a
 * decorative form with nowhere to submit would be worse than no form.
 *
 * **Phones get their own composition, not the desktop columns stacked.**
 * Collapsing four inline-start-aligned columns into one narrow column read
 * as badly lopsided, and measurably so at 375px in Arabic: the logo chip
 * left 243px of dead space beside it, and every short nav word ("الكتب",
 * "المزيد") hugged the right edge of a full-width box, so the whole footer
 * leaned into one margin. Two things fix it here, and neither is a
 * text-alignment tweak alone:
 *
 *   1. The brand block, its tagline and the social row centre on phones and
 *      return to inline-start from `sm` up.
 *   2. The two short nav groups sit side by side in a real two-column grid
 *      below the brand, with contact spanning both. Eight one-word links in
 *      a single column was the actual source of the height — pairing them
 *      fills the width honestly rather than centring a tall thin list, and
 *      takes the footer from 929px to roughly two thirds of that.
 *
 * Centring is a *composition* decision and not an RTL one: Arabic still
 * reads right-to-left inside every block (`dir` is untouched, logical
 * properties throughout), so "RTL" never gets misread as "everything hugs
 * the right edge". Link rows are also real 44px touch targets, from the
 * project's own `--touch-target-min` and relaxed by pointer capability rather
 * than by viewport width, so a touch tablet keeps them.
 */
export async function SiteFooter({ siteSettings, clinicName, doctorTagline }: SiteFooterProps) {
  const t = await getTranslations("layout");
  const year = new Date().getFullYear();
  const sortedSocialLinks = [...siteSettings.socialLinks].sort((a, b) => a.order - b.order);

  return (
    <footer className="relative overflow-hidden bg-surface-inverse">
      <Container width="wide" className="relative py-section-y-sm">
        <FooterBotanical />

        {/* `relative z-10`: guarantees this stacks above the absolutely
            positioned (z-index:auto) botanical layer regardless of DOM
            order, so real content is never visually obscured by it. */}
        <div className="relative z-10">
          {/* Two columns from the very smallest width, so the pair of short
              nav groups can sit side by side on a phone; brand and contact
              span both until the real `sm` layout takes over. */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-12">
            <div className="col-span-2 text-center sm:text-start lg:col-span-1">
              {/*
                A light chip rather than the `brightness-0 invert` treatment
                the footer used to apply. That filter only works on a flat
                silhouette-shaped mark, and inverting a detailed full-colour
                illustration flattens it into a featureless white blob —
                verified by rendering it large on both grounds, filtered and
                unfiltered, not inferred. A chip lets the real brand asset
                render in its real colours regardless of which mark ends up
                here.

                `footer-logo.png` is a manually-supplied asset (not the
                header's `logo.png`, not `siteSettings.logo` — the CMS field
                is read nowhere in the header or footer now) — kept exactly
                as supplied. `footer-logo-trimmed.png` is a derived crop of
                it, generated once and committed alongside it, not a second
                asset choice: the source file's own transparent canvas had
                0px of margin on the left and 48px on the right (measured
                against its alpha channel), so the file itself wasn't
                symmetric — the trim removes exactly that dead margin on all
                four sides and nothing else; every visible pixel of the
                supplied artwork is unchanged.

                `mx-auto` (reset by `sm:mx-0` where the parent itself
                switches to start-aligned) is required even after that trim:
                Tailwind's preflight makes `img` `display: block`, and
                `text-align: center` on the parent has no effect on a block
                box — it only centers inline/inline-block content. Worse,
                a block-level replaced element with fixed intrinsic width
                and both margins computed to `0` (not `auto`) is
                over-constrained, and the browser resolves that by
                collapsing the line-*end* margin — which in this RTL-default
                app is the *left* side — so without `mx-auto` the logo sat
                flush against the right edge with all the slack on the
                left, not centred at all despite `text-center` being
                present on the parent. `mx-auto` forces genuine, symmetric
                auto-margin centering regardless of direction.
              */}
              <Image
                src="/images/footer-logo-trimmed.png"
                alt={clinicName}
                width={1624}
                height={849}
                sizes="208px"
                className="mx-auto h-16 w-auto object-contain sm:mx-0"
              />
              {/* `mx-auto` keeps the measure limit while centring the block
                  itself on phones — a centred paragraph that still wraps at
                  a comfortable line length, not one stretched edge to edge. */}
              <p className="mx-auto mt-4 max-w-xs text-body-sm text-on-inverse-muted sm:mx-0">
                {doctorTagline || t("footer.tagline")}
              </p>
              {sortedSocialLinks.length > 0 && (
                <div className="mt-6 flex items-center justify-center gap-4 sm:justify-start">
                  {sortedSocialLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      className="flex size-touch-min items-center justify-center rounded-full text-on-inverse-muted transition-colors duration-fast pointer:hover:bg-white/10 pointer:hover:text-on-inverse focus-ring-inverse"
                    >
                      <SocialIcon platform={link.platform} className="size-icon-md" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* The two short nav groups are the pair that sits side by side
                on a phone. Their links stay full-column-width blocks with
                centred text rather than text-width inline targets, so the
                tap area is the whole column, not just the word. */}
            <div className="text-center sm:text-start">
              <h2 className={COLUMN_HEADING}>
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-on-inverse" />
                {t("footer.quickLinks")}
              </h2>
              <nav className="mt-4 flex flex-col gap-2.5">
                {PRIMARY_NAV_ITEMS.map((item) => (
                  <Link key={item.key} href={item.href} className={INVERSE_LINK}>
                    {t(`nav.${item.key}`)}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="text-center sm:text-start">
              <h2 className={COLUMN_HEADING}>
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-on-inverse" />
                {t("nav.more")}
              </h2>
              <nav className="mt-4 flex flex-col gap-2.5">
                {MORE_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    locale={ARABIC_ONLY_NAV_KEYS.has(item.key) ? "ar" : undefined}
                    className={INVERSE_LINK}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact spans both phone columns: a phone number and an email
                address are far longer than a one-word nav label and would
                wrap awkwardly in half the width. Each row stays full-width
                (so the whole strip is tappable) while `INVERSE_LINK`'s
                `justify-center` centres the icon+text pair as a unit. */}
            <div className="col-span-2 text-center sm:col-span-1 sm:text-start">
              <h2 className={COLUMN_HEADING}>
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-on-inverse" />
                {t("footer.contact")}
              </h2>
              <div className="mt-4 flex flex-col gap-2.5">
                {siteSettings.phone && (
                  <a href={`tel:${siteSettings.phone}`} className={cn("flex items-center gap-2", INVERSE_LINK)}>
                    <Phone className="size-icon-sm" aria-hidden="true" />
                    <span dir="ltr">{siteSettings.phone}</span>
                  </a>
                )}
                {siteSettings.email && (
                  <a href={`mailto:${siteSettings.email}`} className={cn("flex items-center gap-2", INVERSE_LINK)}>
                    <Mail className="size-icon-sm" aria-hidden="true" />
                    {siteSettings.email}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t-hairline border-inverse pt-6 text-center text-caption text-on-inverse-muted">
            © {year} {clinicName} — {t("footer.rightsReserved")}
          </div>
        </div>
      </Container>
    </footer>
  );
}

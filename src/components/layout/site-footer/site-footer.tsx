import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Mail, Phone } from "lucide-react";
import type { LocalizedSiteSettings } from "@/lib/domain/site-settings";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";
import { ARABIC_ONLY_NAV_KEYS, PRIMARY_NAV_ITEMS, MORE_NAV_ITEMS } from "@/components/layout/site-header/nav-items";
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
const INVERSE_LINK = "text-body-sm text-on-inverse-muted transition-colors duration-fast hover:text-on-inverse focus-ring-inverse";

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
 */
export async function SiteFooter({ siteSettings, clinicName, doctorTagline }: SiteFooterProps) {
  const t = await getTranslations("layout");
  const year = new Date().getFullYear();
  const sortedSocialLinks = [...siteSettings.socialLinks].sort((a, b) => a.order - b.order);
  const logo = siteSettings.logo;

  return (
    <footer className="relative overflow-hidden bg-surface-inverse">
      <Container width="wide" className="relative py-section-y-sm">
        <FooterBotanical />

        {/* `relative z-10`: guarantees this stacks above the absolutely
            positioned (z-index:auto) botanical layer regardless of DOM
            order, so real content is never visually obscured by it. */}
        <div className="relative z-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-12">
            <div className="sm:col-span-2 lg:col-span-1">
              {/*
                A light chip rather than the `brightness-0 invert` treatment
                the footer used to apply. That filter only works on a flat
                silhouette-shaped mark; the real CMS asset is a detailed
                full-colour illustration (leaf emblem + script wordmark + an
                illustrated figure), and inverting it flattened the figure
                into a featureless white blob — verified by rendering the
                asset large on both grounds, filtered and unfiltered, not
                inferred. Unfiltered on the dark green it instead nearly
                disappears, since its own artwork is dark green too. A chip
                lets the real brand asset render in its real colours, and is
                aspect-ratio agnostic: the CMS owns the logo's shape, so this
                component can't assume a wordmark's proportions.
              */}
              <span className="inline-flex rounded-lg bg-surface px-4 py-3">
                {logo ? (
                  /* `sizes` differs per branch because the two assets have
                     very different aspect ratios at the same height: the CMS
                     logo is ~1.5:1 (≈84px wide at h-14), the bundled wordmark
                     ~3.64:1 (≈204px). One shared value would over-fetch for
                     one of them. */
                  <Image src={logo.secureUrl} alt={clinicName} width={logo.width} height={logo.height} sizes="96px" className="h-14 w-auto object-contain" />
                ) : (
                  // The bundled official mark, never a re-typeset brand name
                  // — same fallback the header uses. `siteSettings.logo`
                  // stays the preferred source; this covers the CMS-empty case.
                  <Image src="/images/TopLogo.png" alt={clinicName} width={2000} height={550} sizes="208px" className="h-14 w-auto object-contain" />
                )}
              </span>
              <p className="mt-4 max-w-xs text-body-sm text-on-inverse-muted">{doctorTagline || t("footer.tagline")}</p>
              {sortedSocialLinks.length > 0 && (
                <div className="mt-6 flex items-center gap-4">
                  {sortedSocialLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      className="flex size-touch-min items-center justify-center rounded-full text-on-inverse-muted transition-colors duration-fast hover:bg-white/10 hover:text-on-inverse focus-ring-inverse"
                    >
                      <SocialIcon platform={link.platform} className="size-icon-md" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-label font-semibold uppercase tracking-wide text-on-inverse-muted">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-on-inverse" />
                {t("footer.quickLinks")}
              </h3>
              <nav className="mt-4 flex flex-col gap-2.5">
                {PRIMARY_NAV_ITEMS.map((item) => (
                  <Link key={item.key} href={item.href} className={INVERSE_LINK}>
                    {t(`nav.${item.key}`)}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-label font-semibold uppercase tracking-wide text-on-inverse-muted">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-on-inverse" />
                {t("nav.more")}
              </h3>
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

            <div>
              <h3 className="flex items-center gap-2 text-label font-semibold uppercase tracking-wide text-on-inverse-muted">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-on-inverse" />
                {t("footer.contact")}
              </h3>
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

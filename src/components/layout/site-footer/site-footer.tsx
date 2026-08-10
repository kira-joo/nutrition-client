import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Mail, Phone } from "lucide-react";
import type { LocalizedSiteSettings } from "@/lib/domain/site-settings";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PRIMARY_NAV_ITEMS, MORE_NAV_ITEMS } from "@/components/layout/site-header/nav-items";
import { SocialIcon } from "./social-icon";

export interface SiteFooterProps {
  siteSettings: LocalizedSiteSettings;
  clinicName: string;
  /** `doctorProfile.tagline` — the real short description this footer uses; absent only when the shell's defensive doctor-profile fetch failed. */
  doctorTagline?: string;
}

/**
 * A strong dark brand-green footer — a real second design pass, not the
 * old thin `bg-surface-muted` strip. Still a Server Component with zero
 * client JS (`getTranslations`, not `useTranslations`): nothing here needs
 * interactivity beyond plain navigation and mailto/tel links.
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
    <footer className="bg-surface-inverse">
      <Container width="wide" className="py-section-y-sm">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            {logo ? (
              <Image
                src={logo.secureUrl}
                alt={clinicName}
                width={logo.width}
                height={logo.height}
                sizes="140px"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            ) : (
              <span className="text-heading-3 font-bold text-on-inverse">{clinicName}</span>
            )}
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
                    className="flex size-touch-min items-center justify-center rounded-full text-on-inverse-muted transition-colors duration-fast hover:text-on-inverse"
                  >
                    <SocialIcon platform={link.platform} className="size-icon-md" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-label font-semibold uppercase tracking-wide text-on-inverse-muted">{t("footer.quickLinks")}</h3>
            <nav className="mt-4 flex flex-col gap-2.5">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <Link key={item.key} href={item.href} className="text-body-sm text-on-inverse-muted transition-colors duration-fast hover:text-on-inverse">
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-label font-semibold uppercase tracking-wide text-on-inverse-muted">{t("nav.more")}</h3>
            <nav className="mt-4 flex flex-col gap-2.5">
              {MORE_NAV_ITEMS.map((item) => (
                <Link key={item.key} href={item.href} className="text-body-sm text-on-inverse-muted transition-colors duration-fast hover:text-on-inverse">
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-label font-semibold uppercase tracking-wide text-on-inverse-muted">{t("footer.contact")}</h3>
            <div className="mt-4 flex flex-col gap-2.5">
              {siteSettings.phone && (
                <a href={`tel:${siteSettings.phone}`} className="flex items-center gap-2 text-body-sm text-on-inverse-muted transition-colors duration-fast hover:text-on-inverse">
                  <Phone className="size-icon-sm" aria-hidden="true" />
                  <span dir="ltr">{siteSettings.phone}</span>
                </a>
              )}
              {siteSettings.email && (
                <a href={`mailto:${siteSettings.email}`} className="flex items-center gap-2 text-body-sm text-on-inverse-muted transition-colors duration-fast hover:text-on-inverse">
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
      </Container>
    </footer>
  );
}

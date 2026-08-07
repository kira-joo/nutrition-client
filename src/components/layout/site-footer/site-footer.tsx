import { getTranslations } from "next-intl/server";
import { Mail, Phone } from "lucide-react";
import type { LocalizedSiteSettings } from "@/lib/domain/site-settings";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PRIMARY_NAV_ITEMS } from "@/components/layout/site-header/nav-items";
import { SocialIcon } from "./social-icon";

export interface SiteFooterProps {
  siteSettings: LocalizedSiteSettings;
  clinicName: string;
}

/**
 * A Server Component, not a Client Component — nothing here needs
 * interactivity beyond plain navigation, so it costs zero client JS.
 * `getTranslations` (not the client `useTranslations`) is the correct
 * next-intl API for that.
 */
export async function SiteFooter({ siteSettings, clinicName }: SiteFooterProps) {
  const t = await getTranslations("layout");
  const year = new Date().getFullYear();
  const sortedSocialLinks = [...siteSettings.socialLinks].sort((a, b) => a.order - b.order);

  return (
    <footer className="border-t-hairline border-border bg-surface-muted">
      <Container width="wide" className="py-section-y-sm">
        <div className="grid gap-content-gap sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="text-heading-3 font-bold text-primary">{clinicName}</span>
            <p className="mt-3 max-w-xs text-body-sm text-text-secondary">{t("footer.tagline")}</p>
            {sortedSocialLinks.length > 0 && (
              <div className="mt-5 flex items-center gap-4">
                {sortedSocialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="flex size-touch-min items-center justify-center rounded-full text-text-secondary transition-colors duration-fast hover:text-primary"
                  >
                    <SocialIcon platform={link.platform} className="size-icon-md" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-label font-semibold uppercase tracking-wide text-text-muted">{t("footer.quickLinks")}</h3>
            <nav className="mt-4 flex flex-col gap-2.5">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <Link key={item.key} href={item.href} className="text-body-sm text-text-secondary transition-colors duration-fast hover:text-primary">
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-label font-semibold uppercase tracking-wide text-text-muted">{t("footer.contact")}</h3>
            <div className="mt-4 flex flex-col gap-2.5">
              {siteSettings.phone && (
                <a href={`tel:${siteSettings.phone}`} className="flex items-center gap-2 text-body-sm text-text-secondary transition-colors duration-fast hover:text-primary">
                  <Phone className="size-icon-sm" aria-hidden="true" />
                  <span dir="ltr">{siteSettings.phone}</span>
                </a>
              )}
              {siteSettings.email && (
                <a href={`mailto:${siteSettings.email}`} className="flex items-center gap-2 text-body-sm text-text-secondary transition-colors duration-fast hover:text-primary">
                  <Mail className="size-icon-sm" aria-hidden="true" />
                  {siteSettings.email}
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-label font-semibold uppercase tracking-wide text-text-muted">{t("nav.doctor")}</h3>
            <p className="mt-4 text-body-sm text-text-secondary">{clinicName}</p>
          </div>
        </div>

        <div className="mt-10 border-t-hairline border-border pt-6 text-center text-caption text-text-muted">
          © {year} {clinicName} — {t("footer.rightsReserved")}
        </div>
      </Container>
    </footer>
  );
}

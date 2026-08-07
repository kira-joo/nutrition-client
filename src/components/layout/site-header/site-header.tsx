"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu, MessageCircle, Phone, X } from "lucide-react";
import { cn } from "@kira-joo/frontend-toolkit-tailwind/server";
import type { ImageAsset } from "@kira-joo/toolkit-common";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useDrawerTransition } from "@/lib/animation/use-drawer-transition";
import { useDialogA11y } from "@/lib/a11y/use-dialog-a11y";
import { LanguageToggle } from "./language-toggle";
import { MORE_NAV_ITEMS, PRIMARY_NAV_ITEMS } from "./nav-items";

export interface SiteHeaderProps {
  logo: ImageAsset | null;
  clinicName: string;
  whatsappNumber?: string;
  phone?: string;
}

export function SiteHeader({ logo, clinicName, whatsappNumber, phone }: SiteHeaderProps) {
  const t = useTranslations("layout");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { panelRef, backdropRef } = useDrawerTransition({ isOpen: isMobileOpen });
  useDialogA11y({ isOpen: isMobileOpen, onClose: () => setIsMobileOpen(false), containerRef: panelRef });

  // Transparent-over-hero, solid once scrolled — a plain scroll listener
  // driving a Tailwind color transition, not GSAP: this is a two-state
  // boolean toggle, not a sequenced animation, so a CSS transition is the
  // right-sized tool (GSAP is reserved for the drawer's slide/fade and for
  // scroll-triggered content reveals elsewhere on the page).
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Closing the drawer on route change (a nav link click) is handled by
  // each link's own onClick below; this additionally closes the "More"
  // dropdown if a resize/route change happens while it's open.
  useEffect(() => {
    if (!isMobileOpen) setIsMoreOpen(false);
  }, [isMobileOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-header transition-colors duration-base ease-standard",
        isScrolled || isMobileOpen ? "border-b-hairline border-border bg-surface/95 shadow-sm backdrop-blur" : "bg-transparent"
      )}
    >
      <Container width="wide">
        <div className="flex h-16 items-center justify-between lg:h-20">
          <Link href="/" className="flex items-center gap-2">
            {logo ? (
              <Image src={logo.secureUrl} alt={clinicName} width={logo.width} height={logo.height} className="h-10 w-auto object-contain lg:h-12" priority />
            ) : (
              <span className="text-heading-3 font-bold text-primary">{clinicName}</span>
            )}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <Link key={item.key} href={item.href} className="text-body font-medium text-text-primary transition-colors duration-fast hover:text-primary">
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreOpen((value) => !value)}
                className="flex items-center gap-1 text-body font-medium text-text-primary transition-colors duration-fast hover:text-primary"
                aria-expanded={isMoreOpen}
              >
                {t("nav.more")}
                <ChevronDown className={cn("size-icon-sm transition-transform duration-fast", isMoreOpen && "rotate-180")} aria-hidden="true" />
              </button>
              {isMoreOpen && (
                <div className="absolute end-0 top-full mt-2 min-w-40 rounded-lg border-hairline border-border bg-surface p-2 shadow-md">
                  {MORE_NAV_ITEMS.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setIsMoreOpen(false)}
                      className="block rounded-md px-3 py-2 text-body-sm text-text-primary transition-colors duration-fast hover:bg-surface-muted"
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            <LanguageToggle />
            <Button href="/consultation" size="sm">
              {t("cta.bookConsultation")}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            aria-label={t("nav.openMenu")}
            className="flex size-touch-min items-center justify-center text-text-primary lg:hidden"
          >
            <Menu className="size-icon-lg" aria-hidden="true" />
          </button>
        </div>
      </Container>

      {/* Mobile drawer backdrop + panel — kept mounted always (not conditionally rendered) so useDrawerTransition can animate the close, not just the open. */}
      <div
        ref={backdropRef}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
        className={cn("fixed inset-0 z-drawer bg-overlay lg:hidden", !isMobileOpen && "invisible opacity-0")}
      />
      {/* No CSS-authored transform here on purpose: GSAP owns this element's transform exclusively (see useDrawerTransition's doc comment) — a class-based translate-x-full would sit underneath GSAP's own xPercent writes rather than being replaced by them, doubling the offset. useDrawerTransition's useLayoutEffect sets the offscreen position synchronously before paint, so there's no flash despite no CSS default. */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 end-0 z-drawer flex w-[min(20rem,85vw)] flex-col bg-surface p-6 shadow-lg lg:hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-heading-3 font-bold text-primary">{clinicName}</span>
          <button type="button" onClick={() => setIsMobileOpen(false)} aria-label={t("nav.closeMenu")} className="flex size-touch-min items-center justify-center text-text-primary">
            <X className="size-icon-lg" aria-hidden="true" />
          </button>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {[...PRIMARY_NAV_ITEMS, ...MORE_NAV_ITEMS].map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className="rounded-md px-3 py-3 text-body-lg font-medium text-text-primary transition-colors duration-fast hover:bg-surface-muted"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4 border-t-hairline border-border pt-6">
          <LanguageToggle />
          <Button href="/consultation" onClick={() => setIsMobileOpen(false)}>
            {t("cta.bookConsultation")}
          </Button>
          <div className="flex items-center justify-center gap-6">
            {whatsappNumber && (
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-body-sm text-text-secondary">
                <MessageCircle className="size-icon-sm" aria-hidden="true" />
                {t("cta.whatsapp")}
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="flex items-center gap-1.5 text-body-sm text-text-secondary">
                <Phone className="size-icon-sm" aria-hidden="true" />
                {t("cta.call")}
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";
import { useEffect, useId, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@kira-joo/toolkit-common";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { MORE_NAV_ITEMS, PRIMARY_NAV_ITEMS } from "./nav-items";
import AppRoute from "@/constant/AppRoute.enum";

// Deferred until a visitor actually taps the hamburger button (see
// `hasOpenedDrawer` below) — this is the one part of the always-rendered
// header that needs GSAP (`useDrawerTransition`), measured at ~110kB
// parsed. `ssr: false` since it never needs to exist in the initial HTML.
const MobileNavDrawer = dynamic(() => import("./mobile-nav-drawer").then((mod) => mod.MobileNavDrawer), { ssr: false });

export interface SiteHeaderProps {
  logo: ImageAsset | null;
  clinicName: string;
  whatsappNumber?: string;
  phone?: string;
}

export function SiteHeader({ logo, clinicName, whatsappNumber, phone }: SiteHeaderProps) {
  const t = useTranslations("layout");
  const moreMenuId = useId();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Once true, stays true — the drawer stays mounted after its first open
  // so its close transition can animate (matching the original design),
  // but nothing about it (including its GSAP dependency) loads before that
  // first tap.
  const [hasOpenedDrawer, setHasOpenedDrawer] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  function openMobileDrawer() {
    setHasOpenedDrawer(true);
    setIsMobileOpen(true);
  }

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
          <Link href={AppRoute.Home} className="flex items-center gap-2">
            {logo ? (
              <Image
                src={logo.secureUrl}
                alt={clinicName}
                width={logo.width}
                height={logo.height}
                sizes="96px"
                className="h-10 w-auto object-contain lg:h-12"
                priority
              />
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
                aria-controls={moreMenuId}
              >
                {t("nav.more")}
                <ChevronDown className={cn("size-icon-sm transition-transform duration-fast motion-reduce:transition-none", isMoreOpen && "rotate-180")} aria-hidden="true" />
              </button>
              {isMoreOpen && (
                <div id={moreMenuId} className="absolute end-0 top-full mt-2 min-w-40 rounded-lg border-hairline border-border bg-surface p-2 shadow-md">
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
            <Button href={AppRoute.Consultation} size="sm">
              {t("cta.bookConsultation")}
            </Button>
          </div>

          <button
            type="button"
            onClick={openMobileDrawer}
            aria-label={t("nav.openMenu")}
            className="flex size-touch-min items-center justify-center text-text-primary lg:hidden"
          >
            <Menu className="size-icon-lg" aria-hidden="true" />
          </button>
        </div>
      </Container>

      {hasOpenedDrawer && (
        <MobileNavDrawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} clinicName={clinicName} whatsappNumber={whatsappNumber} phone={phone} />
      )}
    </header>
  );
}

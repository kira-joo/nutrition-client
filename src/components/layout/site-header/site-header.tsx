"use client";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/cn";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { ARABIC_ONLY_NAV_KEYS, MORE_NAV_ITEMS, PRIMARY_NAV_ITEMS } from "./nav-items";
import AppRoute from "@/constant/AppRoute.enum";

// Deferred until a visitor actually taps the hamburger button (see
// `hasOpenedDrawer` below): this is the one part of the always-rendered
// header that pulls in the animation runtime (`useDrawerTransition`), and
// the header is global, so an eager import would put it on every route —
// the reason this boundary exists (it was ~110kB parsed under GSAP; Motion
// is smaller, but the always-global argument is unchanged).
// `ssr: false` since it never needs to exist in the initial HTML.
const MobileNavDrawer = dynamic(() => import("./mobile-nav-drawer").then((mod) => mod.MobileNavDrawer), { ssr: false });

export interface SiteHeaderProps {
  clinicName: string;
  whatsappNumber?: string;
  phone?: string;
}

export function SiteHeader({ clinicName, whatsappNumber, phone }: SiteHeaderProps) {
  const t = useTranslations("layout");
  const moreMenuId = useId();
  const mobileDrawerId = useId();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Once true, stays true — the drawer stays mounted after its first open
  // so its close transition can animate (matching the original design),
  // but nothing about it (including the animation runtime) loads before that
  // first tap.
  const [hasOpenedDrawer, setHasOpenedDrawer] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreContainerRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  function openMobileDrawer() {
    setHasOpenedDrawer(true);
    setIsMobileOpen(true);
  }

  // Transparent-over-hero, solid once scrolled — a plain scroll listener
  // driving a Tailwind color transition, not a JS animation: a two-state
  // boolean toggle, not a sequenced animation, so a CSS transition is the
  // right-sized tool (Motion is reserved for the drawer's slide/fade and for
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

  // The "More" disclosure previously only ever closed via its own toggle
  // button — verified in a real browser, tabbing past its last link (or
  // clicking anywhere else on the page) left it visibly open, overlapping
  // whatever sat beneath it, with `aria-expanded` still (correctly, but
  // confusingly) reporting `true`. A disclosure needs to close itself once
  // interaction moves elsewhere, not just on its own explicit toggle.
  useEffect(() => {
    if (!isMoreOpen) return;

    function closeIfOutside(target: Node | null) {
      if (target && moreContainerRef.current?.contains(target)) return;
      setIsMoreOpen(false);
    }

    const onPointerDown = (event: MouseEvent) => closeIfOutside(event.target as Node);
    // `relatedTarget` is the element about to receive focus — null when
    // focus leaves the document entirely (e.g. Tab to the browser chrome),
    // which this treats as "left the menu" too.
    const onFocusOut = (event: FocusEvent) => closeIfOutside(event.relatedTarget as Node | null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsMoreOpen(false);
      moreButtonRef.current?.focus();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMoreOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-header transition-colors duration-base ease-standard",
        isScrolled || isMobileOpen ? "border-b-hairline border-border bg-surface/95 shadow-sm backdrop-blur" : "bg-transparent"
      )}
    >
      <Container width="wide">
        <div className="flex h-17 items-center justify-between lg:h-20">
          {/*
            Two mobile-only additions grouped with the logo, not with the
            hamburger: the mobile CTA lives here (hidden lg:flex has its own
            desktop copy further down) so the hamburger stays isolated at
            the opposite edge as its own flex item — the safe pattern for
            `justify-between` once `nav` disappears below `lg`. Exactly one
            "Book a consultation" is ever visible/focusable at a given
            width; the two never coexist since each is gated by the
            opposite side of the same `lg:` breakpoint.
          */}
          <div className="flex items-center gap-3">
            {/*
              `touch:min-h-touch-min` because the home link measured 40px tall on
              a coarse pointer — a real control 4px under this app's own minimum,
              on every page. It grows inside the 64px header row rather than
              needing the CTA's `::after` treatment, so there is no layout shift
              and the mark stays vertically centred; gated on pointer capability
              rather than a breakpoint, since a touch tablet needs it too.
            */}
            <Link href={AppRoute.Home} className="flex items-center gap-2 touch:min-h-touch-min">
              {/*
                Two different local marks, not one asset stretched across
                every width, and not the CMS `siteSettings.logo` this used
                to read either way (removed — see `logo.png`'s own note in
                `docs/asset-requirements.md` for why the brand mark is now
                a client-local asset instead of staff-managed content).
                Measured, not assumed: the full mark (leaf emblem + script
                wordmark + an illustrated figure) downscaled to mobile
                reads as the "detailed illustration becomes a smudge"
                problem predicted — confirmed by screenshotting the real
                header at 375px and zooming into the captured pixels. At
                the taller 64px `lg` height the full mark reads fine (also
                verified the same way), so `lg` and up shows the real brand
                mark and only mobile/tablet falls back to the compact
                leaf-only mark.

                The real file is a 1254x1254 square (fixed here — `width`/
                `height` previously carried a stand-in asset's 256x456,
                which doesn't matter for layout since the box below is
                sized in CSS, but did feed Next a wrong aspect ratio).
                `w-16` (64px, square) rather than the previous `w-10`
                (40px): that box's height was already `h-16`, so the old
                narrower width was letterboxing the square art down to an
                effective 40px mark with dead space above/below — not a
                deliberate 40px size. Squaring the box renders the mark at
                its full 64px, a real, visible increase, while the row
                itself stays `h-17` (a fixed height unaffected by its
                children) so nothing about the header's own height moves.
              */}
              <Image
                src="/images/logo-mobile.png"
                alt={clinicName}
                width={1254}
                height={1254}
                sizes="64px"
                className="h-16 w-16 object-contain lg:hidden"
                priority
              />
              {/*
                `h-16` (64px) against the row's own `lg:h-20` (80px) —
                8px of headroom top and bottom. The real master is
                1536x1024 (3:2), so `width`/`height` here are its actual
                intrinsic dimensions, not a stand-in asset's — Next needs
                the real ratio to reserve the right box before the image
                loads.
              */}
              <Image
                src="/images/logo.png"
                alt={clinicName}
                width={1536}
                height={1024}
                sizes="184px"
                className="hidden h-17 w-auto object-contain lg:block"
                priority
              />
            </Link>
            {/*
              `md` (44px) rather than the earlier `sm` (36px, with a
              pseudo-element stretching only the *touch* target to 44px):
              this is the site's single highest-priority conversion action,
              called out for more visual weight specifically, and the old
              36px pill under-represented that next to the header's own
              64/80px row. `md` reaches the touch minimum natively, so the
              old `after:` extension hack is gone — nothing to size or
              verify separately anymore. Still well inside the 64px row,
              vertically centered by the row's own `items-center`.
            */}
            <Button href={AppRoute.Consultation} size="lg" className="lg:hidden font-bold">
              {t("cta.bookConsultation")}
            </Button>
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <Link key={item.key} href={item.href} className="text-body font-medium text-text-primary transition-colors duration-fast pointer:hover:text-primary">
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            <div ref={moreContainerRef} className="relative">
              <button
                ref={moreButtonRef}
                type="button"
                onClick={() => setIsMoreOpen((value) => !value)}
                className="flex items-center gap-1 text-body font-medium text-text-primary transition-colors duration-fast pointer:hover:text-primary"
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
                      locale={ARABIC_ONLY_NAV_KEYS.has(item.key) ? "ar" : undefined}
                      onClick={() => setIsMoreOpen(false)}
                      className="block rounded-md px-3 py-2 text-body-sm text-text-primary transition-colors duration-fast pointer:hover:bg-surface-muted"
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
            <Button href={AppRoute.Consultation} size="lg" className="font-bold">
              {t("cta.bookConsultation")}
            </Button>
          </div>

          <button
            type="button"
            onClick={openMobileDrawer}
            aria-label={t("nav.openMenu")}
            aria-expanded={isMobileOpen}
            aria-controls={mobileDrawerId}
            className="flex size-touch-min items-center justify-center text-text-primary lg:hidden"
          >
            <Menu className="size-icon-lg" aria-hidden="true" />
          </button>
        </div>
      </Container>

      {hasOpenedDrawer && (
        <MobileNavDrawer id={mobileDrawerId} isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} clinicName={clinicName} whatsappNumber={whatsappNumber} phone={phone} />
      )}
    </header>
  );
}

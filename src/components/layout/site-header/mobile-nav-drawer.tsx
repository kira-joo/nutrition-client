"use client";
import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, Phone, X } from "lucide-react";
import { Portal } from "@kira-joo/frontend-toolkit-tailwind/primitives";
import { cn } from "@/lib/cn";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useDrawerTransition } from "@/lib/animation/use-drawer-transition";
import { useDialogA11y } from "@/lib/a11y/use-dialog-a11y";
import { LanguageToggle } from "./language-toggle";
import { ARABIC_ONLY_NAV_KEYS, MORE_NAV_ITEMS, PRIMARY_NAV_ITEMS } from "./nav-items";
import AppRoute from "@/constant/AppRoute.enum";

export interface MobileNavDrawerProps {
  /** Mirrored onto the hamburger trigger's `aria-controls` in `SiteHeader`. */
  id: string;
  isOpen: boolean;
  onClose: () => void;
  clinicName: string;
  whatsappNumber?: string;
  phone?: string;
}

/**
 * Split out of `SiteHeader` and loaded via `next/dynamic(..., { ssr: false })`
 * there, mounted only from the moment a visitor first taps the hamburger
 * button onward (see `SiteHeader`'s `hasOpenedDrawer` state) — this is the
 * one piece of the always-rendered global header that actually needs GSAP
 * (`useDrawerTransition`), which measured out to ~110kB parsed pulled into
 * every single page's bundle by way of the header being unavoidably
 * global. The top bar (logo/nav/hamburger button) needs none of that and
 * stays in `SiteHeader` itself.
 *
 * Not rendered at all until first opened, then kept mounted from then on
 * (matching the original always-mounted design) so `useDrawerTransition`
 * can animate every subsequent close, not just opens. `ssr: false` is safe
 * because this never needs to exist in the initial server-rendered HTML —
 * by the time it mounts, it's already responding to a real click.
 *
 * Portalled to `document.body` — it used to render as a child of
 * `<header>`, and the header gets `backdrop-blur` applied to it whenever
 * `isScrolled || isMobileOpen` (see `SiteHeader`). `backdrop-filter`
 * creates a containing block for `position: fixed` descendants, so this
 * panel's `fixed inset-y-0` and the backdrop's `fixed inset-0` resolved
 * against the header's own `h-16` box instead of the viewport: the panel's
 * background/padding/shadow painted only 64px tall while its children
 * overflowed below with nothing behind them, and the scrim dimmed only
 * that same 64px strip — measured as the reported "transparent drawer".
 * Portalling escapes that containing block entirely, exactly like
 * `recipe-filter-sheet.tsx` already does for the same class of bug.
 */
export function MobileNavDrawer({ id, isOpen, onClose, clinicName, whatsappNumber, phone }: MobileNavDrawerProps) {
  const t = useTranslations("layout");
  // Portal renders nothing until mounted (it defers to document.body via an
  // effect), so the panel doesn't exist in the DOM on the first render pass
  // — the transition has to wait for it, exactly as recipe-filter-sheet.tsx
  // does, or useDrawerTransition's layout effect runs against a null ref,
  // never sets the closed position, and the panel flashes open on mount.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const { panelRef, backdropRef } = useDrawerTransition({ isOpen, ready: isMounted });
  useDialogA11y({ isOpen, onClose, containerRef: panelRef, ready: isMounted });
  const titleId = useId();

  return (
    <Portal>
      <div
        ref={backdropRef}
        onClick={onClose}
        aria-hidden="true"
        className={cn("fixed inset-0 z-drawer bg-overlay lg:hidden", !isOpen && "invisible opacity-0")}
      />
      {/* No CSS-authored transform here on purpose: GSAP owns this element's transform exclusively (see useDrawerTransition's doc comment) — a class-based translate-x-full would sit underneath GSAP's own xPercent writes rather than being replaced by them, doubling the offset. useDrawerTransition's useLayoutEffect sets the offscreen position synchronously before paint, so there's no flash despite no CSS default. */}
      {/*
        Three-region flex column, not one padded box: `h-dvh` bounds the
        panel to the *usable* viewport height (a plain `h-screen`/`100vh`
        can exceed it on mobile browsers with a retracting toolbar), and
        only the middle `<nav>` scrolls (`min-h-0` + `overflow-y-auto` —
        the `min-h-0` is load-bearing, since a flex item's default
        `min-height: auto` refuses to shrink below its content and the
        scroll never engages without it). The header and footer are
        `shrink-0` so they can't be squeezed by a tall nav list. Without
        this split, a drawer taller than a short device's viewport (e.g.
        375×600) simply clipped its own bottom-most items with no way to
        reach them — the panel itself never scrolled, and letting the
        underlying page scroll instead was explicitly ruled out.
      */}
      <div
        id={id}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-y-0 end-0 z-drawer flex h-dvh w-[min(22rem,85vw)] flex-col bg-surface shadow-lg sm:w-[min(26rem,80vw)] lg:hidden"
      >
        <div className="flex shrink-0 items-center justify-between p-8 pb-0">
          <span id={titleId} className="text-heading-3 font-bold text-primary">
            {clinicName}
          </span>
          <button type="button" onClick={onClose} aria-label={t("nav.closeMenu")} className="flex size-touch-min items-center justify-center text-text-primary">
            <X className="size-icon-lg" aria-hidden="true" />
          </button>
        </div>

        <nav className="mt-8 min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-8">
          <div className="flex flex-col gap-2 pb-4">
            {[...PRIMARY_NAV_ITEMS, ...MORE_NAV_ITEMS].map((item) => (
              <Link
                key={item.key}
                href={item.href}
                locale={ARABIC_ONLY_NAV_KEYS.has(item.key) ? "ar" : undefined}
                onClick={onClose}
                className="rounded-md px-3 py-3 text-body-lg font-medium text-text-primary transition-colors duration-fast hover:bg-surface-muted"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </div>
        </nav>

        {/* `env(safe-area-inset-bottom)` guards the iOS home-indicator area — `max()` against the same 1.5rem the rest of the panel uses so devices without a safe-area inset (or reduced-motion-style fallback browsers) still get real breathing room, not zero. */}
        <div
          className="shrink-0 border-t-hairline border-border p-8 pt-6"
          style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex flex-col gap-4">
            <LanguageToggle />
            <Button href={AppRoute.Consultation} onClick={onClose}>
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
      </div>
    </Portal>
  );
}

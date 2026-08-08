"use client";
import { useId } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, Phone, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useDrawerTransition } from "@/lib/animation/use-drawer-transition";
import { useDialogA11y } from "@/lib/a11y/use-dialog-a11y";
import { LanguageToggle } from "./language-toggle";
import { MORE_NAV_ITEMS, PRIMARY_NAV_ITEMS } from "./nav-items";
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
 */
export function MobileNavDrawer({ id, isOpen, onClose, clinicName, whatsappNumber, phone }: MobileNavDrawerProps) {
  const t = useTranslations("layout");
  const { panelRef, backdropRef } = useDrawerTransition({ isOpen });
  useDialogA11y({ isOpen, onClose, containerRef: panelRef });
  const titleId = useId();

  return (
    <>
      <div
        ref={backdropRef}
        onClick={onClose}
        aria-hidden="true"
        className={cn("fixed inset-0 z-drawer bg-overlay lg:hidden", !isOpen && "invisible opacity-0")}
      />
      {/* No CSS-authored transform here on purpose: GSAP owns this element's transform exclusively (see useDrawerTransition's doc comment) — a class-based translate-x-full would sit underneath GSAP's own xPercent writes rather than being replaced by them, doubling the offset. useDrawerTransition's useLayoutEffect sets the offscreen position synchronously before paint, so there's no flash despite no CSS default. */}
      <div
        id={id}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-y-0 end-0 z-drawer flex w-[min(20rem,85vw)] flex-col bg-surface p-6 shadow-lg lg:hidden"
      >
        <div className="flex items-center justify-between">
          <span id={titleId} className="text-heading-3 font-bold text-primary">
            {clinicName}
          </span>
          <button type="button" onClick={onClose} aria-label={t("nav.closeMenu")} className="flex size-touch-min items-center justify-center text-text-primary">
            <X className="size-icon-lg" aria-hidden="true" />
          </button>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {[...PRIMARY_NAV_ITEMS, ...MORE_NAV_ITEMS].map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={onClose}
              className="rounded-md px-3 py-3 text-body-lg font-medium text-text-primary transition-colors duration-fast hover:bg-surface-muted"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4 border-t-hairline border-border pt-6">
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
    </>
  );
}

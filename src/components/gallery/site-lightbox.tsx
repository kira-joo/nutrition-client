"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Portal } from "@kira-joo/frontend-toolkit-tailwind/primitives";
import { cn } from "@/lib/cn";
import { useIsRtl } from "@/hooks/useIsRtl";
import { useDialogA11y } from "@/lib/a11y/use-dialog-a11y";

export interface SiteLightboxImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface SiteLightboxProps {
  images: SiteLightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  loop?: boolean;
}

function step(current: number, delta: number, length: number, loop: boolean): number {
  const next = current + delta;
  if (loop) return (next + length) % length;
  return Math.min(Math.max(next, 0), length - 1);
}

const CONTROL_BUTTON_CLASSNAME =
  "flex size-touch-min items-center justify-center rounded-full bg-black/50 text-white transition-colors duration-fast hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-black/50";

/**
 * The app's own image viewer, replacing the toolkit's `AssetLightbox` at
 * every call site. Investigated first (plan §K): nutrition-staff's own
 * "good" viewer experience is the SAME `AssetLightbox`/`AssetViewer`
 * primitive, used bare at every one of its call sites (review/video/recipe
 * detail pages, the doctor gallery) — there is no extra dialog shell or
 * a11y layer to adopt. It looks fine there because staff usage is
 * desktop-only, mouse-driven, and not tested in Arabic — exactly the
 * conditions this app can't assume for real visitors.
 *
 * Confirmed gaps in the toolkit primitive this component fixes: no focus
 * trap, no `inert`, no scroll lock (the page could scroll behind it, and
 * the backdrop's tap-to-close competed with a touch scroll gesture);
 * `85vh` instead of `85dvh` (mobile toolbars could push the image past the
 * reachable area); a raw unoptimized `<img>` loading the full-resolution
 * source; hardcoded `z-50`, colliding with `--z-drawer`; and physical
 * `right-4`/`left-4` plus non-mirrored arrow keys, which is simply wrong
 * under `dir="rtl"`. Built on `use-dialog-a11y` — the same contract the
 * mobile drawer and the recipe filter sheet already use — rather than a
 * third independent dialog implementation.
 *
 * Same prop shape as the `AssetLightbox` it replaces, so every call site
 * only needed an import swap. Focus restoration is still `useLightbox`'s
 * job, not this component's or `use-dialog-a11y`'s default: it targets
 * whichever image was last *viewed* (arrow-keyed to), not just the one
 * originally clicked, which needs the caller's own index tracking — see
 * that hook's doc comment. `use-dialog-a11y`'s own restore-to-original-
 * trigger still fires on unmount, but `useLightbox.close()`'s
 * `requestAnimationFrame` call runs a frame later and wins.
 */
export function SiteLightbox({ images, index, onIndexChange, onClose, loop = true }: SiteLightboxProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const containerRef = useRef<HTMLDivElement>(null);
  const isRtl = useIsRtl();
  const t = useTranslations("layout");

  // Always "open" for as long as this component is mounted at all — every
  // call site only renders <SiteLightbox> while `openIndex !== null` and
  // stops rendering it entirely on close, rather than keeping it mounted
  // in a closed state (unlike the drawer, which stays mounted to animate
  // its close transition). `ready` still gates on Portal's own one-tick
  // mount delay — see use-dialog-a11y's `ready` doc comment.
  useDialogA11y({ isOpen: true, onClose, containerRef, ready: isMounted });

  const current = images[index];
  const hasMultiple = images.length > 1;
  const isAtStart = !loop && index === 0;
  const isAtEnd = !loop && index === images.length - 1;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!hasMultiple) return;
      const isPrevKey = isRtl ? event.key === "ArrowRight" : event.key === "ArrowLeft";
      const isNextKey = isRtl ? event.key === "ArrowLeft" : event.key === "ArrowRight";
      if (isPrevKey && !isAtStart) onIndexChange(step(index, -1, images.length, loop));
      else if (isNextKey && !isAtEnd) onIndexChange(step(index, 1, images.length, loop));
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [index, images.length, hasMultiple, loop, isAtStart, isAtEnd, onIndexChange, isRtl]);

  // Mirrored under RTL — Previous always means "toward the start of the set", regardless of which physical side that is.
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  // The container itself always renders once mounted, `current` or not —
  // `containerRef` must attach to a real node on the very same render
  // where `isMounted` first flips true, or `use-dialog-a11y`'s effects
  // (which run right after that render commits) see a still-null ref and
  // silently skip the focus move, the background `inert`, and the
  // Escape/Tab trap for good — an early `return null` guarding the whole
  // tree on `current` would recreate exactly that gap.
  return (
    <Portal>
      {isMounted && (
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("lightbox.label")}
          className="fixed inset-0 z-modal flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

          {current && (
            <>
              {/* dvh, not vh: a mobile browser's address bar can otherwise push the image past what's actually reachable. */}
              <div className="relative z-10 max-h-[90dvh] max-w-[92vw] lg:max-w-[85vw]" onClick={(event) => event.stopPropagation()}>
                <Image
                  src={current.src}
                  alt={current.alt}
                  width={current.width ?? 1600}
                  height={current.height ?? 1600}
                  sizes="90vw"
                  className="max-h-[90dvh] max-w-full object-contain"
                />
              </div>

              <button type="button" onClick={onClose} aria-label={t("lightbox.close")} className={cn("absolute end-4 top-4 z-20", CONTROL_BUTTON_CLASSNAME)}>
                <X className="size-icon-md" aria-hidden="true" />
              </button>

              {hasMultiple && (
                <>
                  <button
                    type="button"
                    disabled={isAtStart}
                    onClick={() => onIndexChange(step(index, -1, images.length, loop))}
                    aria-label={t("lightbox.previous")}
                    className={cn("absolute start-4 top-1/2 z-20 -translate-y-1/2", CONTROL_BUTTON_CLASSNAME)}
                  >
                    <PrevIcon className="size-icon-lg" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={isAtEnd}
                    onClick={() => onIndexChange(step(index, 1, images.length, loop))}
                    aria-label={t("lightbox.next")}
                    className={cn("absolute end-4 top-1/2 z-20 -translate-y-1/2", CONTROL_BUTTON_CLASSNAME)}
                  >
                    <NextIcon className="size-icon-lg" aria-hidden="true" />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </Portal>
  );
}

import { Play } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PlayOverlayProps {
  /**
   * Resting opacity of the scrim. A card reveals it on hover from nothing
   * (`opacity-0`); the detail page's single hero keeps it visible, because there
   * is nothing else on the page to suggest the still is playable.
   */
  restingScrim?: "hidden" | "visible";
  className?: string;
}

/**
 * The scrim-plus-play-badge over a video thumbnail.
 *
 * Two sites had it identically — the video card and the video detail hero — down
 * to the badge's `size-icon-xl`, its `bg-surface/90` fill and the `shadow-md`.
 * They differed only in whether the scrim rests hidden or visible, which is a
 * real difference and the one prop here.
 *
 * `aria-hidden`, and it must stay that way: a decorative play glyph adds nothing
 * a screen reader needs, and announcing it would interrupt the link's real name.
 *
 * That does put the burden on each call site to carry a name of its own. Review
 * found the detail hero was not: its poster has an empty `alt`, this overlay is
 * hidden, and its only other text was "(opens in a new tab)" — so the link said
 * what would happen and never what it opened. It now has an `aria-label` with
 * the video title. Worth checking the same thing at any new call site.
 *
 * The `group-hover:` reveal depends on a `group` ancestor at the call site, which
 * both have. Left as a `group-` utility rather than lifted in here because the
 * group is the *link*, not this overlay, and that ownership should stay visible
 * where the link is.
 */
export function PlayOverlay({ restingScrim = "hidden", className }: PlayOverlayProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-scrim transition-opacity duration-base ease-standard pointer:group-hover:opacity-100",
        restingScrim === "hidden" ? "opacity-0" : "opacity-90",
        className
      )}
    >
      <span className="flex size-icon-xl items-center justify-center rounded-full bg-surface/90 text-primary shadow-md">
        <Play className="size-icon-md" />
      </span>
    </span>
  );
}

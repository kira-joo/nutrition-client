import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export interface StarRatingProps {
  rating: number;
  max?: number;
  label: string;
  className?: string;
  /**
   * `--color-rating` measures ~1.4:1 against the `primary` fill the
   * homepage testimonial carousel's featured card uses — effectively
   * invisible, since both are dark. `"dark-surface"` swaps in the same
   * light gold (`--color-gold-on-dark`) `PricingCard`'s recommended tier
   * already uses on that same fill, rather than a one-off override at the
   * call site. Defaults to the original amber, unchanged for every
   * existing light-surface consumer.
   */
  tone?: "default" | "dark-surface";
}

/**
 * Read-only star display for a review's rating — filled stars up to
 * `rating`, outlined for the rest. Purely presentational: `label` carries
 * the accessible equivalent (e.g. "5 out of 5") since the individual star
 * icons are decorative.
 */
export function StarRating({ rating, max = 5, label, className, tone = "default" }: StarRatingProps) {
  const filled = tone === "dark-surface" ? "fill-gold-on-dark text-gold-on-dark" : "fill-rating text-rating";
  const empty = tone === "dark-surface" ? "text-white/25" : "text-border";

  return (
    <div role="img" aria-label={label} className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }, (_, index) =>
        index < rating ? (
          <Star key={index} aria-hidden="true" className={cn("size-icon-md", filled)} />
        ) : (
          <Star key={index} aria-hidden="true" className={cn("size-icon-md", empty)} />
        ),
      )}
    </div>
  );
}

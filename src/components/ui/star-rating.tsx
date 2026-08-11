import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export interface StarRatingProps {
  rating: number;
  max?: number;
  label: string;
  className?: string;
}

/**
 * Read-only star display for a review's rating — filled stars up to
 * `rating`, outlined for the rest. Purely presentational: `label` carries
 * the accessible equivalent (e.g. "5 out of 5") since the individual star
 * icons are decorative.
 */
export function StarRating({ rating, max = 5, label, className }: StarRatingProps) {
  return (
    <div role="img" aria-label={label} className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }, (_, index) =>
        index < rating ? (
          <Star key={index} aria-hidden="true" className="size-icon-md fill-rating text-rating" />
        ) : (
          <Star key={index} aria-hidden="true" className="size-icon-md text-border" />
        )
      )}
    </div>
  );
}

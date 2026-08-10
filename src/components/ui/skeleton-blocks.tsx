import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Composed skeleton shapes shared by every route's `loading.tsx`, so those
 * files stay a short composition rather than each re-implementing a whole
 * layout in placeholder divs.
 *
 * These are deliberately shape-level, not page-level: §18 asks each route's
 * loading UI to match its own content, and a single generic page skeleton
 * would just be the "one skeleton reused everywhere" it warns against. The
 * pieces below carry the sizes that recur (a heading block, lines of body
 * copy, a card, a tile grid, accordion rows); each route arranges them into
 * its own layout.
 *
 * Every piece builds on the `Skeleton` atom, which is `aria-hidden` and
 * already honours `prefers-reduced-motion`.
 */

export interface PageHeadingSkeletonProps {
  /** Renders the small label line some pages show above the heading. */
  withLabel?: boolean;
  /** Renders the short intro paragraph under the heading. */
  withIntro?: boolean;
  className?: string;
}

export function PageHeadingSkeleton({ withLabel = false, withIntro = false, className }: PageHeadingSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {withLabel && <Skeleton className="h-4 w-40" />}
      <Skeleton className="h-12 w-full max-w-sm" />
      {withIntro && <Skeleton className="h-4 w-full max-w-xs" />}
    </div>
  );
}

export interface TextLinesSkeletonProps {
  lines?: number;
  className?: string;
}

/** A paragraph's worth of lines, last one short so it reads as prose rather than a block. */
export function TextLinesSkeleton({ lines = 3, className }: TextLinesSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn("h-4", index === lines - 1 ? "w-3/4" : "w-full")} />
      ))}
    </div>
  );
}

export interface AccordionSkeletonProps {
  rows?: number;
  className?: string;
}

/** Collapsed accordion rows, matching the divided rows the real Accordion renders. */
export function AccordionSkeleton({ rows = 4, className }: AccordionSkeletonProps) {
  return (
    <div className={cn("divide-y divide-border", className)}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="py-4">
          <Skeleton className="h-6 w-full max-w-md" />
        </div>
      ))}
    </div>
  );
}

export interface CardSkeletonProps {
  lines?: number;
  /** Renders a full-width pill where the card's CTA sits. */
  withAction?: boolean;
  className?: string;
}

export function CardSkeleton({ lines = 4, withAction = false, className }: CardSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-xl border-hairline border-border bg-surface p-6 sm:p-8", className)}>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-32" />
      <TextLinesSkeleton lines={lines} />
      {withAction && <Skeleton className="mt-4 h-11 w-full rounded-full" />}
    </div>
  );
}

export interface CardGridSkeletonProps {
  count?: number;
  lines?: number;
  withAction?: boolean;
  className?: string;
}

export function CardGridSkeleton({ count = 2, lines = 4, withAction = false, className }: CardGridSkeletonProps) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2", className)}>
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} lines={lines} withAction={withAction} />
      ))}
    </div>
  );
}

export interface MediaTilesSkeletonProps {
  count?: number;
  /** Tailwind aspect utility matching the real tiles, so swapping in content doesn't shift layout. */
  aspectClassName?: string;
  className?: string;
  tileClassName?: string;
}

/** A row/grid of media tiles — galleries, filmstrips, card imagery. */
export function MediaTilesSkeleton({
  count = 3,
  aspectClassName = "aspect-[4/3]",
  className,
  tileClassName,
}: MediaTilesSkeletonProps) {
  return (
    <div className={cn("flex gap-4 overflow-hidden", className)}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className={cn(aspectClassName, "shrink-0", tileClassName)} />
      ))}
    </div>
  );
}

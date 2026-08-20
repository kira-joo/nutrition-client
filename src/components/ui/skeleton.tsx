import { cn } from "@/lib/cn";

export interface SkeletonProps {
  className?: string;
}

/**
 * A single placeholder block. Callers compose these into a shape that
 * matches the real content's dimensions — per §18 that's a CLS
 * requirement, not a polish detail: a skeleton whose size doesn't match
 * what replaces it causes exactly the layout shift it was meant to avoid.
 *
 * `motion-reduce:animate-none` keeps the pulse inside the same
 * reduced-motion contract the JS animation layer honors; a CSS animation
 * would otherwise bypass `usePrefersReducedMotion` entirely.
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-surface-muted motion-reduce:animate-none", className)} />;
}

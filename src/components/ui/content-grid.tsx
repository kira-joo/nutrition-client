import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The 1/2/3 responsive card rhythm shared by preview sections and browsers. Exported separately so callers whose wrapper element is already owned by something else (e.g. `RevealGroup`, which needs the grid classes on its own ref'd element) can merge it in via `cn` instead of nesting another element. */
export const CONTENT_GRID_CLASSNAME = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8";

export interface ContentGridProps {
  as?: "div" | "ul";
  className?: string;
  children: ReactNode;
}

/** Plain 1/2/3 grid wrapper for callers that don't already have another component owning the element (see `CONTENT_GRID_CLASSNAME` for that case). */
export function ContentGrid({ as: Tag = "div", className, children }: ContentGridProps) {
  return <Tag className={cn(CONTENT_GRID_CLASSNAME, className)}>{children}</Tag>;
}

import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ContainerWidth = "narrow" | "content" | "wide";

const WIDTH_CLASS: Record<ContainerWidth, string> = {
  narrow: "max-w-narrow",
  content: "max-w-content",
  wide: "max-w-wide",
};

export interface ContainerProps {
  as?: ElementType;
  /** See docs/design-system.md ("Spacing & containers") — `narrow` for pure reading content, `content` for the standard page width, `wide` for full-bleed-adjacent moments. Defaults to `content`. */
  width?: ContainerWidth;
  className?: string;
  children: ReactNode;
}

/** No component in this app sets its own horizontal max-width/padding directly — every section-level width decision routes through this one component. */
export function Container({ as: Tag = "div", width = "content", className, children }: ContainerProps) {
  return <Tag className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12", WIDTH_CLASS[width], className)}>{children}</Tag>;
}

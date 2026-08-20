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
  /**
   * Pins text direction for content whose language does not follow the active
   * locale. Leave it unset — direction then comes from `<html dir>`, which is
   * correct for everything that is actually translated, and overriding it
   * locally would break that.
   *
   * The case it exists for is a route that is single-language by design: Books
   * is Arabic-only end to end (see `middleware.ts`), so its copy is hardcoded
   * Arabic and must read right-to-left whatever the surrounding locale says.
   */
  dir?: "rtl" | "ltr";
  children: ReactNode;
}

/** No component in this app sets its own horizontal max-width/padding directly — every section-level width decision routes through this one component. */
export function Container({ as: Tag = "div", width = "content", className, dir, children }: ContainerProps) {
  return (
    <Tag dir={dir} className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12", WIDTH_CLASS[width], className)}>
      {children}
    </Tag>
  );
}

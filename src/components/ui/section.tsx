import type { ElementType, ReactNode } from "react";
import { cn } from "@kira-joo/frontend-toolkit-tailwind/server";

type SectionSpacing = "default" | "sm" | "none";

const SPACING_CLASS: Record<SectionSpacing, string> = {
  default: "py-section-y",
  sm: "py-section-y-sm",
  none: "",
};

export interface SectionProps {
  as?: ElementType;
  spacing?: SectionSpacing;
  className?: string;
  id?: string;
  children: ReactNode;
}

/** The one place vertical section rhythm is applied — no page section hardcodes its own `py-*` value. */
export function Section({ as: Tag = "section", spacing = "default", className, id, children }: SectionProps) {
  return (
    <Tag id={id} className={cn(SPACING_CLASS[spacing], className)}>
      {children}
    </Tag>
  );
}

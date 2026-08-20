import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const POSITION_CLASSES = {
  "top-start": "top-2 start-2",
  "bottom-start": "bottom-2 start-2",
  "bottom-end": "bottom-3 end-3",
} as const;

export type MediaPillPosition = keyof typeof POSITION_CLASSES;

export interface MediaPillProps {
  position: MediaPillPosition;
  icon?: ReactNode;
  children: ReactNode;
  /** Hidden until the media it sits on is hovered/focused, e.g. a "view photo" affordance rather than an always-visible label. */
  revealOnHover?: boolean;
  className?: string;
}

/** The overlay metadata pill used on card/media thumbnails — a category label, a before/after tag, or a hover-revealed action. Caller supplies the corner and whether it should hide until hover. */
export function MediaPill({ position, icon, children, revealOnHover = false, className }: MediaPillProps) {
  return (
    <span
      className={cn(
        "absolute rounded-full bg-surface/90 text-caption font-semibold text-text-primary backdrop-blur",
        POSITION_CLASSES[position],
        icon && "inline-flex items-center gap-1.5",
        revealOnHover
          ? "px-3 py-1.5 opacity-0 transition-opacity duration-base ease-standard group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
          : "px-2.5 py-1",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

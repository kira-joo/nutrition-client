import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { SURFACE_MUTED } from "@/components/ui/surface";

export interface EmptyPanelProps {
  /** Names what is missing — a clapperboard for videos, a quote mark for reviews. */
  icon: LucideIcon;
  /** The primary line. Kept prominent, because it is the only thing on the panel. */
  message: string;
  /**
   * A second, quieter line. Only the recipe browser has one, where an empty
   * result is usually the visitor's own filters rather than missing content, so
   * it can say what to change. Accepts `null` because that is what the recipe
   * browser's own resolver returns when there is nothing useful to add.
   */
  hint?: string | null;
  /**
   * A way out, rendered under the text. Only the recipe browser has one — an
   * empty result there is usually the visitor's own filters, so it offers to
   * clear them. An empty state with no recoverable cause should not invent one.
   */
  children?: ReactNode;
  className?: string;
}

/**
 * The "there is nothing here" panel.
 *
 * Five sections had this **byte-identical** — books, recipes, videos, reviews and
 * packages — down to the icon size, the `max-w-md break-words` on the message and
 * the `px-6 py-14`. Not similar: identical, which is the clearest possible case
 * for one component.
 *
 * The recessed `bg-surface-muted` fill is the point of the design: an empty state
 * should read as a container that has nothing in it, not as a card presenting
 * something. `break-words` matters more than it looks — these messages are
 * Arabic CMS-adjacent strings that can be long, and the panel is narrow on a
 * phone.
 *
 * Not the toolkit's `EmptyState`. That one is still on the stock slate palette
 * (doc 01 converted only the input and textarea), so adopting it here would put
 * grey-blue inside this warm palette. Worth revisiting once the toolkit's
 * remaining families move onto the role vocabulary.
 */
export function EmptyPanel({ icon: Icon, message, hint, children, className }: EmptyPanelProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", SURFACE_MUTED, className)}>
      <Icon aria-hidden="true" className="size-icon-xl text-text-muted" />
      <p className="max-w-md break-words text-body-lg font-semibold text-text-primary">{message}</p>
      {hint ? <p className="max-w-md text-body-sm text-text-secondary">{hint}</p> : null}
      {children}
    </div>
  );
}

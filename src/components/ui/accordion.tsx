"use client";
import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface AccordionItemData {
  id: string;
  question: ReactNode;
  answer: ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  className?: string;
  /** Allows more than one item open at once. Defaults to false (single-open), matching a typical FAQ preview. */
  allowMultiple?: boolean;
  /**
   * Heading level for each item's trigger. Every accordion trigger belongs
   * in a heading so screen-reader users can navigate the list by heading
   * and see it nested correctly under whatever precedes it — the level
   * can't be assumed, since a preview under an `h2` needs `h3` while a
   * standalone list might need `h2`.
   */
  headingLevel?: 2 | 3 | 4;
}

/**
 * Flat accordion rows with hairline dividers, no per-item card shadow —
 * per docs/design-system.md's card families, FAQ rows are the borderless-
 * editorial family, not soft-paper cards.
 *
 * Follows the ARIA disclosure pattern: the trigger is a real `<button>`
 * inside a heading, carrying `aria-expanded` and `aria-controls`, and the
 * panel is a labelled region. Native buttons mean Enter/Space, focus order,
 * and the global `:focus-visible` ring all come for free rather than being
 * reimplemented. Closed panels are unmounted, not hidden, so their content
 * is genuinely absent from the accessibility tree and the tab order.
 */
export function Accordion({ items, className, allowMultiple = false, headingLevel = 3 }: AccordionProps) {
  const baseId = useId();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const Heading = `h${headingLevel}` as const;

  function toggle(id: string) {
    setOpenIds((current) => {
      const next = allowMultiple ? new Set(current) : new Set<string>();
      if (current.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className={cn("divide-y divide-border", className)}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const triggerId = `${baseId}-trigger-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <div key={item.id} className="py-4">
            <Heading className="text-body-lg font-semibold text-text-primary">
              <button
                type="button"
                id={triggerId}
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 rounded-sm text-start"
              >
                {/* min-w-0 + break-words so a long unbroken question wraps instead of pushing the chevron out of the row. */}
                <span className="min-w-0 break-words">{item.question}</span>
                {/*
                  The chevron is directional-only (rotation communicates
                  state, not content), so it needs no RTL mirroring — it
                  rotates in place rather than pointing start/end.
                  `motion-reduce:transition-none` keeps this inside the same
                  reduced-motion contract the GSAP layer honors; a CSS
                  transition would otherwise bypass that gate entirely.
                */}
                <ChevronDown
                  className={cn(
                    "size-icon-md shrink-0 text-text-muted transition-transform duration-fast motion-reduce:transition-none",
                    isOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>
            </Heading>

            {isOpen && (
              <div id={panelId} role="region" aria-labelledby={triggerId} className="mt-3 break-words text-body text-text-secondary">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

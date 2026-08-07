"use client";
import { useState, type ReactNode } from "react";
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
  /** Allows more than one item open at once. Defaults to false (single-open), matching a typical FAQ pattern. */
  allowMultiple?: boolean;
}

/**
 * Flat accordion rows with hairline dividers, no per-item card shadow —
 * per docs/design-system.md's card families, FAQ rows are the borderless-
 * editorial family, not soft-paper cards.
 */
export function Accordion({ items, className, allowMultiple = false }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

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
        return (
          <div key={item.id} className="py-4">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 text-start text-body-lg font-semibold text-text-primary"
            >
              <span>{item.question}</span>
              {/* The chevron is a directional-only icon (rotation communicates state, not content) — no RTL mirroring needed since it rotates in place rather than pointing start/end. */}
              <ChevronDown className={cn("size-icon-md shrink-0 text-text-muted transition-transform duration-fast", isOpen && "rotate-180")} aria-hidden="true" />
            </button>
            {isOpen && <div className="mt-3 text-body text-text-secondary">{item.answer}</div>}
          </div>
        );
      })}
    </div>
  );
}

"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";

export interface IngredientChecklistProps {
  ingredients: string[];
  label: string;
}

/**
 * Ingredients as a tick-off list, per the approved plan — the one piece of
 * genuine cooking-mode value that costs almost nothing.
 *
 * Real checkboxes rather than clickable divs: label association, Space to
 * toggle, and the checked state being announced all come for free. State is
 * intentionally not persisted — it's scratch state for one cooking session,
 * and restoring stale ticks on a later visit would be worse than starting
 * clean.
 */
export function IngredientChecklist({ ingredients, label }: IngredientChecklistProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <ul aria-label={label} className="flex flex-col gap-1">
      {ingredients.map((ingredient, index) => {
        const isChecked = checked.has(index);
        return (
          <li key={index}>
            <label className="flex cursor-pointer items-start gap-3 rounded-md py-2 transition-colors duration-fast hover:bg-surface-muted motion-reduce:transition-none">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(index)}
                className="mt-1 size-icon-sm shrink-0 accent-primary"
              />
              <span className={cn("min-w-0 break-words text-body text-text-secondary", isChecked && "text-text-muted line-through")}>{ingredient}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

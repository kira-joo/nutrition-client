"use client";
import { useId } from "react";
import { cn } from "@/lib/cn";

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  /** Visually hidden, but the group still needs an accessible name. */
  legend: string;
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * A `<fieldset>` of native radios in pill `<label>`s, chosen over buttons
 * with `aria-pressed`: a value from a fixed set is a radio group's exact
 * semantic, which brings arrow-key navigation and one-Tab-stop behavior for
 * free instead of reimplementing both. Local for now — package pricing is
 * its only consumer, but it's the most likely first thing to graduate to a
 * shared toolkit once staff's `CustomRadioGroup` needs the same treatment.
 */
export function SegmentedControl<T extends string>({ legend, options, value, onChange, className }: SegmentedControlProps<T>) {
  const groupName = useId();

  return (
    <fieldset className={className}>
      <legend className="sr-only">{legend}</legend>
      <div className="flex flex-wrap gap-2 rounded-full border-hairline border-border bg-surface p-1 lg:inline-flex">
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex-1 cursor-pointer rounded-full px-4 py-2 text-center text-body-sm font-semibold transition-colors duration-base ease-standard lg:flex-none",
                "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
                isActive ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <input type="radio" name={groupName} value={option.value} checked={isActive} onChange={() => onChange(option.value)} className="sr-only" />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

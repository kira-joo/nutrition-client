"use client";
import { useId } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import AppRoute from "@/constant/AppRoute.enum";
import type { LocalizedRecipeTaxonomyTerm } from "@/lib/domain/recipe-taxonomy";
import { toSearchParamsString, type RecipeFilters } from "@/lib/recipes/recipe-search-params";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LABEL_TYPE } from "@/components/ui/typography";

export interface RecipeFilterPanelProps {
  filters: RecipeFilters;
  categories: LocalizedRecipeTaxonomyTerm[];
  foodGroups: LocalizedRecipeTaxonomyTerm[];
  labels: {
    searchLabel: string;
    searchPlaceholder: string;
    category: string;
    foodGroup: string;
    all: string;
    clear: string;
  };
  /** Called after any change, so the mobile sheet can close itself on selection. */
  onNavigate?: () => void;
}

/**
 * The one filter surface, rendered in the desktop sidebar and inside the
 * mobile sheet — the same controls either way, so the two can't drift.
 *
 * Every change rewrites the URL rather than holding local state: the
 * listing is a Server Component that queries the backend, so the URL is
 * what "currently filtered" means. Changing any filter resets to page 1,
 * since staying on page 4 of a narrower result set usually lands on
 * nothing.
 *
 * Search submits on Enter rather than on every keystroke — each change is a
 * server round trip, and firing one per character would queue requests the
 * visitor never asked for. The form still works as a plain GET if the
 * router hasn't hydrated.
 */
export function RecipeFilterPanel({ filters, categories, foodGroups, labels, onNavigate }: RecipeFilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchId = useId();
  const categoryName = useId();
  const foodGroupName = useId();

  function apply(next: Partial<RecipeFilters>) {
    router.push(`${pathname}${toSearchParamsString({ ...filters, ...next, page: 1 })}`);
    onNavigate?.();
  }

  const hasActiveFilters = Boolean(filters.search || filters.category || filters.foodGroup);

  return (
    <div className="flex flex-col gap-8">
      <form
        action={AppRoute.Recipes}
        onSubmit={(event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget).get("search");
          apply({ search: typeof value === "string" ? value.trim() : "" });
        }}
      >
        <label htmlFor={searchId} className={cn(LABEL_TYPE, "text-text-muted")}>
          {labels.searchLabel}
        </label>
        <div className="relative mt-2">
          <Search aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-3 my-auto size-icon-sm text-text-muted" />
          <input
            id={searchId}
            name="search"
            type="search"
            defaultValue={filters.search}
            placeholder={labels.searchPlaceholder}
            className="h-control-md w-full rounded-full border-hairline border-border bg-surface ps-10 pe-4 text-body-sm text-text-primary placeholder:text-text-muted"
          />
        </div>
      </form>

      <FilterGroup
        legend={labels.category}
        name={categoryName}
        allLabel={labels.all}
        options={categories}
        value={filters.category}
        onChange={(category) => apply({ category })}
      />

      <FilterGroup
        legend={labels.foodGroup}
        name={foodGroupName}
        allLabel={labels.all}
        options={foodGroups}
        value={filters.foodGroup}
        onChange={(foodGroup) => apply({ foodGroup })}
      />

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => apply({ search: "", category: "", foodGroup: "" })}
          className="inline-flex items-center gap-1.5 self-start text-body-sm font-semibold text-primary pointer:hover:underline"
        >
          <X className="size-icon-sm" aria-hidden="true" />
          {labels.clear}
        </button>
      )}
    </div>
  );
}

interface FilterGroupProps {
  legend: string;
  name: string;
  allLabel: string;
  options: LocalizedRecipeTaxonomyTerm[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Native radios: one choice per taxonomy (which is what the API supports),
 * with arrow-key navigation and a single tab stop for free. An "All" option
 * rather than a separate reset per group, so clearing one filter is the
 * same interaction as setting it.
 */
function FilterGroup({ legend, name, allLabel, options, value, onChange }: FilterGroupProps) {
  if (options.length === 0) return null;

  return (
    <fieldset>
      <legend className={cn(LABEL_TYPE, "text-text-muted")}>{legend}</legend>
      <div className="mt-3 flex flex-col gap-1">
        {[{ _id: "", title: allLabel }, ...options].map((option) => {
          const isActive = option._id === value;
          return (
            <label
              key={option._id || "all"}
              className={cn(
                /* The label is the hit area, not the 16px radio — verified with
                   the mobile filter sheet open, where it owns its own centre. It
                   measured 37px though, so it gets a real 44px row on touch and
                   the compact rhythm back wherever a fine pointer exists. */
                "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-body-sm transition-colors duration-fast motion-reduce:transition-none touch:min-h-touch-min",
                "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
                isActive ? "bg-primary-soft font-semibold text-primary" : "text-text-secondary pointer:hover:bg-surface-muted"
              )}
            >
              <input
                type="radio"
                name={name}
                checked={isActive}
                onChange={() => onChange(option._id)}
                className="size-icon-sm shrink-0 accent-primary"
              />
              <span className="min-w-0 break-words">{option.title}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

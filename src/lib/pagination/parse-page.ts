/**
 * Reads a `?page=` value out of Next's `searchParams` shape. Every listing
 * route needs exactly this: Next hands back `string | string[] | undefined`
 * depending on whether the key was repeated in the URL, only a positive
 * integer is ever a valid page, and anything else — missing, `NaN`,
 * zero, negative, a repeated `?page=a&page=b` — falls back to page 1
 * rather than surfacing as an error over a cosmetic URL param.
 *
 * App-local for now rather than a toolkit export: it's a few lines with a
 * single, obvious shape, and the decision of which package would own it
 * (`frontend-toolkit-core`? `frontend-toolkit-tailwind`?) is better made
 * once the eventual toolkit-extraction pass looks at this alongside
 * whatever else has accumulated by then — see the project's established
 * pattern of deferring premature abstraction (e.g. `use-dialog-a11y.ts`'s
 * doc comment).
 */
export function parsePage(value: string | string[] | undefined, fallback = 1): number {
  const single = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(single ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

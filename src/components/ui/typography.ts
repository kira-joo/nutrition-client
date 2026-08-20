/**
 * Shared type treatments that are not components.
 *
 * `LABEL_TYPE` is the small-uppercase treatment used above a heading, over a
 * list, and on a form control's label. Doc 04 proposed an `<Eyebrow>` component
 * for it and offered the alternative explicitly: "an explicit decision that
 * `<dt>`/field-label uses are semantically different and keep the raw class.
 * Decide by reading all 10, not by matching the string."
 *
 * Reading them, they are three different jobs that happen to share a font
 * treatment:
 *
 *   - **An eyebrow** above a page or section heading — `hero-section`,
 *     `doctor-preview-section`, `packages-pricing-section`, and `PageHeader`,
 *     which already owns this case for every header it renders.
 *   - **A form control's label**, on a real `<label htmlFor>` and a real
 *     `<legend>` in `recipe-filter-panel`.
 *   - **A label introducing a list** — the footer's column headings and the
 *     pricing card's "includes".
 *
 * A component is the wrong shape for that set. `<legend>` must be a direct child
 * of its `<fieldset>`, so wrapping it changes what the markup means; a `<label>`
 * needs `htmlFor` forwarded; and the colour is not shared at all — an eyebrow is
 * `text-primary` or `text-accent`, a form label and a list label are
 * `text-text-muted`, and the footer's is `text-on-inverse-muted`. A single
 * component would have to take the element *and* the colour as props, at which
 * point it is this constant with extra steps.
 *
 * So the treatment is shared and the colour stays at the call site, where it
 * carries meaning.
 */
export const LABEL_TYPE = "text-label font-semibold uppercase tracking-wide";

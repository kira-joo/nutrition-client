/**
 * The Arabic chapter label the book template stamps on every chapter
 * opener ("الفصل الأول", "الفصل الثاني", ...). Hand-synced from
 * nutrition-staff's `src/common/books/chapter-label.ts` — kept there in
 * `src/common` so the print renderer and staff preview agree by
 * construction; this copy must match it exactly. Keep both in sync by hand.
 *
 * Ordinals are spelled out to 20 and fall back to digits past that. The
 * cutoff isn't arbitrary: `MAX_CHAPTERS` is 60 (`book-limits.ts`), so a
 * book *can* exceed the list, and "الفصل 34" is honest and readable
 * whereas a hand-rolled attempt at "الفصل الرابع والثلاثون" is where
 * agreement/gender/construct-state mistakes creep in. A real book almost
 * never has more than ~20 chapters, so the spelled-out range covers the
 * realistic case and the fallback covers the rest without inventing
 * grammar we can't verify.
 */
const ARABIC_ORDINALS = [
  "الأول",
  "الثاني",
  "الثالث",
  "الرابع",
  "الخامس",
  "السادس",
  "السابع",
  "الثامن",
  "التاسع",
  "العاشر",
  "الحادي عشر",
  "الثاني عشر",
  "الثالث عشر",
  "الرابع عشر",
  "الخامس عشر",
  "السادس عشر",
  "السابع عشر",
  "الثامن عشر",
  "التاسع عشر",
  "العشرون",
] as const;

/**
 * `chapterNumber` is 1-based and counts EVERY chapter by position, not just
 * the ones in the table of contents — a chapter with `includeInToc: false`
 * still occupies its place in the book, so skipping it would make every
 * later chapter's printed label disagree with its physical position.
 */
export function chapterLabel(chapterNumber: number): string {
  const ordinal = ARABIC_ORDINALS[chapterNumber - 1];
  return ordinal ? `الفصل ${ordinal}` : `الفصل ${chapterNumber}`;
}

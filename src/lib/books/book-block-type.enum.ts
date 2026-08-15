/**
 * Hand-synced, byte-for-byte, from nutrition-staff's
 * `src/common/enums/book-block-type.enum.ts` — the two repos deliberately
 * don't share a package for Books domain knowledge (see
 * `book-physical-order.ts`'s own doc comment for the same convention).
 * Keep both in sync by hand if a block type is ever added there.
 */
export enum BookBlockType {
  HEADING = "heading",
  SUBHEADING = "subheading",
  PARAGRAPH = "paragraph",
  IMAGE = "image",
  BULLET_LIST = "bulletList",
  NUMBERED_LIST = "numberedList",
  CHECKLIST = "checklist",
  QUOTE = "quote",
  TIP = "tip",
  NOTE = "note",
  WARNING = "warning",
  TABLE = "table",
  DIVIDER = "divider",
  PAGE_BREAK = "pageBreak",
  QR_LINK = "qrLink",
  RECIPE_REF = "recipeRef",
  CITATION = "citation",
  PAGE_FOOTER_NOTE = "pageFooterNote",
}

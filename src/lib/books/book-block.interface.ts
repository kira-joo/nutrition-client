import type { ImageAsset } from "@kira-joo/toolkit-common";
import { BookBlockType } from "./book-block-type.enum";
import type { RichTextDoc } from "./rich-text-doc.interface";

/**
 * Hand-synced from nutrition-staff's
 * `src/common/interfaces/book-block.interface.ts` — see
 * `book-block-type.enum.ts`'s doc comment. This app only ever READS
 * these (a published Edition's frozen content), so no DTO/validation
 * counterpart exists here — that's exclusively nutrition-staff's job at
 * authoring/publish time.
 */
interface BookBlockBase {
  id: string;
  order: number;
  keepWithNext?: boolean;
  avoidBreakInside?: boolean;
  citationIds?: string[];
}

export interface HeadingBlock extends BookBlockBase {
  type: BookBlockType.HEADING;
  text: string;
}

export interface SubheadingBlock extends BookBlockBase {
  type: BookBlockType.SUBHEADING;
  text: string;
}

export interface ParagraphBlock extends BookBlockBase {
  type: BookBlockType.PARAGRAPH;
  richText: RichTextDoc;
}

export interface ImageBlock extends BookBlockBase {
  type: BookBlockType.IMAGE;
  image: ImageAsset | null;
  caption?: string;
}

export interface BulletListBlock extends BookBlockBase {
  type: BookBlockType.BULLET_LIST;
  items: string[];
}

export interface NumberedListBlock extends BookBlockBase {
  type: BookBlockType.NUMBERED_LIST;
  items: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ChecklistBlock extends BookBlockBase {
  type: BookBlockType.CHECKLIST;
  items: ChecklistItem[];
}

export interface QuoteBlock extends BookBlockBase {
  type: BookBlockType.QUOTE;
  richText: RichTextDoc;
  attribution?: string;
}

export interface TipBlock extends BookBlockBase {
  type: BookBlockType.TIP;
  title?: string;
  richText: RichTextDoc;
}

export interface NoteBlock extends BookBlockBase {
  type: BookBlockType.NOTE;
  title?: string;
  richText: RichTextDoc;
}

export interface WarningBlock extends BookBlockBase {
  type: BookBlockType.WARNING;
  title?: string;
  richText: RichTextDoc;
}

export interface TableBlock extends BookBlockBase {
  type: BookBlockType.TABLE;
  headers: string[];
  rows: string[][];
}

export interface DividerBlock extends BookBlockBase {
  type: BookBlockType.DIVIDER;
}

export interface PageBreakBlock extends BookBlockBase {
  type: BookBlockType.PAGE_BREAK;
}

export interface QrLinkBlock extends BookBlockBase {
  type: BookBlockType.QR_LINK;
  label?: string;
  destination: string;
}

export interface RecipeRefBlock extends BookBlockBase {
  type: BookBlockType.RECIPE_REF;
  recipeId: string;
  displayTitle?: string;
}

export interface CitationBlock extends BookBlockBase {
  type: BookBlockType.CITATION;
  referenceId: string;
}

/**
 * Pins its content to the bottom of whatever physical page it lands on
 * (above the folio), reserving that space from the paginator's normal
 * packing rather than overlaying it — see `paginate-book.ts`'s
 * `"pageFooterNote"` FragmentKind branch. Generic and reusable (not
 * specific to the Copyright/Disclaimer footer, which stays baked into
 * `renderTitlePage` since the title page is a `singlePage` fragment this
 * block never competes with).
 */
export interface PageFooterNoteBlock extends BookBlockBase {
  type: BookBlockType.PAGE_FOOTER_NOTE;
  richText: RichTextDoc;
}

export type BookBlock =
  | HeadingBlock
  | SubheadingBlock
  | ParagraphBlock
  | ImageBlock
  | BulletListBlock
  | NumberedListBlock
  | ChecklistBlock
  | QuoteBlock
  | TipBlock
  | NoteBlock
  | WarningBlock
  | TableBlock
  | DividerBlock
  | PageBreakBlock
  | QrLinkBlock
  | RecipeRefBlock
  | CitationBlock
  | PageFooterNoteBlock;

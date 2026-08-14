/**
 * Hand-synced from nutrition-staff's
 * `src/common/books/rich-text/rich-text-doc.interface.ts` — see
 * `book-block-type.enum.ts`'s doc comment for why this is a deliberate
 * per-repo copy, not a shared package.
 */
export type RichTextMarkType = "bold" | "italic" | "highlight" | "link" | "citation";

export interface RichTextMark {
  type: RichTextMarkType;
  attrs?: { href?: string; referenceId?: string };
}

export interface RichTextNode {
  type: "paragraph" | "text";
  text?: string;
  marks?: RichTextMark[];
  content?: RichTextNode[];
}

export interface RichTextDoc {
  type: "doc";
  content: RichTextNode[];
}

/**
 * Hand-synced from nutrition-staff's
 * `src/common/books/rich-text/rich-text-doc.interface.ts` — see
 * `book-block-type.enum.ts`'s doc comment for why this is a deliberate
 * per-repo copy, not a shared package.
 */
import type { FontSizeToken, HighlightColorToken, TextColorToken } from "@/lib/books/rich-text-tokens";

export type RichTextMarkType = "bold" | "italic" | "highlight" | "link" | "citation" | "fontSize" | "textColor";

export interface RichTextMark {
  type: RichTextMarkType;
  attrs?: {
    href?: string;
    referenceId?: string;
    /** "highlight" (optional — absent/null means the historical yellow) and "textColor" (required). Always a token, never CSS. */
    color?: HighlightColorToken | TextColorToken | null;
    /** "fontSize". Always a token, never a CSS length. */
    size?: FontSizeToken | null;
  };
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

import type { RichTextDoc, RichTextMark, RichTextNode } from "@/lib/books/rich-text-doc.interface";
import { DEFAULT_HIGHLIGHT_COLOR, isFontSizeToken, isHighlightColorToken, isTextColorToken } from "@/lib/books/rich-text-tokens";

/**
 * Hand-synced from nutrition-staff's
 * `src/common/books/rich-text/render-rich-text.ts` — the one JSON→HTML
 * renderer, mirrored here so the Flipbook's own client-side paginator
 * (which measures real rendered HTML, exactly like the PDF renderer
 * does) produces markup with the identical mark→tag mapping. Escapes
 * text content on output; only `href`s already restricted to safe
 * protocols by nutrition-staff's authoring-time validator are ever
 * emitted as an attribute.
 */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const SAFE_HREF_PATTERN = /^(https?:\/\/|\/)/;

function renderMarksOpen(marks: RichTextMark[]): string {
  return marks
    .map((mark) => {
      switch (mark.type) {
        case "bold":
          return "<strong>";
        case "italic":
          return "<em>";
        case "highlight": {
          // Absent/unknown colour falls back to the historical yellow, so
          // Editions published before colours existed render unchanged.
          const color = isHighlightColorToken(mark.attrs?.color) ? mark.attrs?.color : DEFAULT_HIGHLIGHT_COLOR;
          return `<mark class="book-highlight book-highlight--${color}">`;
        }
        case "fontSize":
          return isFontSizeToken(mark.attrs?.size) ? `<span class="book-text-${mark.attrs?.size}">` : "<span>";
        case "textColor":
          return isTextColorToken(mark.attrs?.color) ? `<span class="book-text-color-${mark.attrs?.color}">` : "<span>";
        case "link": {
          const href = mark.attrs?.href && SAFE_HREF_PATTERN.test(mark.attrs.href) ? mark.attrs.href : "";
          return href ? `<a href="${escapeHtml(href)}">` : "<span>";
        }
        case "citation":
          return '<sup class="book-citation">';
        default:
          return "";
      }
    })
    .join("");
}

function renderMarksClose(marks: RichTextMark[]): string {
  return marks
    .slice()
    .reverse()
    .map((mark) => {
      switch (mark.type) {
        case "bold":
          return "</strong>";
        case "italic":
          return "</em>";
        case "highlight":
          return "</mark>";
        case "fontSize":
        case "textColor":
          return "</span>";
        case "link":
          return mark.attrs?.href && SAFE_HREF_PATTERN.test(mark.attrs.href) ? "</a>" : "</span>";
        case "citation":
          return "</sup>";
        default:
          return "";
      }
    })
    .join("");
}

function renderNode(node: RichTextNode): string {
  if (node.type === "text") {
    const text = escapeHtml(node.text ?? "");
    const marks = node.marks ?? [];
    return `${renderMarksOpen(marks)}${text}${renderMarksClose(marks)}`;
  }
  const inner = (node.content ?? []).map(renderNode).join("");
  return `<p>${inner}</p>`;
}

export function renderRichTextToHtml(doc: RichTextDoc | null | undefined): string {
  if (!doc || !Array.isArray(doc.content)) return "";
  return doc.content.map(renderNode).join("");
}

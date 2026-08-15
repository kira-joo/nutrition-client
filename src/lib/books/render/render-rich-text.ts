import type { RichTextDoc, RichTextMark, RichTextNode } from "@/lib/books/rich-text-doc.interface";

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
        case "highlight":
          return '<mark class="book-highlight">';
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

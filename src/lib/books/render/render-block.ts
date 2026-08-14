import type { ImageAsset } from "@kira-joo/toolkit-common";
import { BookBlockType } from "@/lib/books/book-block-type.enum";
import type { BookBlock, RecipeRefBlock } from "@/lib/books/book-block.interface";
import type { BookReference } from "@/lib/books/book-chapter.interface";
import type { RecipeSnapshot } from "@/lib/domain/book";
import { escapeHtml, renderRichTextToHtml } from "./render-rich-text";
import { generateQrSvg } from "./generate-qr-svg";
import type { StreamFragment } from "./page-model.interface";

/**
 * Adapted from nutrition-staff's
 * `src/server/books/render/dr-omnia-book-v1/render-block.ts` — same
 * markup/classes (`template-css.ts` is hand-synced too), so a page
 * rendered here is visually identical to the print/PDF output. The one
 * structural difference: nutrition-staff's paginator can split a long
 * PARAGRAPH mid-block and needs mark-preserving run data for that; this
 * app's Flipbook paginator (see `paginate-book.ts`) works at BLOCK
 * granularity only (a documented v1 simplification — see the Phase H
 * report), so `richTextParagraphs`/mid-paragraph splitting were not
 * ported. A block that doesn't fit moves whole to the next page.
 *
 * `recipeSnapshots` is always available here (the public reader only
 * ever has a published Edition, which always carries its frozen
 * snapshots) — unlike nutrition-staff's version, where it's optional
 * because Staff Preview of a live draft has none yet.
 */
export async function renderBlockToFragment(block: BookBlock, references: BookReference[], recipeSnapshots: Record<string, RecipeSnapshot>): Promise<StreamFragment> {
  const base = {
    id: block.id,
    chapterId: null as string | null,
    keepWithNext: block.keepWithNext ?? false,
    forceNewPage: false,
  };

  switch (block.type) {
    case BookBlockType.HEADING:
      return { ...base, kind: "content", html: `<h2 class="book-heading">${escapeHtml(block.text)}</h2>`, atomic: true, splittable: false, keepWithNext: block.keepWithNext ?? true };
    case BookBlockType.SUBHEADING:
      return { ...base, kind: "content", html: `<h3 class="book-subheading">${escapeHtml(block.text)}</h3>`, atomic: true, splittable: false, keepWithNext: block.keepWithNext ?? true };
    case BookBlockType.PARAGRAPH:
      return { ...base, kind: "content", html: renderRichTextToHtml(block.richText), atomic: false, splittable: false };
    case BookBlockType.IMAGE:
      return { ...base, kind: "content", html: renderImageBlock(block.image, block.caption), atomic: true, splittable: false, degrade: "scaleImage" };
    case BookBlockType.BULLET_LIST:
      return { ...base, kind: "content", html: `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`, atomic: false, splittable: false };
    case BookBlockType.NUMBERED_LIST:
      return { ...base, kind: "content", html: `<ol>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`, atomic: false, splittable: false };
    case BookBlockType.CHECKLIST: {
      const itemsHtml = block.items.map(
        (item) => `<li><span class="book-checkbox${item.checked ? " checked" : ""}"></span><span>${escapeHtml(item.text)}</span></li>`
      );
      return { ...base, kind: "content", html: `<ul class="book-checklist">${itemsHtml.join("")}</ul>`, atomic: false, splittable: false };
    }
    case BookBlockType.QUOTE: {
      const attribution = block.attribution ? `<cite>— ${escapeHtml(block.attribution)}</cite>` : "";
      return { ...base, kind: "content", html: `<blockquote class="book-quote">${renderRichTextToHtml(block.richText)}${attribution}</blockquote>`, atomic: true, splittable: false };
    }
    case BookBlockType.TIP:
    case BookBlockType.NOTE:
    case BookBlockType.WARNING: {
      const variant = block.type === BookBlockType.TIP ? "tip" : block.type === BookBlockType.NOTE ? "note" : "warning";
      const title = block.title ? `<div class="book-callout-title">${escapeHtml(block.title)}</div>` : "";
      return { ...base, kind: "content", html: `<div class="book-callout book-callout-${variant}">${title}${renderRichTextToHtml(block.richText)}</div>`, atomic: true, splittable: false };
    }
    case BookBlockType.TABLE: {
      const headerHtml = `<thead><tr>${block.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>`;
      const rowsHtml = block.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`);
      return { ...base, kind: "content", html: `<table class="book-table">${headerHtml}<tbody>${rowsHtml.join("")}</tbody></table>`, atomic: true, splittable: false };
    }
    case BookBlockType.DIVIDER:
      return { ...base, kind: "content", html: `<hr class="book-divider" />`, atomic: true, splittable: false };
    case BookBlockType.PAGE_BREAK:
      return { ...base, kind: "pageBreakMarker", html: "", atomic: true, splittable: false };
    case BookBlockType.QR_LINK: {
      const qrSvg = await generateQrSvg(block.destination);
      return {
        ...base,
        kind: "content",
        html: `<div class="book-qr-link">${qrSvg}${block.label ? `<div class="book-qr-label">${escapeHtml(block.label)}</div>` : ""}</div>`,
        atomic: true,
        splittable: false,
      };
    }
    case BookBlockType.RECIPE_REF:
      return { ...base, kind: "content", html: renderRecipeRefBlock(block, recipeSnapshots[block.recipeId]), atomic: true, splittable: false };
    case BookBlockType.CITATION: {
      const reference = references.find((candidate) => candidate.id === block.referenceId);
      return { ...base, kind: "content", html: reference ? `<p class="book-citation-inline">[${escapeHtml(reference.label)}]</p>` : "", atomic: true, splittable: false };
    }
    default:
      return { ...base, kind: "content", html: "", atomic: true, splittable: false };
  }
}

function renderImageBlock(image: ImageAsset | null | undefined, caption: string | undefined): string {
  if (!image) return "";
  const captionHtml = caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : "";
  const dimensionAttrs = image.width && image.height ? ` width="${image.width}" height="${image.height}"` : "";
  return `<figure class="book-image"><img src="${escapeHtml(image.secureUrl)}" alt="${caption ? escapeHtml(caption) : ""}"${dimensionAttrs} />${captionHtml}</figure>`;
}

function renderRecipeRefBlock(block: RecipeRefBlock, snapshot: RecipeSnapshot | undefined): string {
  if (!snapshot) {
    return `<div class="book-recipe-ref">${escapeHtml(block.displayTitle ?? "وصفة")}</div>`;
  }
  const image = snapshot.image;
  const dimensionAttrs = image?.width && image?.height ? ` width="${image.width}" height="${image.height}"` : "";
  const imageHtml = image ? `<img class="book-recipe-ref-image" src="${escapeHtml(image.secureUrl)}" alt=""${dimensionAttrs} />` : "";
  const descriptionHtml = snapshot.description?.ar ? `<div class="book-recipe-ref-description">${escapeHtml(snapshot.description.ar)}</div>` : "";
  return `<div class="book-recipe-ref">${imageHtml}<div class="book-recipe-ref-body"><div class="book-recipe-ref-title">${escapeHtml(snapshot.title.ar)}</div>${descriptionHtml}</div></div>`;
}

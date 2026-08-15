import type { PublicResolvedIdentity } from "@/lib/domain/book";
import { escapeHtml } from "./render-rich-text";
import { chapterLabel } from "@/lib/books/chapter-label";
import type { Chapter, BookReference } from "@/lib/books/book-chapter.interface";
import { generateQrSvg } from "./generate-qr-svg";
import type { StreamFragment } from "./page-model.interface";

/**
 * Adapted from nutrition-staff's
 * `src/server/books/render/dr-omnia-book-v1/single-pages.ts` — same
 * markup/classes, taking a subset of the public reader payload
 * (`{title, subtitle, coverMode, coverImage, backCoverMode, backCoverImage}`)
 * instead of the full server-side `Book`/`BookSchema`.
 */
interface CoverBookFields {
  title: string;
  subtitle?: string;
  coverMode: "generated" | "uploaded";
  coverImage: { secureUrl: string } | null;
}

/**
 * Cover — no folio/running head. Two independent, EXPLICIT modes (see
 * nutrition-staff's `BookCoverMode` doc comment):
 *
 * - `"generated"` (default): the reusable template renders the dynamic
 *   title/subtitle/doctor identity over the template's own artwork.
 *   `coverImage` is ignored entirely in this mode, even if one is stored.
 * - `"uploaded"`: `coverImage` becomes the ENTIRE page, full-bleed — no
 *   title, subtitle, logo, or doctor name rendered over it at all.
 *
 * Hand-synced with nutrition-staff's identical function.
 */
export function renderCoverPage(book: CoverBookFields, identity: PublicResolvedIdentity): StreamFragment {
  if (book.coverMode === "uploaded" && book.coverImage) {
    const html = `<div class="book-cover book-cover--uploaded" style="--book-cover-image-url: url('${escapeHtml(book.coverImage.secureUrl)}')"></div>`;
    return { id: "cover", kind: "singlePage", pageKind: "cover", chapterId: null, html, atomic: true, splittable: false, keepWithNext: false, forceNewPage: false, numbered: false };
  }
  const html = `
    <div class="book-cover">
      <div class="book-cover-title">${escapeHtml(book.title)}</div>
      ${book.subtitle ? `<div class="book-cover-subtitle">${escapeHtml(book.subtitle)}</div>` : ""}
      ${identity.bookLogo ? `<img class="book-cover-logo" src="${escapeHtml(identity.bookLogo.secureUrl)}" alt="" />` : ""}
      ${identity.doctorName ? `<div class="book-cover-doctor">${escapeHtml(identity.doctorName)}</div>` : ""}
    </div>`;
  return { id: "cover", kind: "singlePage", pageKind: "cover", chapterId: null, html, atomic: true, splittable: false, keepWithNext: false, forceNewPage: false, numbered: false };
}

/**
 * The copyright/disclaimer legal block, pinned into the page immediately
 * after the front cover (the title page) rather than given its own page
 * or left to flow before the TOC — both tried and both rejected on
 * review. Baked directly into `renderTitlePage`'s own HTML rather than
 * pushed as a separate stream fragment: the title page is a `singlePage`
 * fragment, which always closes its own page immediately (see the
 * paginator's `layoutPass`), so nothing pushed after it in the stream
 * could ever land on that same physical page anyway — the only way to
 * guarantee "same page as the title" is to render it as part of that one
 * page's markup.
 */
function buildLegalFooterHtml(identity: PublicResolvedIdentity): string {
  if (!identity.copyrightText && !identity.disclaimer) return "";
  return `
    <div class="book-legal-footer">
      ${identity.copyrightText ? `<p>${escapeHtml(identity.copyrightText)}</p>` : ""}
      ${identity.disclaimer ? `<p>${escapeHtml(identity.disclaimer)}</p>` : ""}
    </div>`;
}

export function renderTitlePage(book: Pick<CoverBookFields, "title" | "subtitle">, identity: PublicResolvedIdentity): StreamFragment {
  const html = `
    <div class="book-title-page">
      <div class="book-title-page-main">
        <div class="book-title-page-title">${escapeHtml(book.title)}</div>
        ${book.subtitle ? `<div>${escapeHtml(book.subtitle)}</div>` : ""}
        ${identity.doctorName ? `<div>${escapeHtml(identity.doctorName)}</div>` : ""}
      </div>
      ${buildLegalFooterHtml(identity)}
    </div>`;
  return { id: "title-page", kind: "singlePage", pageKind: "titlePage", chapterId: null, html, atomic: true, splittable: false, keepWithNext: false, forceNewPage: false, numbered: false };
}

export function renderAboutDoctorPage(identity: PublicResolvedIdentity): StreamFragment | null {
  if (!identity.doctorName && !identity.doctorBio) return null;
  const html = `
    <div class="book-about-doctor-page">
      ${identity.doctorImage ? `<img class="book-doctor-image" src="${escapeHtml(identity.doctorImage.secureUrl)}" alt="" />` : ""}
      ${identity.doctorName ? `<div class="book-doctor-name">${escapeHtml(identity.doctorName)}</div>` : ""}
      ${identity.doctorTitle ? `<div class="book-doctor-title">${escapeHtml(identity.doctorTitle)}</div>` : ""}
      ${identity.doctorBio ? `<p>${escapeHtml(identity.doctorBio)}</p>` : ""}
    </div>`;
  return { id: "about-doctor-page", kind: "singlePage", pageKind: "aboutDoctorPage", chapterId: null, html, atomic: true, splittable: false, keepWithNext: false, forceNewPage: true, numbered: true };
}

export function renderTocReservationFragment(): StreamFragment {
  return { id: "toc-reservation", kind: "tocReservation", html: "", chapterId: null, atomic: true, splittable: false, keepWithNext: false, forceNewPage: true };
}

/**
 * Full-bleed, generic, and entirely data-driven — no book/chapter name is
 * ever hardcoded here. `chapterNumber` is the chapter's 1-based position
 * in the FULL (unfiltered) chapter list, matching how `paginate-book.ts`
 * builds its `tocChapters` labels.
 *
 * A chapter's own `coverImage`, when set, replaces the template's
 * botanical artwork entirely (`book-chapter-opener--custom-cover`, wired
 * via the `--book-chapter-cover-url` custom property). Now emitted as
 * `kind: "singlePage"` (a dedicated full page) rather than a content
 * fragment sharing a page with what follows — `startOnNewPage` therefore
 * no longer has an observable effect on a chapter opener specifically,
 * since a `singlePage` fragment always gets its own page regardless.
 * Hand-synced with nutrition-staff's identical function.
 */
export function renderChapterOpenerFragment(chapter: Chapter, chapterNumber: number, identity: PublicResolvedIdentity): StreamFragment {
  const hasCustomCover = Boolean(chapter.coverImage);
  const style = hasCustomCover ? ` style="--book-chapter-cover-url: url('${escapeHtml(chapter.coverImage!.secureUrl)}')"` : "";
  const html = `
    <div class="book-chapter-opener${hasCustomCover ? " book-chapter-opener--custom-cover" : ""}"${style}>
      <div class="book-chapter-band">
        <div class="book-chapter-label">${escapeHtml(chapterLabel(chapterNumber))}</div>
        <div class="book-chapter-title">${escapeHtml(chapter.title)}</div>
        ${chapter.subtitle ? `<div class="book-chapter-subtitle">${escapeHtml(chapter.subtitle)}</div>` : ""}
        ${chapter.intro ? `<p class="book-chapter-intro">${escapeHtml(chapter.intro)}</p>` : ""}
      </div>
      ${identity.doctorName ? `<div class="book-chapter-doctor">${escapeHtml(identity.doctorName)}</div>` : ""}
    </div>`;
  return {
    id: `chapter-opener-${chapter.id}`,
    kind: "singlePage",
    pageKind: "chapterOpener",
    chapterId: chapter.id,
    html,
    atomic: true,
    splittable: false,
    keepWithNext: false,
    forceNewPage: chapter.startOnNewPage,
    numbered: true,
  };
}

export function renderReferencesPage(references: BookReference[]): StreamFragment[] {
  if (references.length === 0) return [];
  const entries = references
    .map((reference) => `<div class="book-reference-entry"><span class="book-reference-label">${escapeHtml(reference.label)}:</span> ${escapeHtml(reference.text)}</div>`)
    .join("");
  return [
    { id: "references-heading", kind: "content", html: `<h2 class="book-heading">المراجع</h2>`, chapterId: null, atomic: true, splittable: false, keepWithNext: true, forceNewPage: true },
    { id: "references-list", kind: "content", html: `<div class="book-references-page">${entries}</div>`, chapterId: null, atomic: false, splittable: false, keepWithNext: false, forceNewPage: false },
  ];
}

/**
 * Same independent, explicit "generated"/"uploaded" contract as
 * `renderCoverPage` — `"uploaded"` (`backCoverImage` full-bleed, nothing
 * else rendered) short-circuits before any of the generated-mode
 * identity/contact resolution below. Hand-synced with nutrition-staff's
 * identical function.
 */
export async function renderBackCoverPage(
  book: { backCoverMode: "generated" | "uploaded"; backCoverImage: { secureUrl: string } | null },
  identity: PublicResolvedIdentity
): Promise<StreamFragment> {
  if (book.backCoverMode === "uploaded" && book.backCoverImage) {
    const html = `<div class="book-back-cover book-back-cover--uploaded" style="--book-back-cover-image-url: url('${escapeHtml(book.backCoverImage.secureUrl)}')"></div>`;
    return { id: "back-cover", kind: "singlePage", pageKind: "backCover", chapterId: null, html, atomic: true, splittable: false, keepWithNext: false, forceNewPage: true, numbered: false };
  }

  const ltrContactLines = [identity.contact.phone, identity.contact.whatsapp, identity.contact.email].filter(Boolean);
  const qrSvg = identity.qrDestination ? await generateQrSvg(identity.qrDestination) : null;
  const html = `
    <div class="book-back-cover">
      ${identity.backCoverAudienceText ? `<div class="book-back-cover-audience">${escapeHtml(identity.backCoverAudienceText)}</div>` : ""}
      ${identity.backCoverClosingText ? `<div class="book-back-cover-summary">${escapeHtml(identity.backCoverClosingText)}</div>` : ""}
      <div class="book-back-cover-contact">
        ${identity.websiteUrl ? `<div dir="ltr">${escapeHtml(identity.websiteUrl)}</div>` : ""}
        ${ltrContactLines.map((line) => `<div dir="ltr">${escapeHtml(line as string)}</div>`).join("")}
        ${identity.contact.address ? `<div>${escapeHtml(identity.contact.address)}</div>` : ""}
      </div>
      ${qrSvg ? `<div class="book-back-cover-qr">${qrSvg}</div>` : ""}
      ${identity.bookLogo ? `<img class="book-back-cover-logo" src="${escapeHtml(identity.bookLogo.secureUrl)}" alt="" />` : ""}
    </div>`;
  return { id: "back-cover", kind: "singlePage", pageKind: "backCover", chapterId: null, html, atomic: true, splittable: false, keepWithNext: false, forceNewPage: true, numbered: false };
}

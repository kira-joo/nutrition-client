import type { Book } from "@/lib/domain/book";
import { chapterLabel } from "@/lib/books/chapter-label";
import { renderBlockToFragment } from "./render-block";
import {
  renderAboutDoctorPage,
  renderBackCoverPage,
  renderChapterOpenerFragment,
  renderCoverPage,
  renderReferencesPage,
  renderTitlePage,
  renderTocReservationFragment,
} from "./single-pages";
import { BOOK_FONT_READINESS_PROBES } from "./fonts/fonts";
import type { PaginationResult, RenderedPage, StreamFragment, TocResultEntry } from "./page-model.interface";

const TOC_ENTRIES_PER_PAGE = 16;

/**
 * Adapted from nutrition-staff's `paginate-book.browser.ts` — same
 * general shape (measurement-based, real DOM, TOC fixpoint bounded at 3
 * passes), deliberately simplified to BLOCK granularity: nothing here
 * ever splits a paragraph/table/list mid-way (documented v1 limitation,
 * see the Phase H report). A block that doesn't fit in the remaining
 * space on the current page moves whole to the next page; a block too
 * tall even for an empty page degrades (an oversized image scales down,
 * same as the server) or is flagged with a warning and allowed to
 * overflow visually rather than clip silently.
 *
 * Runs in the visitor's own browser — real Chromium/Safari/Firefox
 * layout, not a headless sandbox — against the SAME template CSS/fonts
 * the PDF uses, injected by the caller (`Flipbook`) before this runs.
 */
export async function paginateBook(book: Book): Promise<PaginationResult> {
  const warnings: { code: string; message: string }[] = [];

  await ensureFontsReady();

  const stream = await buildStream(book);
  // `chapterNumber` (and therefore `label`) is computed BEFORE filtering
  // to `includeInToc` — a chapter excluded from the TOC still occupies
  // its place in the book, so filtering first would shift every later
  // chapter's printed ordinal off by however many were skipped.
  const tocChapters = book.content.chapters
    .map((chapter, index) => ({ chapter, chapterNumber: index + 1 }))
    .filter(({ chapter }) => chapter.includeInToc)
    .map(({ chapter, chapterNumber }) => ({ chapterId: chapter.id, title: chapter.tocTitle || chapter.title, label: chapterLabel(chapterNumber) }));

  const { widthPx: contentBoxWidthPx, heightPx: contentBoxHeightPx } = measureContentBoxPx();

  const sandbox = document.createElement("div");
  sandbox.className = "book-page-scope book-measure-sandbox";
  sandbox.style.position = "absolute";
  sandbox.style.visibility = "hidden";
  sandbox.style.top = "-99999px";
  sandbox.style.left = "0";
  sandbox.style.width = `${contentBoxWidthPx}px`;
  document.body.appendChild(sandbox);

  function measureHtmlHeight(html: string): number {
    sandbox.innerHTML = html;
    const height = sandbox.getBoundingClientRect().height;
    sandbox.innerHTML = "";
    return height;
  }

  function scaleImageFragmentToFit(html: string, pageHeightPx: number): string {
    const match = html.match(/width="(\d+)" height="(\d+)"/);
    const naturalWidth = match ? Number(match[1]) : 1;
    const naturalHeight = match ? Number(match[2]) : 1;
    const aspectRatio = naturalWidth / naturalHeight;

    let targetImageHeight = pageHeightPx;
    for (let attempt = 0; attempt < 4; attempt++) {
      const targetImageWidth = targetImageHeight * aspectRatio;
      const candidate = html.replace(/<img /, `<img style="height:${Math.floor(targetImageHeight)}px;width:${Math.floor(targetImageWidth)}px;max-width:100%;" `);
      const totalHeight = measureHtmlHeight(candidate);
      const overflow = totalHeight - pageHeightPx;
      if (overflow <= 0.5) return candidate;
      targetImageHeight = Math.max(1, targetImageHeight - overflow - 1);
    }
    const finalWidth = targetImageHeight * aspectRatio;
    return html.replace(/<img /, `<img style="height:${Math.floor(targetImageHeight)}px;width:${Math.floor(finalWidth)}px;max-width:100%;" `);
  }

  function layoutPass(tocPageCount: number): { pages: { kind: string; chapterId: string | null; html: string; numbered: boolean }[]; chapterPageIndex: Map<string, number> } {
    const pages: { kind: string; chapterId: string | null; html: string; numbered: boolean }[] = [];
    const chapterPageIndex = new Map<string, number>();
    // Placed fragments for the page currently being packed — kept as
    // parts (not one flat string) specifically so a PAGE_FOOTER_NOTE
    // fragment can retract already-placed fragments back onto the queue
    // when they don't leave enough room for it (see the "pageFooterNote"
    // branch below). `fragment` is null only for a singlePage's one-shot
    // HTML, which never needs to be retracted individually.
    let currentPageParts: { fragment: StreamFragment | null; html: string }[] = [];
    let usedHeight = 0;
    let currentKind = "content";
    let currentChapterId: string | null = null;

    function currentPageHtml(): string {
      return currentPageParts.map((part) => part.html).join("");
    }
    function openPage(kind: string, chapterId: string | null): void {
      currentPageParts = [];
      usedHeight = 0;
      currentKind = kind;
      currentChapterId = chapterId;
    }
    // `footerNoteHtml`, when given, wraps everything placed so far in
    // `.book-page-content-body` (a flex:1 box) followed by the footer —
    // the same "flex:1 above absorbs the space, non-growing sibling below
    // sits flush at the bottom" trick `renderTitlePage`'s legal footer
    // uses, reserving the footer's real height instead of overlaying it.
    function closePage(numbered: boolean, footerNoteHtml?: string): void {
      const bodyHtml = currentPageHtml();
      const html = footerNoteHtml !== undefined ? `<div class="book-page-content-body">${bodyHtml}</div>${footerNoteHtml}` : bodyHtml;
      pages.push({ kind: currentKind, chapterId: currentChapterId, html, numbered });
    }

    openPage("content", null);
    warnings.length = 0;

    const queue: StreamFragment[] = [...stream];
    let guard = 0;
    while (queue.length > 0) {
      guard += 1;
      if (guard > 5000) {
        warnings.push({ code: "PAGINATION_GUARD", message: "Pagination safety guard triggered — stopping to avoid an infinite loop." });
        break;
      }
      const fragment = queue.shift()!;
      const html = fragment.html;

      if (fragment.kind === "pageBreakMarker") {
        if (currentPageParts.length > 0) {
          closePage(true);
          openPage("content", currentChapterId);
        }
        continue;
      }

      const forceNewPage = fragment.forceNewPage && currentPageParts.length > 0;
      if (forceNewPage) {
        closePage(true);
        openPage("content", fragment.chapterId ?? currentChapterId);
      }

      if (fragment.kind === "singlePage") {
        if (currentPageParts.length > 0) closePage(fragment.numbered !== false);
        openPage(fragment.pageKind ?? "content", fragment.chapterId ?? null);
        currentPageParts = [{ fragment: null, html }];
        closePage(fragment.numbered !== false);
        // Chapter openers are singlePage fragments (a dedicated full-bleed
        // page), not their own FragmentKind — recorded right after the
        // page housing them was actually pushed, so `pages.length - 1` is
        // exactly that page's index regardless of whether a prior close
        // just happened above.
        if (fragment.pageKind === "chapterOpener" && fragment.chapterId) {
          chapterPageIndex.set(fragment.chapterId, pages.length - 1);
        }
        openPage("content", currentChapterId);
        continue;
      }

      if (fragment.kind === "tocReservation") {
        for (let i = 0; i < tocPageCount; i++) {
          if (currentPageParts.length > 0) closePage(true);
          openPage("toc", null);
          closePage(true);
          openPage("content", currentChapterId);
        }
        continue;
      }

      if (fragment.kind === "pageFooterNote") {
        // Degenerate case: the note itself doesn't fit even alone on an
        // empty page (its own region, not the whole book budget, since a
        // real footer note is a sentence or two — this is a safety valve,
        // not the common path). Only then does it get a dedicated page,
        // per spec: never silently create one otherwise.
        const aloneHeight = measureHtmlHeight(`<div class="book-page-content-body"></div>${html}`);
        if (aloneHeight > contentBoxHeightPx) {
          if (currentPageParts.length > 0) {
            closePage(true);
            openPage("content", currentChapterId);
          }
          closePage(true, html);
          warnings.push({ code: "FOOTER_NOTE_OVERFLOW", message: `Fragment ${fragment.id} does not fit within a single page even alone — it will overflow visually.` });
          openPage("content", currentChapterId);
          continue;
        }

        // Retract already-placed fragments from THIS page, one at a
        // time, until what remains plus the footer note fits together —
        // moving preceding content to the next page rather than letting
        // it overlap the footer. `aloneHeight <= contentBoxHeightPx` (just
        // checked above) guarantees this loop always terminates with a
        // fit once the page is empty.
        const requeued: StreamFragment[] = [];
        while (currentPageParts.length > 0 && measureHtmlHeight(`<div class="book-page-content-body">${currentPageHtml()}</div>${html}`) > contentBoxHeightPx) {
          const popped = currentPageParts.pop()!;
          if (popped.fragment) requeued.unshift(popped.fragment);
        }
        queue.unshift(...requeued);

        if (fragment.chapterId) currentChapterId = fragment.chapterId;
        closePage(true, html);
        openPage("content", currentChapterId);
        continue;
      }

      const remaining = contentBoxHeightPx - usedHeight;
      const height = measureHtmlHeight(html);

      if (height <= remaining) {
        currentPageParts.push({ fragment, html });
        usedHeight = measureHtmlHeight(currentPageHtml());
        if (fragment.chapterId) currentChapterId = fragment.chapterId;
        continue;
      }

      // Doesn't fit — block granularity only: retract whole to the next
      // page, never split. Only degrade/overflow once it doesn't even
      // fit alone on a fresh empty page.
      if (usedHeight > 0) {
        closePage(true);
        openPage("content", currentChapterId);
        queue.unshift(fragment);
        continue;
      }

      if (fragment.degrade === "scaleImage") {
        const scaled = scaleImageFragmentToFit(html, contentBoxHeightPx);
        currentPageParts.push({ fragment, html: scaled });
        usedHeight = measureHtmlHeight(currentPageHtml());
        warnings.push({ code: "IMAGE_SCALED_DOWN", message: `An oversized image/caption was scaled down to fit the page (fragment ${fragment.id}).` });
        continue;
      }

      warnings.push({ code: "BLOCK_OVERFLOW", message: `Fragment ${fragment.id} does not fit on an empty page and could not be split or scaled — it will overflow visually.` });
      currentPageParts.push({ fragment, html });
      usedHeight = measureHtmlHeight(currentPageHtml());
    }

    if (currentPageParts.length > 0 || pages.length === 0) closePage(true);
    return { pages, chapterPageIndex };
  }

  let tocPageCount = tocChapters.length > 0 ? Math.max(1, Math.ceil(tocChapters.length / TOC_ENTRIES_PER_PAGE)) : 0;
  let lastResult = layoutPass(tocPageCount);
  for (let pass = 0; pass < 2; pass++) {
    const nextTocPageCount = tocChapters.length > 0 ? Math.max(1, Math.ceil(tocChapters.length / TOC_ENTRIES_PER_PAGE)) : 0;
    if (nextTocPageCount === tocPageCount) break;
    tocPageCount = nextTocPageCount;
    lastResult = layoutPass(tocPageCount);
  }

  document.body.removeChild(sandbox);

  const pages = lastResult.pages;
  let folio = book.resolvedSettings.print.pageNumberStart;
  const numberedPages: RenderedPage[] = pages.map((page) => {
    if (!page.numbered) return { ...page, pageNumber: null };
    const pageNumber = folio;
    folio += 1;
    return { ...page, pageNumber };
  });

  const toc: TocResultEntry[] = tocChapters.map((chapter) => {
    const pageIndex = lastResult.chapterPageIndex.get(chapter.chapterId);
    const pageNumber = pageIndex !== undefined ? numberedPages[pageIndex]?.pageNumber ?? null : null;
    // 1-based physical position — `pageIndex` is the 0-based array index
    // `chapterPageIndex` already stores. Never derive this from `pageNumber`
    // (the printed folio): any unnumbered page before this chapter (cover,
    // title, copyright) shifts the two axes apart.
    const sequencePosition = pageIndex !== undefined ? pageIndex + 1 : null;
    return { chapterId: chapter.chapterId, title: chapter.title, label: chapter.label, pageNumber, sequencePosition };
  });

  fillTocPages(numberedPages, toc);

  return { pageCount: numberedPages.length, pages: numberedPages, toc, warnings };
}

/** Fills the reserved (empty) TOC pages with real entries + dotted leaders, splitting evenly across however many pages were reserved — mirrors nutrition-staff's `build-book-html.ts`'s `fillTocPages` exactly, adapted to mutate `RenderedPage.html` instead of a plain page-model object. */
function fillTocPages(pages: RenderedPage[], toc: TocResultEntry[]): void {
  const tocPageIndexes: number[] = [];
  pages.forEach((page, index) => {
    if (page.kind === "toc") tocPageIndexes.push(index);
  });
  if (tocPageIndexes.length === 0) return;

  const perPage = Math.ceil(toc.length / tocPageIndexes.length) || 1;
  tocPageIndexes.forEach((pageIndex, position) => {
    const entries = toc.slice(position * perPage, (position + 1) * perPage);
    const rows = entries
      .map(
        (entry) =>
          `<div class="book-toc-entry" data-toc-chapter-id="${entry.chapterId}"><span class="book-toc-entry-title">${escapeHtmlInline(entry.title)}</span><span class="book-toc-entry-leader"></span><span class="book-toc-entry-page">${entry.pageNumber !== null ? entry.pageNumber : ""}</span></div>`
      )
      .join("");
    const heading = position === 0 ? '<div class="book-toc-title">المحتويات</div>' : "";
    pages[pageIndex].html = `<div class="book-toc-page">${heading}${rows}</div>`;
  });
}

function escapeHtmlInline(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function ensureFontsReady(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all(BOOK_FONT_READINESS_PROBES.map((probe) => document.fonts.load(`${probe.weight} 16px "${probe.family}"`, probe.sampleText)));
  await document.fonts.ready;
}

/** Renders one throwaway page to measure the REAL content box in px — never a hand-computed mm-to-px approximation, so sub-pixel rounding is the browser's own consistent value. Reads no geometry directly: the probe's `.book-page-content` class already gets its `mm` width from the `<style>` tag the caller has already mounted. */
function measureContentBoxPx(): { widthPx: number; heightPx: number } {
  const probe = document.createElement("div");
  probe.className = "book-page-scope book-page";
  probe.setAttribute("data-side", "right");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.innerHTML = '<div class="book-page-content"></div>';
  document.body.appendChild(probe);
  const contentBox = probe.querySelector(".book-page-content") as HTMLElement;
  const rect = contentBox.getBoundingClientRect();
  document.body.removeChild(probe);
  return { widthPx: rect.width, heightPx: rect.height };
}

async function buildStream(book: Book): Promise<StreamFragment[]> {
  const stream: StreamFragment[] = [];
  const identity = book.resolvedSettings;

  // Front matter order: cover, title (the copyright/disclaimer legal footer
  // is baked into the title page itself, pinned to its bottom — see
  // `renderTitlePage`), "About the Book" (frontMatter.aboutBook — real
  // published content, not a hardcoded page), "About the Doctor" (the
  // template's own fixed identity page), "Introduction" (frontMatter.introduction),
  // THEN the reserved TOC pages, then chapters. Hand-synced with
  // nutrition-staff's identical ordering.
  stream.push(renderCoverPage({ title: book.title, subtitle: book.subtitle, coverMode: book.coverMode, coverImage: book.coverImage }, identity));
  stream.push(renderTitlePage({ title: book.title, subtitle: book.subtitle }, identity));

  for (const block of book.content.frontMatter.aboutBook.blocks) stream.push(await renderBlockToFragment(block, book.content.references, book.recipeSnapshots));

  const aboutDoctor = renderAboutDoctorPage(identity);
  if (aboutDoctor) stream.push(aboutDoctor);

  for (const block of book.content.frontMatter.introduction.blocks) stream.push(await renderBlockToFragment(block, book.content.references, book.recipeSnapshots));

  stream.push(renderTocReservationFragment());

  for (let index = 0; index < book.content.chapters.length; index++) {
    const chapter = book.content.chapters[index];
    stream.push(renderChapterOpenerFragment(chapter, index + 1, identity));
    for (const block of chapter.blocks) {
      const fragment = await renderBlockToFragment(block, book.content.references, book.recipeSnapshots);
      stream.push({ ...fragment, chapterId: chapter.id });
    }
  }

  for (const block of book.content.backMatter.conclusion.blocks) stream.push(await renderBlockToFragment(block, book.content.references, book.recipeSnapshots));
  for (const fragment of renderReferencesPage(book.content.references)) stream.push(fragment);
  stream.push(await renderBackCoverPage({ backCoverMode: book.backCoverMode, backCoverImage: book.backCoverImage }, identity));

  return stream;
}

"use client";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import type { Page as PageFlipPage, PageFlip as PageFlipInstance } from "page-flip";
import { sideOf } from "@/lib/books/render/book-physical-order";
import type { RenderedPage } from "@/lib/books/render/page-model.interface";
import type { FlipEngineHandle, FlipEngineProps } from "./flip-engine.interface";

/**
 * The ONLY file in the codebase that imports `page-flip`. Everything the
 * library needs that our Book System doesn't naturally provide — RTL
 * binding, mm-based A5 geometry, hard covers, its own quirks — is
 * absorbed here, behind `flip-engine.interface.ts`.
 */

/** CSS defines 1in = 96px = 25.4mm exactly, so this conversion is lossless rather than an approximation of any device DPI. */
const PX_PER_MM = 96 / 25.4;

const FLIPPING_TIME_MS = 800;

/** How long the book slides when it widens from a lone cover to a full spread (and back). */
const CENTERING_TRANSITION_MS = 240;

/** Below this, a stage measurement is treated as "not laid out yet" rather than a real size — see `applyLayout`. */
const MIN_USABLE_STAGE_PX = 40;

/**
 * A real blank leaf used only to make the deck's page count even — see
 * `normaliseDeck`. Deliberately empty: no HTML, no folio, not numbered.
 * It carries no invented content and is never reachable, because the
 * reader's own `pageCount` comes from the paginator and stops one short
 * of it.
 */
const BLANK_LEAF: RenderedPage = { kind: "blank", chapterId: null, html: "", numbered: false, pageNumber: null };

/**
 * StPageFlip's landscape spread pairing only lands our RTL left/right
 * parity when the deck has an EVEN page count (see `buildPageElements`
 * for the reversal that depends on it). With an odd count its
 * `createSpread` pairs our cover with page 2 instead of leaving it alone,
 * putting an even page in the left slot and breaking the "left = right +
 * 1" invariant `book-physical-order.ts` guarantees.
 *
 * The filler is APPENDED, never inserted: appending leaves every real
 * page's 1-based physical position untouched, so the page numbers this
 * engine reports and accepts remain exactly the paginator's own. It lands
 * at library index 0 — the far end of the book, past the back cover —
 * where the reader can never navigate to it.
 *
 * A printed book always has an even page count for the same physical
 * reason (a sheet has two sides), so this is the digital equivalent of
 * the blank leaf a real binder would add.
 */
function normaliseDeck(pages: RenderedPage[]): RenderedPage[] {
  return pages.length % 2 === 0 ? pages : [...pages, BLANK_LEAF];
}

/** Covers are rigid boards (`rotateY`, like a real hardback); every interior page is a soft folding sheet. */
function isHardBoard(page: RenderedPage): boolean {
  return page.kind === "cover" || page.kind === "backCover";
}

/**
 * `libraryIndex = deckLength - ourPageNumber`, and its own inverse.
 *
 * StPageFlip has NO RTL support (zero occurrences of `rtl`/`dir` in its
 * source), so the deck is handed over REVERSED. The alternative —
 * mirroring the book with `scaleX(-1)` — silently breaks it: the library
 * derives the fold from `getBoundingClientRect()`-relative pointer
 * coordinates, so a mirroring ancestor transform inverts drag and the
 * fold fights the cursor.
 *
 * Reversing needs no patching at all. With `R[k] = deck[L-1-k]`, the
 * library's landscape spread `[k, k+1]` puts our page `L-k` in its left
 * slot and `L-k-1` in its right slot — exactly the `left = right + 1`
 * invariant `spreadFor()` encodes. Its `flipPrev` grabs the LEFT leaf and
 * swings it rightward, which IS our RTL "forward", so drag direction,
 * shadow direction and its `--left`/`--right` orientation classes all
 * come out correct natively. The only costs are this index inversion and
 * swapping next/prev at the call sites below.
 */
function invertIndex(deckLength: number, value: number): number {
  return deckLength - value;
}

/**
 * Which physical slot a page occupies when it is the ONLY page of its
 * spread, or `null` when it is part of a normal pair.
 *
 * Only two pages are ever alone: the cover (always — `spreadFor(1)` has
 * no pair) and, when the real page count is even, the final page. The
 * padded blank leaf is also alone but is unreachable.
 */
function loneSlotOf(pageNumber: number, realPageCount: number): "left" | "right" | null {
  if (pageNumber <= 1) return "left";
  if (pageNumber === realPageCount && realPageCount % 2 === 0) return "right";
  return null;
}

/**
 * Builds the DOM StPageFlip takes ownership of, reversed per
 * `invertIndex`.
 *
 * Built imperatively rather than rendered by React on purpose: the
 * library MOVES these nodes into its own `.stf__block` and its
 * `destroy()` removes its root outright, so React must never own them.
 * That costs nothing here — `RenderedPage.html` is already a raw HTML
 * string.
 */
function buildPageElements(deck: RenderedPage[]): HTMLElement[] {
  return deck
    .map((page, index) => {
      const item = document.createElement("div");
      // No inline styles on this element, ever: `HTMLPage.draw()`
      // overwrites its ENTIRE `cssText` on every animation frame. All of
      // our own styling lives on the scaler child below.
      if (isHardBoard(page)) item.dataset.density = "hard";

      // StPageFlip sizes `item` in real CSS px, but our pages are laid
      // out in physical `mm` against the same template CSS the PDF uses.
      // The scaler bridges the two WITHOUT touching `template-css.ts`,
      // and — critically — without a transform on any ancestor of the
      // library's own coordinate space, which would desynchronise visual
      // px from the layout px its pointer math assumes.
      const scaler = document.createElement("div");
      scaler.className = "book-flip-scaler";

      const bookPage = document.createElement("div");
      bookPage.className = "book-page";
      // Initial guess only; `syncOrientation` keeps it true to whichever
      // slot the library actually places the page in.
      bookPage.dataset.side = sideOf(index + 1);
      bookPage.innerHTML =
        `<div class="book-page-content">${page.html}</div>` +
        (page.pageNumber !== null ? `<div class="book-folio">${page.pageNumber}</div>` : "");

      scaler.appendChild(bookPage);
      item.appendChild(scaler);
      return item;
    })
    .reverse();
}

/**
 * The library marks page chrome with `--left`/`--right` classes on the
 * item; our print template keys the gutter, running head and folio off
 * `.book-page[data-side="..."]`. Mirroring one onto the other leaves
 * `template-css.ts` completely untouched — the alternative, restating
 * those rules under `.stf__item.--left`, would be a second copy free to
 * drift from the print template.
 */
function observeOrientation(items: HTMLElement[]): () => void {
  const observers = items.map((item) => {
    const bookPage = item.querySelector<HTMLElement>(".book-page");
    if (!bookPage) return null;

    function syncOrientation(): void {
      if (!bookPage) return;
      if (item.classList.contains("--left")) bookPage.dataset.side = "left";
      else if (item.classList.contains("--right")) bookPage.dataset.side = "right";
    }

    syncOrientation();
    const observer = new MutationObserver(syncOrientation);
    observer.observe(item, { attributes: true, attributeFilter: ["class"] });
    return observer;
  });

  return () => observers.forEach((observer) => observer?.disconnect());
}

/**
 * Deliberately hand-written CSS rather than Tailwind utility classes:
 * this module lives under `src/lib/`, which is NOT in `tailwind.config.ts`'s
 * `content` globs (only `pages`, `components`, `sections` and `app` are).
 * A `h-[70vh]` here would be silently dropped from the generated
 * stylesheet and the stage would collapse to zero height — the engine has
 * to be self-contained to be safely placed anywhere in the tree.
 */
const ENGINE_CSS = `
.book-flip-root--fill { display: flex; height: 100%; flex-direction: column; }
.book-flip-stage { position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.book-flip-stage--page { height: 70vh; min-height: 420px; }
.book-flip-stage--fill { flex: 1 1 0%; min-height: 0; }
.book-flip-mount { position: relative; }
/* \`autoSize: false\` means the library never gives its own wrapper a
   height (its \`.stf__block\` is absolutely positioned), so \`getBlockHeight()\`
   would read 0 and every page would be sized from width alone. */
.book-flip-mount > .stf__wrapper { height: 100%; }
/* \`backface-visibility\` is NOT redundant with the library's own. StPageFlip
   sets it on \`.stf__item\`, but \`.stf__item\` is also \`transform-style:
   preserve-3d\`, so this scaler — which carries ALL the real page content —
   is an independent participant in that same 3D space rather than being
   flattened into its parent. Hiding only the item's back face therefore
   left the scaler painting its own mirrored self straight through the back
   of a rotating board: during the hard-cover turn the cover artwork bled
   through and composited over the reverse face. Only hard pages could ever
   show this, because soft pages fold with \`clip-path\` + a 2D \`rotate()\`
   and never turn a face away from the viewer. The scaler computes
   \`transform-style: flat\`, so its own descendants flatten into it and this
   one declaration covers the whole page. */
.book-flip-scaler { position: absolute; top: 0; left: 0; transform: scale(var(--book-flip-scale, 1)); transform-origin: top left; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
`;

export const StPageFlipEngine = forwardRef<FlipEngineHandle, FlipEngineProps>(function StPageFlipEngine(
  { pages, geometry, css, initialPageNumber, singlePage, reducedMotion, zoom, maxScale, fillRatio, fillContainer, onPageChange, onTurnStart, onTocLinkClick },
  ref
) {
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const pageFlipRef = useRef<PageFlipInstance | null>(null);

  // Read inside library callbacks that outlive a given render, so the
  // engine never rebuilds just because a handler identity changed.
  const onPageChangeRef = useRef(onPageChange);
  const onTurnStartRef = useRef(onTurnStart);
  const onTocLinkClickRef = useRef(onTocLinkClick);
  onPageChangeRef.current = onPageChange;
  onTurnStartRef.current = onTurnStart;
  onTocLinkClickRef.current = onTocLinkClick;

  const deck = useMemo(() => normaliseDeck(pages), [pages]);
  const deckLength = deck.length;
  const realPageCount = pages.length;

  const pageWidthPx = geometry.widthMm * PX_PER_MM;
  const pageHeightPx = geometry.heightMm * PX_PER_MM;

  // `initialPageNumber` is read once per mount by design (see the prop's
  // doc comment) — a ref keeps it out of the effect's dependencies so a
  // parent re-render can never yank the book back to where it opened.
  const initialPageNumberRef = useRef(initialPageNumber);
  const currentPageNumberRef = useRef(initialPageNumber);

  const layoutRef = useRef({ zoom, maxScale, fillRatio, singlePage });
  layoutRef.current = { zoom, maxScale, fillRatio, singlePage };

  /**
   * Sizes the library's block in real LAYOUT pixels, then derives our own
   * page scale factor from whatever page size it settled on.
   *
   * This replaces the old `useFitScale`, which cannot be reused: it put a
   * `transform: scale()` on a CONTAINER, and any transform above the
   * library's coordinate space desynchronises visual px from the layout
   * px its pointer math reads, breaking drag. Sizing the block instead
   * keeps one consistent pixel space end to end, and the per-page scaler
   * (`.book-flip-scaler`) does the mm→px bridging one level below the
   * library's own coordinates, where it is harmless.
   */
  const applyLayout = useCallback(() => {
    const stage = stageRef.current;
    const mount = mountRef.current;
    const pageFlip = pageFlipRef.current;
    if (!stage || !mount || !pageFlip) return;

    const { zoom: currentZoom, maxScale: currentMaxScale, fillRatio: currentFillRatio, singlePage: currentSinglePage } = layoutRef.current;
    const stageRect = stage.getBoundingClientRect();
    // A stage this small is never a real reading surface — it means the
    // element is mid-layout, detached, or inside a hidden container.
    // Bailing keeps a transient measurement from being written as a real
    // size and collapsing the book to a sliver it can't recover from.
    if (stageRect.width < MIN_USABLE_STAGE_PX || stageRect.height < MIN_USABLE_STAGE_PX) return;

    const slots = currentSinglePage ? 1 : 2;
    const availableWidth = stageRect.width * currentFillRatio * currentZoom;
    const availableHeight = stageRect.height * currentFillRatio * currentZoom;
    // Never larger than the real printed size times `maxScale` — the cap
    // page mode relies on to keep a physical page physical.
    const cappedWidth = Math.min(availableWidth, pageWidthPx * currentMaxScale * slots);
    const cappedHeight = Math.min(availableHeight, pageHeightPx * currentMaxScale);

    mount.style.width = `${Math.max(1, Math.round(cappedWidth))}px`;
    mount.style.height = `${Math.max(1, Math.round(cappedHeight))}px`;

    pageFlip.update();

    const bounds = pageFlip.getBoundsRect();
    if (bounds?.pageWidth) stage.style.setProperty("--book-flip-scale", String(bounds.pageWidth / pageWidthPx));
  }, [pageWidthPx, pageHeightPx]);

  /**
   * Undoes StPageFlip's own density bleed. `Flip.start()` promotes a soft
   * page to `hard` so it matches an adjacent hard cover, but
   * `Flip.reset()` never puts it back — so after opening our hard cover
   * once, the page beside it would keep swinging rigidly instead of
   * folding for the rest of the session. Restoring on every settle costs
   * one cheap pass and keeps "covers hard, interiors soft" true forever.
   */
  const repairDensityBleed = useCallback(() => {
    const pageFlip = pageFlipRef.current;
    if (!pageFlip) return;
    for (let index = 0; index < pageFlip.getPageCount(); index++) {
      let page: PageFlipPage;
      try {
        page = pageFlip.getPage(index);
      } catch {
        continue;
      }
      const real = page.getDensity();
      if (page.getDrawingDensity() !== real) page.setDrawingDensity(real);
    }
  }, []);

  /**
   * A lone page (the cover, or an even book's final page) still occupies
   * only half of the library's full-spread block, which would leave it
   * visibly off-centre with dead space beside it.
   *
   * Corrected with `position: relative; left`, NOT a transform: a
   * relative offset moves the element and its `getBoundingClientRect()`
   * together, so the library's pointer math stays self-consistent, while
   * a transform would not.
   *
   * The offset is dropped for the whole duration of a turn and restored
   * when the book settles, so the block widens INTO a spread as the cover
   * opens (and narrows back on a snap-back) instead of jumping the
   * instant the page count changes.
   */
  const applyCentering = useCallback(
    (settled: boolean) => {
      const mount = mountRef.current;
      const pageFlip = pageFlipRef.current;
      if (!mount || !pageFlip) return;

      const slot = layoutRef.current.singlePage || !settled ? null : loneSlotOf(currentPageNumberRef.current, realPageCount);
      const halfPage = (pageFlip.getBoundsRect()?.pageWidth ?? 0) / 2;
      // A lone page in the LEFT slot sits half a page left of centre, so
      // it moves right to centre itself; the right slot mirrors that.
      mount.style.left = slot === "left" ? `${halfPage}px` : slot === "right" ? `${-halfPage}px` : "0px";
    },
    [realPageCount]
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || deck.length === 0) return;

    let cancelled = false;
    let disposers: Array<() => void> = [];
    let pageFlip: PageFlipInstance | null = null;
    let mount: HTMLDivElement | null = null;

    // Dynamic import, never module scope: `page-flip` injects its
    // stylesheet into `document.head` at module-evaluation time, so
    // importing it anywhere reachable from the server render breaks SSR.
    import("page-flip")
      .then(({ PageFlip }) => {
        if (cancelled) return;

        // React renders `stage` with no children of its own here. The
        // library appends to, reparents, and ultimately `.remove()`s the
        // element it is handed, so it gets a node React's reconciler has
        // never seen.
        mount = document.createElement("div");
        mount.className = "book-flip-mount";
        mount.style.transition = reducedMotion ? "none" : `left ${CENTERING_TRANSITION_MS}ms ease-out`;
        stage.appendChild(mount);
        mountRef.current = mount;

        const items = buildPageElements(deck);
        disposers.push(observeOrientation(items));

        pageFlip = new PageFlip(mount, {
          width: pageWidthPx,
          height: pageHeightPx,
          size: "stretch",
          // The library decides portrait vs landscape with
          // `blockWidth < minWidth * 2`, so `minWidth` is what actually
          // pins the orientation once `usePortrait` allows it: in
          // single-page mode it is set to the widest block
          // `applyLayout` can ever produce, which makes that test always
          // true; in spread mode `usePortrait: false` settles it and
          // `minWidth` is irrelevant. Keeping it <= `maxWidth` also
          // avoids the library silently rewriting `maxWidth` to its own
          // 2000px default (see `Settings.getSettings`).
          minWidth: singlePage ? pageWidthPx * Math.max(1, maxScale) : 1,
          maxWidth: pageWidthPx * Math.max(1, maxScale),
          minHeight: 1,
          maxHeight: pageHeightPx * Math.max(1, maxScale),
          // We size the block ourselves in `applyLayout`, so the library
          // must not also impose `width: 100%` / aspect-ratio padding.
          autoSize: false,
          // Orientation is the CALLER's decision (the reader has an
          // explicit single/spread toggle), never re-derived from the
          // viewport here: `usePortrait: false` pins landscape, and
          // `minWidth: 1` keeps the library's own width-based portrait
          // test from ever firing when we do want a spread.
          usePortrait: singlePage,
          showCover: true,
          drawShadow: true,
          maxShadowOpacity: 0.5,
          flippingTime: FLIPPING_TIME_MS,
          // Reduced motion means no fold at all — and therefore no
          // drag-to-fold either; navigation still works through the
          // toolbar and keyboard.
          useMouseEvents: !reducedMotion,
          showPageCorners: !reducedMotion,
          // Click-to-flip stays ON — clicking the left page turns
          // forward under our RTL mapping, which is what a reader
          // expects. It must NOT be disabled: with `disableFlipByClick`
          // set, `Flip.flip()` gates on `isPointOnCorners()`, and the
          // synthetic point `flipNext`/`flipPrev` pass uses an absolute
          // y of 1 that falls outside the book whenever the block is
          // taller than the page — which would make every toolbar and
          // keyboard turn silently do nothing. TOC rows are protected by
          // `suppressFlipOnInteractiveContent` instead.
          disableFlipByClick: false,
          mobileScrollSupport: true,
          startPage: invertIndex(deck.length, initialPageNumberRef.current),
        });
        pageFlipRef.current = pageFlip;

        // The library's own `minWidth`/`minHeight` floors are set on OUR
        // mount element; `applyLayout` is the single authority on its
        // size, so they are cleared rather than left to fight it.
        mount.style.minWidth = "0px";
        mount.style.minHeight = "0px";

        let lastState = "read";

        pageFlip.on("init", () => {
          applyLayout();
          applyCentering(true);
        });

        pageFlip.on("changeState", (event) => {
          const state = String(event.data);
          // `flipping` is entered by button, keyboard and click turns.
          // A drag that completes never passes through it (the library
          // animates straight from `user_fold`), so that case is caught
          // on the `flip` event below — together they fire the sound
          // exactly once per real turn, at the moment the page starts
          // moving.
          if (state === "flipping" && lastState !== "flipping") onTurnStartRef.current();
          lastState = state;
          if (state === "read") repairDensityBleed();
          applyCentering(state === "read");
        });

        pageFlip.on("flip", (event) => {
          const pageNumber = invertIndex(deck.length, event.data as number);
          currentPageNumberRef.current = pageNumber;
          // A page change while still in `user_fold` is a drag the user
          // just carried past the point of no return — the one turn the
          // `changeState` handler above cannot see.
          if (lastState === "user_fold") onTurnStartRef.current();
          onPageChangeRef.current(pageNumber);
          applyCentering(lastState === "read");
        });

        pageFlip.loadFromHTML(items);
        applyLayout();
        applyCentering(true);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("[flip-engine] failed to load page-flip", error);
      });

    return () => {
      cancelled = true;
      disposers.forEach((dispose) => dispose());
      disposers = [];
      // `destroy()` removes `mount` itself, so React is never left
      // holding a node the library mutated; the fallback covers the case
      // where the dynamic import never resolved.
      try {
        pageFlip?.destroy();
      } catch {
        mount?.remove();
      }
      pageFlipRef.current = null;
      mountRef.current = null;
    };
    // `singlePage` and `reducedMotion` are structural: both change how
    // the book is built, so the engine is rebuilt (reopening at the page
    // it is currently on, via `initialPageNumberRef`) rather than mutated
    // in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, pageWidthPx, pageHeightPx, maxScale, singlePage, reducedMotion, applyLayout, applyCentering, repairDensityBleed]);

  // Keep the reopen point current so a `singlePage`/`reducedMotion`
  // rebuild resumes where the reader actually is.
  initialPageNumberRef.current = currentPageNumberRef.current;

  // Zoom / stage-size changes only re-measure — they never rebuild.
  useEffect(() => {
    applyLayout();
    applyCentering(true);
  }, [zoom, fillRatio, maxScale, fillContainer, applyLayout, applyCentering]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => {
      applyLayout();
      applyCentering(true);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [applyLayout, applyCentering]);

  // TOC rows live inside a rendered page's OWN html (see
  // `paginate-book.ts`'s `fillTocPages`), so they are reachable only by
  // delegation. The engine resolves nothing — it reports the chapter id
  // and the reader decides which page that is.
  //
  // The capture-phase pointer handlers are what keep those rows usable
  // at all: the library starts a flip from `mousedown`/`touchstart` on
  // its own container, and its `clickEventForward` escape hatch only
  // recognises `a` and `button` elements — so without this, tapping a
  // TOC entry would navigate AND turn the page. Stopping the pointer
  // event before it descends leaves the later `click` untouched, so the
  // delegation below still fires.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    function isInteractiveContent(target: EventTarget | null): boolean {
      return (target as HTMLElement | null)?.closest("[data-toc-chapter-id], a, button") != null;
    }

    function suppressFlipOnInteractiveContent(event: Event): void {
      if (isInteractiveContent(event.target)) event.stopPropagation();
    }

    function onClick(event: MouseEvent): void {
      const entry = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-toc-chapter-id]");
      const chapterId = entry?.getAttribute("data-toc-chapter-id");
      if (chapterId) onTocLinkClickRef.current(chapterId);
    }

    stage.addEventListener("mousedown", suppressFlipOnInteractiveContent, true);
    stage.addEventListener("touchstart", suppressFlipOnInteractiveContent, true);
    stage.addEventListener("click", onClick);
    return () => {
      stage.removeEventListener("mousedown", suppressFlipOnInteractiveContent, true);
      stage.removeEventListener("touchstart", suppressFlipOnInteractiveContent, true);
      stage.removeEventListener("click", onClick);
    };
  }, []);

  useImperativeHandle(
    ref,
    (): FlipEngineHandle => ({
      // Our RTL "forward" (deeper into the book) is the library's PREV,
      // because the deck is reversed — see `invertIndex`.
      next: () => {
        const pageFlip = pageFlipRef.current;
        if (!pageFlip) return;
        if (reducedMotion) {
          pageFlip.turnToPrevPage();
          return;
        }
        pageFlip.flipPrev();
      },
      prev: () => {
        const pageFlip = pageFlipRef.current;
        if (!pageFlip) return;
        if (reducedMotion) {
          pageFlip.turnToNextPage();
          return;
        }
        pageFlip.flipNext();
      },
      goTo: (pageNumber: number) => {
        const pageFlip = pageFlipRef.current;
        if (!pageFlip) return;
        const target = invertIndex(deckLength, Math.min(realPageCount, Math.max(1, Math.round(pageNumber))));
        if (reducedMotion) {
          pageFlip.turnToPage(target);
          // `turnToPage` is instant and fires no `flip` event, so the
          // reader would otherwise never learn the page changed.
          currentPageNumberRef.current = invertIndex(deckLength, target);
          onPageChangeRef.current(currentPageNumberRef.current);
          applyCentering(true);
          return;
        }
        pageFlip.flip(target);
      },
    }),
    [deckLength, realPageCount, reducedMotion, applyCentering]
  );

  return (
    <div className={fillContainer ? "book-page-scope book-flip-root--fill" : "book-page-scope"} dir="rtl">
      {/* `dangerouslySetInnerHTML`, not `<style>{css}</style>`: the
          template CSS contains `"` inside its `@font-face` rules, and
          React escapes text children of a `<style>` differently on the
          server than on the client, which hydration-mismatches the whole
          reader. */}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <style dangerouslySetInnerHTML={{ __html: ENGINE_CSS }} />
      <div ref={stageRef} className={`book-flip-stage ${fillContainer ? "book-flip-stage--fill" : "book-flip-stage--page"}`} />
    </div>
  );
});

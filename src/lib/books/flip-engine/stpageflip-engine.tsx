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

/**
 * The turn duration we want the reader to actually perceive, at any page
 * size. NOT passed straight to `flippingTime` — see `resolveFlippingTime`.
 */
const TARGET_TURN_MS = 800;

/**
 * StPageFlip derives an animation's frame count from the sweep distance in
 * PIXELS (`Helper.GetCordsFromTwoPoint` steps one point per pixel), then
 * does `duration = (frames / 1000) * flippingTime` for anything under 1000
 * frames. So a physically smaller book turns proportionally faster: a
 * desktop spread sweeps ~916px and lands near the full 800ms, while a
 * phone spread sweeps only ~400px and finishes in ~320ms — the "too fast
 * to read" turn on a phone.
 *
 * Solving that back for `flippingTime` keeps the PERCEIVED duration fixed
 * at `TARGET_TURN_MS` regardless of geometry, so phone and desktop feel
 * the same instead of being tuned separately.
 *
 * This is safe for drag specifically because `flippingTime` is read only
 * by `Flip.getAnimationDuration`, which only runs from `animateFlippingTo`
 * — the programmatic turn, the completion after release, and the snap
 * back. A live drag is not animated at all: `Flip.fold()` recomputes the
 * crease straight from the pointer every frame. Raising this can therefore
 * never introduce lag while a finger is down.
 */
function resolveFlippingTime(pageWidthPx: number, pageHeightPx: number): number {
  // Mirrors `Flip.flip()`'s own start/dest points: it sweeps from
  // `pageWidth - height/10` across to `-pageWidth`.
  const sweepPx = Math.max(1, 2 * pageWidthPx - pageHeightPx / 10);
  return (TARGET_TURN_MS * 1000) / Math.min(1000, sweepPx);
}

/**
 * A lone page (the closed cover, or an even book's final page) occupies
 * only one half of the library's always-two-pages-wide block, so it sits
 * optically off-centre in the stage with dead space beside it.
 *
 * That is deliberately NOT corrected here. An earlier version shifted the
 * mount by half a page with `position: relative; left`, transitioned so
 * the book appeared to widen as the cover opened. It broke the hard-cover
 * turn: the block slid 246px left over 240ms while the 800ms flip was
 * still running, so the cover board's hinge moved while the destination
 * page underneath stayed at its final position — the destination page
 * visibly peeked out from beside the turning board. It also corrupted
 * drag, because the library recomputes pointer position from
 * `distElement.getBoundingClientRect()` on every move, and that rect was
 * sliding underneath the cursor.
 *
 * There is no offset that avoids this: the library pins a lone page to
 * one half of a two-page block, so centring it necessarily moves the very
 * coordinate frame both the fold geometry and the pointer math are
 * expressed in. Leaving the block still is what keeps the turn correct,
 * and a closed book sitting in one half of the spread frame is a fair
 * physical reading of a book about to be opened. Centring the closed
 * cover, if wanted, belongs in a separate closed-book presentation
 * outside the engine — not in a transform on the library's own frame.
 */

/** Below this, a stage measurement is treated as "not laid out yet" rather than a real size — see `applyLayout`. */
const MIN_USABLE_STAGE_PX = 40;

/**
 * How far a pointer may travel and still count as a tap. Deliberately
 * identical to StPageFlip's own `userMove` threshold — see the `userStop`
 * override for why the two must not drift apart.
 */
const TAP_SLOP_PX = 5;

/**
 * Swipe is detected here rather than by the library, whose `UI.onTouchEnd`
 * hardcodes `dx > 0 -> flipPrev`. That is our forward only while the deck
 * is reversed; in portrait's natural order it silently inverts. Owning the
 * gesture keeps swipe, drag and the toolbar agreeing in both modes. Values
 * mirror the library's own so the feel is unchanged.
 */
const SWIPE_WINDOW_MS = 250;
const SWIPE_MIN_PX = 30;

/**
 * Watches a pointer gesture purely to answer "did this move, or was it a
 * tap?". Listens in the capture phase so it always sees the gesture
 * before the library's own handlers, and never calls `preventDefault` or
 * `stopPropagation` — it observes, it does not intercept, so drag,
 * swipe and scrolling all behave exactly as they did.
 */
function trackPointerMovement(
  stage: HTMLElement,
  onSwipe: (towards: "forward" | "backward") => void
): { moved: boolean; dispose: () => void } {
  const guard = { moved: false, dispose: () => {} };
  let origin: { x: number; y: number; at: number; touch: boolean } | null = null;

  function onDown(event: PointerEvent): void {
    origin = { x: event.clientX, y: event.clientY, at: event.timeStamp, touch: event.pointerType === "touch" };
    guard.moved = false;
  }
  function onMove(event: PointerEvent): void {
    if (!origin) return;
    if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > TAP_SLOP_PX) guard.moved = true;
  }
  function onUp(event: PointerEvent): void {
    const start = origin;
    origin = null;
    if (!start || !start.touch) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    // Same window the library's own swipe used, so this replaces it
    // exactly rather than overlapping the drag path: for touch the library
    // defers `startUserTouch` by 250ms, so a gesture shorter than that
    // never became a fold and there is nothing here to double-fire with.
    if (event.timeStamp - start.at >= SWIPE_WINDOW_MS) return;
    if (Math.abs(dx) <= SWIPE_MIN_PX || Math.abs(dy) >= SWIPE_MIN_PX * 2) return;
    // Rightward matches the drag: you pull the left leaf rightward to go
    // deeper into an RTL book.
    onSwipe(dx > 0 ? "forward" : "backward");
  }

  stage.addEventListener("pointerdown", onDown, true);
  window.addEventListener("pointermove", onMove, true);
  window.addEventListener("pointerup", onUp, true);
  window.addEventListener("pointercancel", onUp, true);

  guard.dispose = () => {
    stage.removeEventListener("pointerdown", onDown, true);
    window.removeEventListener("pointermove", onMove, true);
    window.removeEventListener("pointerup", onUp, true);
    window.removeEventListener("pointercancel", onUp, true);
  };
  return guard;
}

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
 * The one place that knows which library call means "deeper into the
 * book", shared by the toolbar handle and by swipe so the two can never
 * disagree about direction.
 */
function turnPage(pageFlip: PageFlipInstance, towards: "forward" | "backward", reducedMotion: boolean): void {
  // Our RTL forward is the library's PREV in BOTH orientations: the deck
  // is reversed, and BACK is also the direction whose geometry peels
  // left -> right, which is what a right-bound book does.
  //
  // KNOWN LIMITATION, portrait only: the library's BACK pipeline is a
  // RETURNING-sheet animation, not a mirrored departing one. In portrait it
  // anchors the whole composition in the off-screen left half of its
  // two-page-wide coordinate space and animates INTO view, so a forward
  // turn reads as a sheet arriving on top of the current page rather than
  // the current page peeling away. It cannot be corrected from out here —
  // see the notes in the engine's README/handover; it needs either a
  // vendored change to `Render.convertToGlobal`/`FlipCalculation` or a
  // different portrait presentation. Landscape is unaffected: both halves
  // are on screen, so the same geometry reads correctly there.
  const towardsForward = towards === "forward";
  if (reducedMotion) {
    if (towardsForward) pageFlip.turnToPrevPage();
    else pageFlip.turnToNextPage();
    return;
  }
  if (towardsForward) pageFlip.flipPrev();
  else pageFlip.flipNext();
}

function buildPageElements(deck: RenderedPage[]): HTMLElement[] {
  const elements = deck
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
        // Hand-synced with nutrition-staff's `build-book-html.ts`. The inner
      // span carries the flanking dots; `.book-folio`'s own pseudo-elements
      // are the thin rules and leaf marks.
      (page.pageNumber !== null ? `<div class="book-folio"><span class="book-folio-leaf" aria-hidden="true"></span><span class="book-folio-number">${page.pageNumber}</span><span class="book-folio-leaf" aria-hidden="true"></span></div>` : "");

      scaler.appendChild(bookPage);
      item.appendChild(scaler);
      return item;
    });
  return elements.reverse();
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
  { pages, geometry, initialPageNumber, singlePage, reducedMotion, zoom, maxScale, fillRatio, fillContainer, onPageChange, onTurnStart, onTocLinkClick },
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

    mount.style.width = `${Math.max(1, cappedWidth)}px`;
    mount.style.height = `${Math.max(1, cappedHeight)}px`;

    pageFlip.update();

    // Second pass: collapse the block onto the page size the library
    // actually settled on.
    //
    // `calculateBoundsRect` starts from `blockWidth / slots`, then — when
    // the book is height-constrained, which it is at almost every stage
    // size — re-derives `pageWidth` from the available HEIGHT. The block
    // is then wider than `pageWidth * slots`, and the library centres the
    // book inside it with `rect.left = blockWidth / 2 - pageWidth`. That
    // leftover is what made a settling page jump: the folding sheet is
    // positioned through `convertToGlobal`, the settled page through
    // `simpleDraw`, and the two only agree when there is no leftover to
    // disagree about. Measured at 66.15625px on a 1119px block whose real
    // page width was 493.32px.
    //
    // Sizing the mount to exactly `pageWidth * slots` drives `rect.left`
    // to 0, so the animated rectangle and the settled rectangle are the
    // same rectangle by construction — no transition, no overlap, no
    // per-slot CSS. It converges in one extra pass: the new block is
    // already an exact multiple of the height-derived page width, so the
    // height clamp cannot shrink it again.
    const settled = pageFlip.getBoundsRect();
    if (settled?.pageWidth) {
      const exactWidth = settled.pageWidth * slots;
      if (Math.abs(exactWidth - parseFloat(mount.style.width)) > 0.5) {
        mount.style.width = `${exactWidth}px`;
        mount.style.height = `${settled.height}px`;
        pageFlip.update();
      }
    }

    const bounds = pageFlip.getBoundsRect();
    if (bounds?.pageWidth) {
      stage.style.setProperty("--book-flip-scale", String(bounds.pageWidth / pageWidthPx));
      // Re-normalised against the size the library actually settled on, so
      // a turn takes the same perceived time after a resize, a zoom or an
      // orientation switch. `getSettings()` hands back the live settings
      // object and `getAnimationDuration` reads `flippingTime` per call, so
      // this takes effect on the very next turn without a rebuild.
      pageFlip.getSettings().flippingTime = resolveFlippingTime(bounds.pageWidth, bounds.height);
    }
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
        stage.appendChild(mount);
        mountRef.current = mount;

        const items = buildPageElements(deck);
        disposers.push(observeOrientation(items));

        const tapGuard = trackPointerMovement(stage, (towards) => {
          if (pageFlipRef.current) turnPage(pageFlipRef.current, towards, reducedMotion);
        });
        disposers.push(tapGuard.dispose);

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
          flippingTime: resolveFlippingTime(pageWidthPx, pageHeightPx),
          // Reduced motion means no fold at all — and therefore no
          // drag-to-fold either; navigation still works through the
          // toolbar and keyboard.
          useMouseEvents: !reducedMotion,
          showPageCorners: !reducedMotion,
          // Left FALSE deliberately, even though tapping must not
          // navigate — that rule is enforced by `userStop` below instead.
          // `disableFlipByClick: true` is the wrong tool twice over:
          //
          //  1. It does not actually stop tap-navigation. It only narrows
          //     `Flip.flip()` to `isPointOnCorners()`, whose region is
          //     `sqrt(pageWidth^2 + height^2) / 5` on EACH axis — four
          //     corner squares covering roughly a third of a phone-sized
          //     page. A third of all taps would still turn the page.
          //  2. It breaks the paths that SHOULD work. Both the library's
          //     own swipe detection and our toolbar/keyboard turns reach
          //     `Flip.flip()` through `flipNext`/`flipPrev`, which pass a
          //     synthetic point with an absolute `y` of 1; that fails
          //     `isPointOnCorners`'s `bookPos.y > 0` test whenever the
          //     block is taller than the page, silently doing nothing.
          disableFlipByClick: false,
          mobileScrollSupport: true,
          // Disables the library's built-in swipe (it compares
          // `Math.abs(dx) > swipeDistance`). Ours replaces it — see
          // SWIPE_WINDOW_MS — because the built-in one hardcodes a
          // direction that inverts under portrait's natural deck order.
          swipeDistance: Number.MAX_SAFE_INTEGER,
          startPage: invertIndex(deck.length, initialPageNumberRef.current),
        });
        pageFlipRef.current = pageFlip;

        // Tap is not navigation; swipe/drag is.
        //
        // `PageFlip.userStop` is where the two diverge — it turns the page
        // on release only when the pointer never moved:
        //
        //   if (!isSwipe) { if (!this.isUserMove) flip(pos); else stopMove(); }
        //
        // Reporting a motionless release as a swipe takes BOTH branches
        // out, which is exactly "do nothing": no turn, and nothing to
        // clean up either, because the library only begins a fold once
        // movement passes its own 5px threshold. A release that DID move
        // is delegated untouched, so drag still completes past the
        // midpoint and snaps back before it.
        //
        // TAP_SLOP_PX therefore has to match the library's threshold
        // exactly. Any larger and a 6-8px drag would start a fold that we
        // then reported as a tap, skipping `stopMove()` and leaving the
        // page stranded mid-fold.
        const originalUserStop = pageFlip.userStop.bind(pageFlip);
        pageFlip.userStop = (position, isSwipe = false) => {
          originalUserStop(position, isSwipe || !tapGuard.moved);
        };

        let lastState = "read";

        pageFlip.on("init", () => {
          applyLayout();
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
        });

        pageFlip.on("flip", (event) => {
          const pageNumber = invertIndex(deck.length, event.data as number);
          currentPageNumberRef.current = pageNumber;
          // A page change while still in `user_fold` is a drag the user
          // just carried past the point of no return — the one turn the
          // `changeState` handler above cannot see.
          if (lastState === "user_fold") onTurnStartRef.current();
          onPageChangeRef.current(pageNumber);
        });

        pageFlip.loadFromHTML(items);
        // AFTER loadFromHTML, not after `new PageFlip(...)`: the library
        // sets these floors in `HTMLUI`'s constructor, which does not run
        // until `loadFromHTML`. Clearing them earlier was silently undone,
        // leaving min-width pinned to a full page (559px) while
        // `applyLayout` sized the mount to the 430px stage — so on a phone
        // the block overflowed and was clipped by `overflow: hidden`.
        // `applyLayout` is the single authority on this element's size.
        mount.style.minWidth = "0px";
        mount.style.minHeight = "0px";
        applyLayout();
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
  }, [deck, pageWidthPx, pageHeightPx, maxScale, singlePage, reducedMotion, applyLayout, repairDensityBleed]);

  // Keep the reopen point current so a `singlePage`/`reducedMotion`
  // rebuild resumes where the reader actually is.
  initialPageNumberRef.current = currentPageNumberRef.current;

  // Zoom / stage-size changes only re-measure — they never rebuild.
  useEffect(() => {
    applyLayout();
  }, [zoom, fillRatio, maxScale, fillContainer, applyLayout]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => {
      applyLayout();
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [applyLayout]);

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
    (): FlipEngineHandle => {
      return {
        next: () => {
          const pageFlip = pageFlipRef.current;
          if (pageFlip) turnPage(pageFlip, "forward", reducedMotion);
        },
        prev: () => {
          const pageFlip = pageFlipRef.current;
          if (pageFlip) turnPage(pageFlip, "backward", reducedMotion);
        },
        goTo: (pageNumber: number) => {
          const pageFlip = pageFlipRef.current;
          if (!pageFlip) return;
          const clamped = Math.min(realPageCount, Math.max(1, Math.round(pageNumber)));
          const target = invertIndex(deckLength, clamped);
          if (reducedMotion) {
            pageFlip.turnToPage(target);
            // `turnToPage` is instant and fires no `flip` event, so the
            // reader would otherwise never learn the page changed.
            currentPageNumberRef.current = clamped;
            onPageChangeRef.current(clamped);
            return;
          }
          pageFlip.flip(target);
        },
      };
    },
    [deckLength, realPageCount, reducedMotion]
  );

  return (
    <div className={fillContainer ? "book-page-scope book-flip-root--fill" : "book-page-scope"} dir="rtl">
      {/* ONLY the engine's own layout CSS. The print template's stylesheet
          is mounted by the reader, unconditionally and before pagination
          runs — injecting it from here would be a correctness bug, not a
          style choice: the engine does not exist yet while the paginator
          is measuring against it. */}
      <style dangerouslySetInnerHTML={{ __html: ENGINE_CSS }} />
      <div ref={stageRef} className={`book-flip-stage ${fillContainer ? "book-flip-stage--fill" : "book-flip-stage--page"}`} />
    </div>
  );
});

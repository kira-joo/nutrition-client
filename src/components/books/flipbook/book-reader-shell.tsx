"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Book } from "@/lib/domain/book";
import { resolveGeometry } from "@/lib/books/render/geometry";
import { buildTemplateCss, CHAPTER_BACKGROUND_URL } from "@/lib/books/render/template-css";
import { prefersReducedMotion } from "@/lib/animation/gsap-config";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { RenderedPage } from "@/lib/books/render/page-model.interface";
import { useBookPagination } from "./use-book-pagination";
import { useFlipbookNavigation } from "./use-flipbook-navigation";
import { useIsMobileViewport } from "./use-is-mobile-viewport";
import { usePageTurnSound } from "./use-page-turn-sound";
import { useShareBook } from "./use-share-book";
import { useBookBookmark } from "./use-book-bookmark";
import { useBookSearch } from "./use-book-search";
import { Flipbook, REDUCED_MOTION_FADE_MS, resolveSlotPageNumber, TURN_DURATION_MS, type TurningLeaf } from "./flipbook";
import { FlipbookControls } from "./flipbook-controls";
import { BookImmersiveChrome } from "./book-immersive-chrome";
import { BookTocPanel } from "./book-toc-panel";

const IMMERSIVE_QUERY_KEY = "read";
const IMMERSIVE_MAX_SCALE = 3;
const IMMERSIVE_FILL_RATIO = 0.94;

/**
 * The reader's one stateful "brain" — pagination, navigation, zoom,
 * sound, the turning-leaf animation, and Book Interaction (immersive)
 * mode all live here. Renders the SAME `Flipbook` surface component
 * twice depending on `isImmersive` (never both at once, so they safely
 * share nothing but the props they're each given fresh); everything that
 * makes the two feel different — chrome, scale, background — is a
 * rendering decision made here and in `book-immersive-chrome.tsx`, never
 * a second copy of the pagination/navigation logic.
 */
export function BookReaderShell({ book }: { book: Book }) {
  const { pagination, status } = useBookPagination(book);
  const geometry = useMemo(() => resolveGeometry(book.resolvedSettings.print), [book.resolvedSettings.print]);
  const css = useMemo(() => buildTemplateCss(geometry, { chapterBackgroundUrl: CHAPTER_BACKGROUND_URL }), [geometry]);

  const isNarrowViewport = useIsMobileViewport();
  const sound = usePageTurnSound();
  const share = useShareBook(book.title);
  const search = useBookSearch(pagination);

  const [tocOpen, setTocOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  // "auto" follows the viewport (the existing behavior); an explicit
  // choice overrides it regardless of width — the toolbar's spread/single
  // toggle exists specifically so a visitor can choose single-page on a
  // wide screen or (width permitting) force a spread on a narrower one,
  // per the approved redesign brief. `isMobile` stays the name used
  // everywhere downstream (Flipbook, navigation step size) since its real
  // meaning has always been "show one page, not two" — not literally
  // "is this a phone".
  const [viewModeOverride, setViewModeOverride] = useState<"auto" | "single" | "spread">("auto");
  const isMobile = viewModeOverride === "auto" ? isNarrowViewport : viewModeOverride === "single";
  const [turningLeaf, setTurningLeaf] = useState<TurningLeaf | null>(null);
  const turnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Reduced motion never mounts the 3D turning-leaf overlay (see
  // `onBeforeNavigate` below) — but the requirement is to replace the curl
  // with "a simple/subtle page transition", not to remove the transition
  // entirely, so a plain opacity cross-fade stands in for it here.
  const [isFading, setIsFading] = useState(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentPageNumberRef = useRef(1);

  const pageCount = pagination?.pageCount ?? 0;

  // Only used by `onBeforeNavigate` below to compute the turning leaf's
  // content — `Flipbook` derives its own copy of this from the
  // `pagination` prop it's given, since it needs it for rendering
  // regardless of which mode mounted it. Keyed by 1-based PHYSICAL
  // position, never by the printed folio (`page.pageNumber`, `null` for
  // the cover/title/copyright pages) — see the identical fix and doc
  // comment on `Flipbook`'s own `pagesByNumber`.
  const pagesByNumber = useMemo(() => {
    const map = new Map<number, RenderedPage>();
    pagination?.pages.forEach((page, index) => {
      map.set(index + 1, page);
    });
    return map;
  }, [pagination]);

  const { currentPageNumber, goNext, goPrev, goToPage, goToStart, goToEnd, onTouchStart, onTouchEnd } = useFlipbookNavigation({
    pageCount,
    getStepSize: () => (isMobile ? 1 : 2),
    onBeforeNavigate: (direction, targetPageNumber, commit) => {
      // Reduced motion is the only path allowed to skip the physical 3D
      // turn entirely — but the hook's `currentPageNumber` still only
      // changes when `commit()` runs, so this branch must call it too
      // (from inside the same timeout that clears the fade) or reduced-
      // motion visitors would never actually advance a page.
      if (prefersReducedMotion()) {
        setIsFading(true);
        if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = setTimeout(() => {
          setIsFading(false);
          commit();
        }, REDUCED_MOTION_FADE_MS);
        return;
      }
      // On mobile only one physical slot is ever on screen (`Flipbook`
      // always renders it as the "right" `PageSlot`, per
      // `showTwoPages`/single-page layout) — the turning leaf must land in
      // that same slot regardless of direction, unlike the desktop spread
      // where "forward" turns the left leaf and "backward" turns the right.
      const turningSide: "left" | "right" = isMobile ? "right" : direction === "forward" ? "left" : "right";
      // `fromHtml` is what that slot shows right now (the leaf's front
      // face); `toHtml` is what that SAME slot will show once `commit()`
      // fires (the leaf's back face) — resolved via the shared helper so
      // the cover-alone spread and an unpaired final page are handled
      // identically to how `Flipbook` itself decides what's on screen.
      const fromPageNumber = resolveSlotPageNumber(currentPageNumberRef.current, turningSide, pageCount, isMobile);
      const toPageNumber = resolveSlotPageNumber(targetPageNumber, turningSide, pageCount, isMobile);
      const fromHtml = fromPageNumber !== null ? pagesByNumber.get(fromPageNumber)?.html ?? "" : "";
      const toHtml = toPageNumber !== null ? pagesByNumber.get(toPageNumber)?.html ?? "" : "";
      // Fired before `setTurningLeaf` — `setTurningLeaf` only schedules a
      // React state update, it doesn't paint synchronously, so calling
      // `sound.play()` first guarantees nothing about React's own
      // scheduling can push the audio call later than the visual one.
      // Audited per explicit report of the sound feeling delayed: this was
      // already the very first thing done once a turn is confirmed to
      // start (no earlier hook, no rAF, no setTimeout before it) — if a
      // perceptible lag remains, it isn't this call site; see
      // `use-page-turn-sound.ts` for the leading-silence note instead.
      sound.play();
      setTurningLeaf({ side: turningSide, fromHtml, toHtml });
      if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
      // The visible spread only swaps to the destination AFTER the turn
      // finishes animating — `setTurningLeaf(null)` and `commit()` fire
      // together so the static page slots (already showing the old
      // content) and the just-committed `currentPageNumber` change in the
      // same tick, with no frame where either is stale relative to the
      // other.
      turnTimeoutRef.current = setTimeout(() => {
        setTurningLeaf(null);
        commit();
      }, TURN_DURATION_MS);
    },
  });

  currentPageNumberRef.current = currentPageNumber;

  const bookmark = useBookBookmark(book.slug, currentPageNumber);

  useEffect(
    () => () => {
      if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    },
    []
  );

  // Book Interaction mode, URL-addressable via `?read=1`: Share links land
  // a recipient straight into reading mode, the browser Back button exits
  // it (what a visitor expects, especially on mobile), and a reload keeps
  // it. `router.replace` (not `push`) so entering/exiting doesn't pile up
  // history entries for every toggle.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isImmersive = searchParams.get(IMMERSIVE_QUERY_KEY) === "1";

  const enterImmersive = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.set(IMMERSIVE_QUERY_KEY, "1");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const exitImmersive = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(IMMERSIVE_QUERY_KEY);
    const queryString = next.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  // Escape (routed here from `useDialogA11y` via `book-immersive-chrome`'s
  // `onRequestClose`) closes the TOC first if it's open, matching how a
  // real nested dialog should unwind one layer at a time rather than
  // dropping straight out of Book Interaction mode entirely.
  const handleImmersiveClose = useCallback(() => {
    if (tocOpen) {
      setTocOpen(false);
      return;
    }
    exitImmersive();
  }, [tocOpen, exitImmersive]);

  return (
    <>
      {!isImmersive && (
        <div className="flex flex-col gap-3">
          <Flipbook
            pagination={pagination}
            status={status}
            css={css}
            geometry={geometry}
            isMobile={isMobile}
            currentPageNumber={currentPageNumber}
            pageCount={pageCount}
            goToPage={goToPage}
            turningLeaf={turningLeaf}
            isFading={isFading}
            zoom={zoom}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          />
          <FlipbookControls
            currentPageNumber={currentPageNumber}
            pageCount={pageCount}
            onNext={goNext}
            onPrev={goPrev}
            onGoToPage={goToPage}
            onOpenToc={() => setTocOpen(true)}
            pdf={book.pdf}
            bookSlug={book.slug}
            onEnterImmersive={enterImmersive}
          />
        </div>
      )}

      {isImmersive && (
        <BookImmersiveChrome
          bookTitle={book.title}
          doctorName={book.resolvedSettings.doctorName}
          currentPageNumber={currentPageNumber}
          pageCount={pageCount}
          onNext={goNext}
          onPrev={goPrev}
          onGoToPage={goToPage}
          onGoToStart={goToStart}
          onGoToEnd={goToEnd}
          onOpenToc={() => setTocOpen(true)}
          tocOpen={tocOpen}
          zoom={zoom}
          onZoomChange={setZoom}
          soundEnabled={sound.enabled}
          onToggleSound={sound.toggle}
          onShare={share.share}
          shareCopied={share.copied}
          pdf={book.pdf}
          bookSlug={book.slug}
          onRequestClose={handleImmersiveClose}
          viewMode={isMobile ? "single" : "spread"}
          onViewModeChange={setViewModeOverride}
          isBookmarked={bookmark.isBookmarked}
          onToggleBookmark={bookmark.toggle}
          searchQuery={search.query}
          onSearchQueryChange={search.setQuery}
          searchResults={search.results}
          onSearchSelect={goToPage}
        >
          <Flipbook
            pagination={pagination}
            status={status}
            css={css}
            geometry={geometry}
            isMobile={isMobile}
            currentPageNumber={currentPageNumber}
            pageCount={pageCount}
            goToPage={goToPage}
            turningLeaf={turningLeaf}
            isFading={isFading}
            zoom={zoom}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            maxScale={IMMERSIVE_MAX_SCALE}
            fillRatio={IMMERSIVE_FILL_RATIO}
            fillContainer
          />
        </BookImmersiveChrome>
      )}

      <BookTocPanel
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        toc={pagination?.toc ?? []}
        onSelect={(sequencePosition) => {
          if (sequencePosition !== null) goToPage(sequencePosition);
          setTocOpen(false);
        }}
        isNested={isImmersive}
      />
    </>
  );
}

"use client";
import { spreadFor } from "@/lib/books/render/book-physical-order";
import type { ResolvedGeometry } from "@/lib/books/render/geometry";
import type { PaginationResult, RenderedPage } from "@/lib/books/render/page-model.interface";
import { useEffect, useMemo, useRef } from "react";
import { useFitScale } from "./use-fit-scale";

export const TURN_DURATION_MS = 550;
export const REDUCED_MOTION_FADE_MS = 180;

/**
 * The turning leaf is sliced into this many vertical strips rather than
 * rotated as one rigid rectangle — each strip crops (via `overflow:
 * hidden`) a full-width copy of the page content down to just its own
 * column, then rotates on its own clock (see `CURL_SPINE_DELAY_RATIO` and
 * `CURL_WEIGHT_POWER`). Kept small: this is now a SUBTLE per-slice
 * variation concentrated at the free edge (see below), not a smooth
 * gradient meant to read as its own bend across the whole leaf, so it
 * doesn't need many slices to look right.
 */
const CURL_SLICE_COUNT = 6;

/**
 * Each slice is rendered this many mm wider than its allocated column and
 * shifted half that amount toward the spine, so it physically overlaps
 * its neighbors by `CURL_SLICE_OVERLAP_MM / 2` on each side. Two
 * independently-rotating rigid slices can never stay perfectly flush at
 * every instant (see `CURL_SLICE_COUNT`'s doc comment) — a small overlap
 * means any gap that opens up reveals more of the SAME page content
 * (from the neighboring slice's own copy) rather than the static page
 * underneath, which reads as a soft seam instead of a hard crack.
 */
const CURL_SLICE_OVERLAP_MM = 0.9;

/**
 * The spine-adjacent slice's rotation is DELAYED (a positive
 * `animation-delay`, not the negative "head start" an earlier version
 * used) by up to this fraction of `TURN_DURATION_MS`, and its animation
 * is correspondingly SHORTENED so every slice still finishes at the same
 * real time. A positive delay keeps every slice's own rotation starting
 * from a genuine 0deg (no pop into a part-bent shape at t=0, no snap at
 * the end). Combined with `CURL_WEIGHT_POWER`, this max is reached ONLY
 * by the outermost slice or two — kept small on purpose. Two earlier
 * passes (0.4, then 0.16) both still read as a bend visibly traveling
 * across the page ("a wave"); the fix isn't a smaller ratio alone, it's
 * concentrating where any timing difference exists at all — see
 * `CURL_WEIGHT_POWER`.
 */
const CURL_SPINE_DELAY_RATIO = 0.07;

/**
 * Exponent applied to each slice's linear 0..1 spine-to-free-edge
 * position before it's used as the delay/weight fraction. At power=1
 * (the previous two attempts), weight increases evenly slice to slice,
 * which is exactly what a viewer reads as "a bend traveling across the
 * sheet" — every slice visibly differs a little from its neighbor. A
 * high power keeps weight near zero for every slice except the last one
 * or two, so the middle of the page stays essentially rigid and
 * synchronized with the spine, and only the free edge itself picks up a
 * small extra lag — "one rigid page + a slight curl at the free edge"
 * instead of a progressive fold.
 */
const CURL_WEIGHT_POWER = 5;

/**
 * TEMPORARY debug switch: renders the turning leaf as one rigid rectangle
 * (no slicing/curl), used to confirm the basic rotateY direction in
 * isolation before layering the curl back on top of it. Leave `false` —
 * flip back to `true` only if the base rotation direction ever needs
 * re-isolating from the curl for debugging.
 */
const CURL_DEBUG_SIMPLE_RECT = true;

export interface TurningLeaf {
  side: "left" | "right";
  /** What that slot currently shows — the turning leaf's FRONT face. */
  fromHtml: string;
  /** What that SAME slot will show once the turn commits — the leaf's BACK face, pre-rotated 180deg so it faces the viewer exactly when the front face rotates away. */
  toHtml: string;
}

/**
 * Which page number occupies a given physical slot for the spread
 * anchored at `pageNumber` — the single source both `Flipbook` (to
 * decide what to render right now) and `book-reader-shell.tsx` (to
 * decide what a turning leaf's "landing" face should show) use, so the
 * cover-alone spread and an even total page count's unpaired final page
 * are handled identically in both places rather than risking the two
 * copies drifting apart.
 */
export function resolveSlotPageNumber(
  pageNumber: number,
  side: "left" | "right",
  pageCount: number,
  isMobile: boolean,
): number | null {
  if (isMobile) return side === "right" ? pageNumber : null;
  const spread = spreadFor(pageNumber);
  if (side === "left") {
    return spread.left !== null && spread.left <= pageCount ? spread.left : null;
  }
  return spread.left === null ? pageNumber : (spread.right ?? pageNumber);
}

export interface FlipbookProps {
  pagination: PaginationResult | null;
  status: "loading" | "ready" | "error";
  css: string;
  geometry: ResolvedGeometry;
  isMobile: boolean;
  currentPageNumber: number;
  pageCount: number;
  goToPage: (pageNumber: number) => void;
  turningLeaf: TurningLeaf | null;
  isFading: boolean;
  zoom: number;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  /**
   * Book Interaction mode raises both so the book actually fills a large
   * viewport instead of sitting at its printed size — see
   * `use-fit-scale.ts`. Page mode leaves them at the hook's own defaults
   * (a physical page never renders larger than its real mm size there).
   */
  maxScale?: number;
  fillRatio?: number;
  /** Page mode bounds the stage to `h-[70vh]`; Book Interaction mode fills whatever container it's given completely. */
  fillContainer?: boolean;
}

/**
 * The book surface only: injected template `<style>`, the physical
 * two-page (or single-page) spread, and the turning-leaf overlay. No
 * pagination, navigation, zoom, sound, or Book Interaction state lives
 * here anymore — `book-reader-shell.tsx` owns all of that and renders
 * this component once for page mode and once inside
 * `book-immersive-chrome.tsx`, passing the same live state to both (they
 * are never mounted simultaneously, so sharing one `stageRef`/`contentRef`
 * pair across mode switches in the parent is safe). `useFitScale` and the
 * TOC click-delegation effect stay local to this component — both are
 * pure rendering concerns that only need props already available here.
 */
export function Flipbook({
  pagination,
  status,
  css,
  geometry,
  isMobile,
  currentPageNumber,
  pageCount,
  goToPage,
  turningLeaf,
  isFading,
  zoom,
  onTouchStart,
  onTouchEnd,
  maxScale,
  fillRatio,
  fillContainer = false,
}: FlipbookProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Keyed by 1-based PHYSICAL position in `pagination.pages` — never by
  // `page.pageNumber` (the printed folio). The cover, title, and
  // copyright pages are real, reachable pages with no printed folio
  // (`pageNumber: null`, matching real book convention); keying this map
  // by folio made them permanently unreachable, since they'd never get
  // inserted at all — the bug behind "the reader opens on the About
  // Doctor page instead of the cover." Physical position is always
  // defined for every page, numbered or not.
  const pagesByNumber = useMemo(() => {
    const map = new Map<number, RenderedPage>();
    pagination?.pages.forEach((page, index) => {
      map.set(index + 1, page);
    });
    return map;
  }, [pagination]);

  // Event delegation for clickable TOC entries rendered INSIDE a page's
  // own HTML (the reserved TOC pages — see paginate-book.ts's
  // `fillTocPages`, which stamps `data-toc-chapter-id` on each row).
  useEffect(() => {
    function onClick(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      const entry = target.closest<HTMLElement>("[data-toc-chapter-id]");
      if (!entry || !pagination) return;
      const chapterId = entry.getAttribute("data-toc-chapter-id");
      const tocEntry = pagination.toc.find((item) => item.chapterId === chapterId);
      // `sequencePosition`, never `pageNumber` (the printed folio) — see
      // the doc comment on `pagesByNumber` above; the two axes diverge as
      // soon as any unnumbered page precedes this chapter.
      if (tocEntry?.sequencePosition) goToPage(tocEntry.sequencePosition);
    }
    const content = contentRef.current;
    content?.addEventListener("click", onClick);
    return () => content?.removeEventListener("click", onClick);
  }, [pagination, goToPage]);

  const fitScale =
    useFitScale(stageRef, contentRef, [pageCount, isMobile, maxScale, fillRatio], { maxScale, fillRatio }) * zoom;

  if (status === "error") {
    return (
      <p className="p-8 text-center text-sm text-slate-500" dir="rtl">
        حدث خطأ أثناء تجهيز الكتاب. يرجى إعادة تحميل الصفحة.
      </p>
    );
  }

  const spread = isMobile ? null : spreadFor(currentPageNumber);
  // spread.right is always <= currentPageNumber <= pageCount, but spread.left
  // (right + 1) can overflow pageCount when the book's total page count is
  // even — the last page then has no pair and must render alone, exactly
  // like the cover, rather than showing a folio for a page that was never
  // generated.
  const leftPageNumber =
    spread?.left !== null && spread?.left !== undefined && spread.left <= pageCount ? spread.left : null;
  const rightPageNumber =
    spread?.left === null || spread === null ? currentPageNumber : (spread.right ?? currentPageNumber);
  const showTwoPages = !isMobile && leftPageNumber !== null;

  return (
    // `fillContainer`'s whole point is "fill whatever real height the
    // parent already computed" (Book Interaction mode's flex-1 stage
    // area) — but a percentage/h-full height only resolves against an
    // ancestor with a DEFINITE height. Without `flex h-full flex-col`
    // here, this div sizes to its own content (the CSS auto-height
    // default), which breaks that chain one level up: the stage div
    // below asking for `h-full` against an auto-height parent doesn't
    // inherit real pixel height, it silently falls back to content-based
    // sizing too — the exact bug behind "the book renders tiny inside a
    // huge empty viewer" in Book Interaction mode.
    <div className={fillContainer ? "book-page-scope flex h-full flex-col" : "book-page-scope"} dir="rtl">
      <style>{css}</style>
      <style>{`
        /* Keyed by which edge of the LEAF is hinged (the spine), not by
           navigation direction. A leaf occupying the "left" slot is always
           hinged on its own right edge (the spine sits to its right); a
           leaf in the "right" slot is hinged on its own left edge. Which
           sign lifts that hinge's free edge OUTWARD (toward the viewer)
           rather than receding behind the book depends only on that
           hinge orientation — confirmed by direct visual test in-browser,
           not by hand-deriving the rotateY matrix sign, which is easy to
           get backwards from memory. Keying by direction instead of side
           was also wrong on mobile: the single visible page is always the
           "right" slot regardless of forward/backward, so a
           direction-keyed animation picked the wrong sign on every mobile
           forward turn. */
        /* Verified against the browser's own computed matrix, not derived
           from memory: for a "left" slot leaf (hinge on its right/spine
           edge, free edge at negative relative-x), the free edge's z
           coordinate under rotateY(theta) is w*sin(theta) — positive
           (toward the viewer) only while theta sweeps through POSITIVE
           values. A negative sweep here (which an earlier pass used)
           moves the free edge away from the viewer, reading as the page
           collapsing behind the spine instead of lifting off it. The
           "right" slot's hinge is mirrored, so it needs the opposite sign. */
        @keyframes book-leaf-turn-left { from { transform: rotateY(0deg); } to { transform: rotateY(180deg); } }
        @keyframes book-leaf-turn-right { from { transform: rotateY(0deg); } to { transform: rotateY(-180deg); } }
        /* End angles are exactly +/-180deg, not an eyeballed near-180
           value: the leaf's back face is pre-rotated 180deg to land facing
           the viewer, and the destination page slot underneath renders
           the same content unrotated. Landing at anything other than
           exactly 180deg would leave a visible pop/snap the instant this
           overlay unmounts and the static slot takes over. */
        /* A page mid-turn catches the least light right as it's edge-on to
           the viewer — this darkens then lightens the leaf on that same
           timing, on top of the rotation. Used by both the debug rigid
           rectangle and the curl (as one fixed, non-traveling shadow
           anchored at the free edge — see where it's rendered). */
        @keyframes book-leaf-shade { 0% { opacity: 0; } 55% { opacity: 0.6; } 70% { opacity: 0.6; } 100% { opacity: 0; } }
      `}</style>

      <div
        ref={stageRef}
        className={
          fillContainer
            ? "relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
            : "relative flex h-[70vh] min-h-[420px] items-center justify-center overflow-hidden"
        }
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {status === "loading" || !pagination ? (
          <p className="text-sm text-slate-500" dir="rtl">
            جاري تحضير الكتاب…
          </p>
        ) : (
          <div ref={contentRef} style={{ transform: `scale(${fitScale})` }}>
            <div
              className="relative"
              style={{
                width: showTwoPages ? `${geometry.widthMm * 2}mm` : `${geometry.widthMm}mm`,
                height: `${geometry.heightMm}mm`,
                opacity: isFading ? 0.4 : 1,
                transition: `opacity ${REDUCED_MOTION_FADE_MS}ms ease-in-out`,
                // Closer than a "flat" perspective (~2400px+) so the turn
                // actually foreshortens as it rotates — the difference
                // between a page that visibly curls through 3D space and
                // one that just looks like a flat rectangle rotating in
                // place.
                perspective: "1600px",
                boxShadow: "0 30px 70px rgba(0,0,0,0.4), 0 10px 24px rgba(0,0,0,0.28)",
              }}
            >
              <PageSlot
                side="right"
                pageWidthMm={geometry.widthMm}
                sequencePosition={rightPageNumber}
                page={pagesByNumber.get(rightPageNumber)}
              />
              {leftPageNumber !== null ? (
                <PageSlot
                  side="left"
                  pageWidthMm={geometry.widthMm}
                  sequencePosition={leftPageNumber}
                  page={pagesByNumber.get(leftPageNumber)}
                />
              ) : null}

              {/* The center seam — a real physical book's gutter shadow,
                  where the two leaves meet at the binding. Only meaningful
                  for an actual two-page spread; a single page (mobile, or
                  the lone cover/last-orphan-page case) has no seam to draw. */}
              {showTwoPages ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 z-[4]"
                  style={{
                    left: "50%",
                    width: "14mm",
                    marginLeft: "-7mm",
                    background: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0) 100%)",
                  }}
                />
              ) : null}

              {turningLeaf ? <TurningLeafOverlay turningLeaf={turningLeaf} geometry={geometry} /> : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * `sequencePosition` (always defined — the physical slot being rendered)
 * is deliberately separate from `page.pageNumber` (the printed folio,
 * `null` for the cover/title/copyright pages) — the folio digit must only
 * ever show when the page actually carries one, never fall back to the
 * physical position as a stand-in number.
 */
function PageSlot({
  side,
  pageWidthMm,
  sequencePosition,
  page,
}: {
  side: "left" | "right";
  pageWidthMm: number;
  sequencePosition: number;
  page: RenderedPage | undefined;
}) {
  return (
    // `position: "absolute"` is set here, not left to the Tailwind
    // `absolute` class, because `.book-page`'s own stylesheet rule (see
    // template-css.ts) sets `position: relative` at equal specificity —
    // whichever rule's `<style>` tag lands later in the DOM wins a tie,
    // which in practice was this component's own injected `<style>{css}</style>`,
    // silently turning every "absolute ... book-page" element back into
    // normal document flow. Two overlaid page slots then stacked
    // vertically instead of sitting side by side, with the second one
    // pushed below the visible stage — the actual cause of "a spread's
    // left page renders blank": it wasn't missing, it was rendered ~800px
    // further down the page than the visible viewport. An inline style
    // always wins regardless of stylesheet order, so this can't regress
    // the same way again.
    <div
      className="top-0 book-page"
      data-side={side}
      data-page-number={sequencePosition}
      style={{ position: "absolute", [side]: 0, width: `${pageWidthMm}mm`, height: "100%" }}
    >
      <div className="book-page-content" dangerouslySetInnerHTML={{ __html: page?.html ?? "" }} />
      {page?.pageNumber !== null && page?.pageNumber !== undefined ? (
        <div className="book-folio">{page.pageNumber}</div>
      ) : null}
    </div>
  );
}

/**
 * The turning leaf, split into `CURL_SLICE_COUNT` vertical strips instead
 * of one rigid rectangle. Every strip is positioned left-to-right within
 * the leaf's own coordinate frame (0 at the leaf's own left edge)
 * regardless of which physical slot the leaf occupies — only two things
 * vary with `side`: which of the leaf's two edges is the spine (hinge),
 * and therefore which strip sits against it and gets the least stagger.
 *
 * Each strip is an `overflow: hidden` window sized to one slice-width;
 * inside it, a full-leaf-width front/back face pair is shifted left by
 * that strip's own offset so only its column shows through the window —
 * this crops arbitrary HTML content into strips without re-rendering or
 * measuring anything per slice.
 */
function TurningLeafOverlay({ turningLeaf, geometry }: { turningLeaf: TurningLeaf; geometry: ResolvedGeometry }) {
  const keyframeName = `book-leaf-turn-${turningLeaf.side}`;

  if (CURL_DEBUG_SIMPLE_RECT) {
    // One rigid rectangle, hinged at the leaf's own spine edge (100%/0% of
    // the WHOLE leaf — the same origin the pre-curl single-leaf design
    // used) so the basic rotateY direction can be judged without the
    // curl's staggered per-slice motion in the way.
    const localOrigin = turningLeaf.side === "left" ? "100% center" : "0% center";
    return (
      <div
        className="absolute top-0"
        data-side={turningLeaf.side}
        style={{
          [turningLeaf.side]: 0,
          width: `${geometry.widthMm}mm`,
          height: `${geometry.heightMm}mm`,
          transformOrigin: localOrigin,
          transformStyle: "preserve-3d",
          animation: `${keyframeName} ${TURN_DURATION_MS}ms ease-in-out forwards`,
          boxShadow: "0 0 12px rgba(0,0,0,0.25)",
          zIndex: 5,
        }}
      >
        <div
          className="top-0 book-page"
          data-side={turningLeaf.side}
          style={{
            position: "absolute",
            left: 0,
            width: `${geometry.widthMm}mm`,
            height: "100%",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="book-page-content" dangerouslySetInnerHTML={{ __html: turningLeaf.fromHtml }} />
        </div>
        <div
          className="top-0 book-page"
          data-side={turningLeaf.side}
          style={{
            position: "absolute",
            left: 0,
            width: `${geometry.widthMm}mm`,
            height: "100%",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="book-page-content" dangerouslySetInnerHTML={{ __html: turningLeaf.toHtml }} />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0.5), rgba(0,0,0,0.05))",
            animation: `book-leaf-shade ${TURN_DURATION_MS}ms ease-in-out forwards`,
          }}
        />
      </div>
    );
  }

  const sliceWidthMm = geometry.widthMm / CURL_SLICE_COUNT;

  return (
    <div
      className="absolute top-0"
      data-side={turningLeaf.side}
      style={{ [turningLeaf.side]: 0, width: `${geometry.widthMm}mm`, height: `${geometry.heightMm}mm`, zIndex: 5 }}
    >
      {/* Each slice hinges on its OWN near-spine edge (a fixed "0%"/"100%"
          local origin), never on the leaf's actual (distant) spine line.
          An earlier version pointed every slice's transform-origin at the
          true shared spine, up to a full leaf-width away for the
          outermost slice — rotating a ~18mm-wide slice around a pivot
          ~150mm away doesn't make it curl in place, it swings the whole
          slice through a wide arc (a pendulum, not a hinge), carrying it
          completely outside its own `overflow: hidden` clipping window
          and making it vanish for most of the turn. Keeping the origin
          local to each slice's own edge bounds that swing to roughly the
          slice's own width, which is what actually reads as a bending
          sheet. This does mean adjacent slices rotate around slightly
          different points, so their edges don't stay perfectly flush
          mid-turn — an acceptable seam for a lightweight CSS curl, per
          the brief's own "doesn't need a physics engine" allowance. */}
      {Array.from({ length: CURL_SLICE_COUNT }, (_, i) => {
        const sliceLeftMm = i * sliceWidthMm;
        // Widened by the overlap and shifted left by half of it, so the
        // rendered window is centered on the slice's nominal slot — see
        // `CURL_SLICE_OVERLAP_MM`'s doc comment for why.
        const renderLeftMm = sliceLeftMm - CURL_SLICE_OVERLAP_MM / 2;
        const renderWidthMm = sliceWidthMm + CURL_SLICE_OVERLAP_MM;
        const localOrigin = turningLeaf.side === "left" ? "100% center" : "0% center";
        // 0 at the spine-adjacent slice, 1 at the free edge, linearly...
        const linearPosition =
          turningLeaf.side === "left"
            ? (CURL_SLICE_COUNT - 1 - i) / (CURL_SLICE_COUNT - 1)
            : i / (CURL_SLICE_COUNT - 1);
        // ...then raised to `CURL_WEIGHT_POWER` so only the free edge
        // itself carries meaningful weight and the rest of the page stays
        // synchronized — see that constant's doc comment.
        const weight = linearPosition ** CURL_WEIGHT_POWER;
        // Positive delay, shorter duration — see `CURL_SPINE_DELAY_RATIO`'s
        // doc comment. The free-edge slice (weight=1) gets delay=0 and the
        // full duration; the spine slice (weight=0) starts latest and
        // rushes through a shorter window, but every slice's OWN rotation
        // still runs from a genuine 0deg to the same final angle, and all
        // of them reach it at exactly the same real time.
        const delayMs = (1 - weight) * CURL_SPINE_DELAY_RATIO * TURN_DURATION_MS;
        const durationMs = TURN_DURATION_MS - delayMs;

        return (
          <div
            key={i}
            className="absolute top-0 overflow-hidden"
            style={{ left: `${renderLeftMm}mm`, width: `${renderWidthMm}mm`, height: "100%" }}
          >
            <div
              className="absolute top-0"
              style={{
                left: 0,
                width: `${renderWidthMm}mm`,
                height: "100%",
                transformOrigin: localOrigin,
                transformStyle: "preserve-3d",
                animation: `${keyframeName} ${durationMs}ms ease-in-out ${delayMs}ms both`,
              }}
            >
              {/* `position: "absolute"` inline, not the Tailwind class — see
                  the doc comment on `PageSlot`'s own root div for why
                  `.book-page`'s stylesheet rule can otherwise win the tie. */}
              <div
                className="top-0 book-page"
                data-side={turningLeaf.side}
                style={{
                  position: "absolute",
                  left: `${-renderLeftMm}mm`,
                  width: `${geometry.widthMm}mm`,
                  height: "100%",
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="book-page-content" dangerouslySetInnerHTML={{ __html: turningLeaf.fromHtml }} />
              </div>
              <div
                className="top-0 book-page"
                data-side={turningLeaf.side}
                style={{
                  position: "absolute",
                  left: `${-renderLeftMm}mm`,
                  width: `${geometry.widthMm}mm`,
                  height: "100%",
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="book-page-content" dangerouslySetInnerHTML={{ __html: turningLeaf.toHtml }} />
              </div>
            </div>
          </div>
        );
      })}
      {/* ONE shadow, fixed in place (not translating), anchored at the
          free edge and fading toward the spine — it fades in and back out
          with the turn instead of sweeping across the leaf, since the
          bend itself is now localized to the free edge rather than
          traveling across the whole sheet. A moving band here would
          re-introduce the same "traveling wave" read the bend itself was
          just fixed to avoid. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            turningLeaf.side === "left"
              ? "linear-gradient(90deg, rgba(0,0,0,0.3), transparent 45%)"
              : "linear-gradient(270deg, rgba(0,0,0,0.3), transparent 45%)",
          animation: `book-leaf-shade ${TURN_DURATION_MS}ms ease-in-out forwards`,
        }}
      />
    </div>
  );
}

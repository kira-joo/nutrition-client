/**
 * `page-flip@2.0.7` ships no `.d.ts` and declares no `types` field — its
 * `src/*.ts` sources are in the tarball but `main` points at the compiled
 * browser bundle, so TypeScript sees an untyped module. This declares
 * only the surface we actually call.
 *
 * Deliberately NOT a copy of the library's own enums: `FlipCorner` /
 * `FlippingState` / `SizeType` / `Orientation` are all `const enum`s
 * there, which cannot survive `isolatedModules: true` (see tsconfig) —
 * their string literal values are declared directly instead.
 */
declare module "page-flip" {
  export type FlipCorner = "top" | "bottom";
  export type FlippingState = "user_fold" | "fold_corner" | "flipping" | "read";
  export type SizeType = "fixed" | "stretch";
  export type Orientation = "portrait" | "landscape";

  export interface PageRect {
    left: number;
    top: number;
    width: number;
    height: number;
    /** Width of ONE page — half the book in landscape, the whole book in portrait. */
    pageWidth: number;
  }

  export interface FlipSetting {
    startPage: number;
    size: SizeType;
    width: number;
    height: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    drawShadow: boolean;
    flippingTime: number;
    usePortrait: boolean;
    startZIndex: number;
    autoSize: boolean;
    maxShadowOpacity: number;
    showCover: boolean;
    mobileScrollSupport: boolean;
    clickEventForward: boolean;
    useMouseEvents: boolean;
    swipeDistance: number;
    showPageCorners: boolean;
    disableFlipByClick: boolean;
  }

  export interface WidgetEvent {
    data: number | string | boolean | object;
    object: PageFlip;
  }

  export type PageDensity = "soft" | "hard";

  /**
   * Only the density accessors are declared. `StPageFlipEngine` needs
   * them to repair the library's own density bleed: `Flip.start()`
   * promotes a soft page to `hard` to match an adjacent hard cover, but
   * `Flip.reset()` never restores it, so the page next to a cover stays
   * rigid for the rest of the session.
   */
  export interface Page {
    /** The page's REAL density, as declared by `data-density`. */
    getDensity(): PageDensity;
    /** The density it is currently being drawn with — may have been temporarily promoted. */
    getDrawingDensity(): PageDensity;
    setDrawingDensity(density: PageDensity): void;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: Partial<FlipSetting>);

    /** Moves `items` into the library's own `.stf__block` container — they must not be React-managed nodes. */
    loadFromHTML(items: HTMLElement[] | NodeListOf<HTMLElement>): void;
    updateFromHtml(items: HTMLElement[] | NodeListOf<HTMLElement>): void;
    /** Also removes the root element it was constructed with. */
    destroy(): void;
    update(): void;

    /** Animated. */
    flipNext(corner?: FlipCorner): void;
    flipPrev(corner?: FlipCorner): void;
    flip(page: number, corner?: FlipCorner): void;

    /** Instant, no animation. */
    turnToNextPage(): void;
    turnToPrevPage(): void;
    turnToPage(page: number): void;

    getPageCount(): number;
    getCurrentPageIndex(): number;
    getPage(pageIndex: number): Page;
    getOrientation(): Orientation;
    getBoundsRect(): PageRect;
    getState(): FlippingState;

    on(eventName: "flip" | "changeState" | "changeOrientation" | "init" | "update", callback: (e: WidgetEvent) => void): PageFlip;
    off(eventName: string): void;
  }
}

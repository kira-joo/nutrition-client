"use client";
import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { AssetLightbox } from "@kira-joo/frontend-toolkit-tailwind/asset-viewer";

export interface GalleryFilmstripItem {
  key: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholderUrl?: string;
}

export interface GalleryFilmstripProps {
  items: GalleryFilmstripItem[];
}

/**
 * Thumbnail rail + lightbox for a CMS image gallery.
 *
 * Drives `AssetLightbox` directly rather than the higher-level
 * `AssetViewer`. `AssetViewer` was the first choice — its doc comment says
 * it supplies the focus restoration `AssetLightbox` deliberately leaves to
 * its caller — but verified in a real browser, focus lands on `<body>`
 * after closing, not back on the thumbnail. That's consistent with how it
 * must work internally: it can only restore focus to a thumbnail it
 * rendered itself, and `renderThumbnail` (needed here so none of the
 * package's Backoffice-oriented default styling reaches the public site)
 * replaces exactly that element. Owning the open index locally costs a few
 * lines and closes the §19 gap explicitly, which the plan requires of every
 * integration point.
 *
 * Focus returns to the thumbnail for the image last *viewed*, not strictly
 * the one clicked: after arrow-keying from image 1 to image 5, landing back
 * on image 1 loses the user's place. When no navigation happened the two
 * are identical, so this is a superset of returning focus to the trigger.
 *
 * Thumbnails are locked to a single 4:3 ratio even though the sources vary
 * (verified live: 1.25, 1.78, 1.53, and two 1:1) — a rail only scrolls
 * cleanly if every frame matches. The lightbox is unconstrained and shows
 * each image at its true ratio.
 */
export function GalleryFilmstrip({ items }: GalleryFilmstripProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggersRef = useRef<Array<HTMLButtonElement | null>>([]);

  const close = useCallback(() => {
    const returnTo = triggersRef.current[openIndex ?? 0];
    setOpenIndex(null);
    // Deferred a frame: the lightbox unmounts its portal during this
    // update, and focusing a node while that teardown is in flight gets
    // clobbered back to <body>.
    requestAnimationFrame(() => returnTo?.focus());
  }, [openIndex]);

  if (items.length === 0) return null;

  return (
    <>
      <ul className="mt-8 -mx-4 grid auto-cols-max grid-flow-col snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {items.map((item, index) => (
          <li key={item.key}>
            <button
              ref={(node) => {
                triggersRef.current[index] = node;
              }}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group relative block aspect-[4/3] w-56 shrink-0 snap-start overflow-hidden rounded-xl border-hairline border-border bg-surface-muted shadow-sm transition-shadow duration-base ease-standard hover:shadow-md sm:w-64 lg:w-full"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 22rem, 16rem"
                className="object-cover transition-transform duration-base ease-standard group-hover:scale-105"
                placeholder={item.placeholderUrl ? "blur" : undefined}
                blurDataURL={item.placeholderUrl}
              />
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && (
        <AssetLightbox
          images={items.map((item) => ({ src: item.src, alt: item.alt, width: item.width, height: item.height }))}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={close}
        />
      )}
    </>
  );
}

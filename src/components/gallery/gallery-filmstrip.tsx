"use client";
import Image from "next/image";
import { SiteLightbox } from "@/components/gallery/site-lightbox";
import { useLightbox } from "@/components/gallery/use-lightbox";

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
 * Drives `SiteLightbox` directly rather than a higher-level gallery
 * component; `useLightbox` owns the open index and the focus restoration,
 * and explains why (see that hook).
 *
 * Thumbnails are locked to a single 4:3 ratio even though the sources vary
 * (verified live: 1.25, 1.78, 1.53, and two 1:1) — a rail only scrolls
 * cleanly if every frame matches. The lightbox is unconstrained and shows
 * each image at its true ratio.
 */
export function GalleryFilmstrip({ items }: GalleryFilmstripProps) {
  const { openIndex, setOpenIndex, close, registerTrigger } = useLightbox();

  if (items.length === 0) return null;

  return (
    <>
      <ul className="mt-8 -mx-4 grid auto-cols-max grid-flow-col snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {items.map((item, index) => (
          <li key={item.key}>
            <button
              ref={registerTrigger(index)}
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
        <SiteLightbox
          images={items.map((item) => ({ src: item.src, alt: item.alt, width: item.width, height: item.height }))}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={close}
        />
      )}
    </>
  );
}

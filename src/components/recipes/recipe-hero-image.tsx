"use client";
import Image from "next/image";
import { Expand } from "lucide-react";
import { SiteLightbox } from "@/components/gallery/site-lightbox";
import { useLightbox } from "@/components/gallery/use-lightbox";

export interface RecipeHeroImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholderUrl?: string;
  viewLabel: string;
}

/**
 * The recipe's photo, openable full-size. Uses the same `useLightbox`
 * focus handling as the doctor gallery so there's one lightbox behaviour on
 * the site rather than two subtly different ones.
 *
 * A real `<button>` wrapper, so it's reachable and operable by keyboard
 * rather than being a click-only image. The hero itself keeps a fixed 4:3
 * frame to hold layout while the image loads; the lightbox shows the photo
 * at its true ratio.
 */
export function RecipeHeroImage({ src, alt, width, height, placeholderUrl, viewLabel }: RecipeHeroImageProps) {
  const { openIndex, setOpenIndex, close, registerTrigger } = useLightbox();

  return (
    <>
      <button
        ref={registerTrigger(0)}
        type="button"
        onClick={() => setOpenIndex(0)}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-muted shadow-md"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 40rem, 100vw"
          className="object-cover"
          priority
          placeholder={placeholderUrl ? "blur" : undefined}
          blurDataURL={placeholderUrl}
        />
        <span className="absolute bottom-3 end-3 flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-caption font-semibold text-text-primary opacity-0 backdrop-blur transition-opacity duration-base ease-standard group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
          <Expand className="size-icon-sm" aria-hidden="true" />
          {viewLabel}
        </span>
      </button>

      {openIndex !== null && (
        <SiteLightbox images={[{ src, alt, width, height }]} index={0} onIndexChange={setOpenIndex} onClose={close} />
      )}
    </>
  );
}

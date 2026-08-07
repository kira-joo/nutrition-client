import Image from "next/image";
import { Container } from "@/components/ui/container";
import type { LocalizedMediaBlock } from "@/lib/domain/campaign";

export interface MediaBlockProps {
  block: LocalizedMediaBlock;
}

/**
 * The image/video is the full visual centerpiece, per the design brief —
 * a large, contained frame (not full-bleed like the hero, so it reads as a
 * distinct rhythm beat rather than a second hero), with a subdued caption
 * beneath rather than overlaid text competing with the media itself.
 *
 * Video takes priority when both are set (matching the schema's own
 * business rule: at least one of the two is present, never neither) — an
 * uploaded video is the richer asset, and a still image alongside it would
 * only be a redundant poster, which `VideoAsset.posterUrl` already covers
 * natively via the `poster` attribute below.
 */
export function MediaBlock({ block }: MediaBlockProps) {
  if (!block.video && !block.image) return null;

  return (
    <Container>
      <div className="overflow-hidden rounded-2xl bg-black shadow-md">
        {block.video ? (
          <video controls preload="metadata" poster={block.video.posterUrl} playsInline className="aspect-video w-full object-cover">
            <source src={block.video.secureUrl} type={`video/${block.video.format}`} />
          </video>
        ) : (
          block.image && (
            <div className="relative aspect-video w-full">
              <Image
                src={block.image.secureUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 64rem, 100vw"
                className="object-cover"
                placeholder={block.image.placeholderUrl ? "blur" : undefined}
                blurDataURL={block.image.placeholderUrl}
              />
            </div>
          )
        )}
      </div>
      {block.caption && <p className="mt-3 text-center text-body-sm text-text-muted">{block.caption}</p>}
    </Container>
  );
}

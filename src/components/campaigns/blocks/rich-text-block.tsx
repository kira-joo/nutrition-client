import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/container";
import type { LocalizedRichTextBlock } from "@/lib/domain/campaign";

export interface RichTextBlockProps {
  block: LocalizedRichTextBlock;
}

/**
 * Plain text only — no HTML/rich formatting is ever authored or trusted
 * (the schema stores a plain string, not markup), so this earns "designed"
 * through layout alone: a constrained reading measure and generous
 * line-height/paragraph spacing, not typographic markup it was never given.
 * `whitespace-pre-line` is what turns the author's line breaks into real
 * paragraph breaks without needing HTML.
 */
export function RichTextBlock({ block }: RichTextBlockProps) {
  return (
    <Container width="narrow">
      {block.heading && <h2 className="text-heading-1 font-bold text-text-primary">{block.heading}</h2>}
      <p className={cn("whitespace-pre-line text-body-lg leading-relaxed text-text-secondary", block.heading && "mt-4")}>{block.body}</p>
    </Container>
  );
}

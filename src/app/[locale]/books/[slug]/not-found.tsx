import { BookOpen } from "lucide-react";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

/**
 * A missing/unpublished/hidden book is its own product state, not a
 * server fault — nothing to retry. Hardcoded Arabic (no `books` i18n
 * namespace): this route only ever renders under `/ar` (see
 * `middleware.ts`), so there is no English variant to translate for.
 */
export default function BookNotFound() {
  return (
    <Section>
      <Container width="narrow" className="flex flex-col items-center gap-4 py-16 text-center">
        <div dir="rtl" className="flex flex-col items-center gap-4">
          <BookOpen aria-hidden="true" className="size-icon-xl text-text-muted" />
          <h1 className="text-heading-1 font-bold text-text-primary">لم يتم العثور على الكتاب</h1>
          <p className="text-body text-text-secondary">قد يكون هذا الكتاب غير منشور، أو أن الرابط غير صحيح.</p>
          <Button href={AppRoute.Home} variant="secondary" className="mt-2">
            العودة إلى الصفحة الرئيسية
          </Button>
        </div>
      </Container>
    </Section>
  );
}

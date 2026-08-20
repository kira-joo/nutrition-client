import { BookOpen } from "lucide-react";
import AppRoute from "@/constant/AppRoute.enum";
import { NotFoundLayout } from "@/components/ui/not-found-layout";

/**
 * A missing/unpublished/hidden book is its own product state, not a server
 * fault — nothing to retry. Hardcoded Arabic (no `books` i18n namespace): this
 * route only ever renders under `/ar` (see `middleware.ts`), so there is no
 * English variant to translate for, and `dir` is pinned for the same reason.
 */
export default function BookNotFound() {
  return (
    <NotFoundLayout
      icon={BookOpen}
      dir="rtl"
      title="لم يتم العثور على الكتاب"
      description="قد يكون هذا الكتاب غير منشور، أو أن الرابط غير صحيح."
      action={{ href: AppRoute.Home, label: "العودة إلى الصفحة الرئيسية" }}
    />
  );
}

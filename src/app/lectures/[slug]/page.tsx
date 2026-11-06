import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Headphones } from "lucide-react";
import { Locale } from "@/constant/Locale.enum";
import { findLecture } from "@/lib/lectures/lectures";
import { LectureGate } from "@/components/lectures/lecture-gate";

interface LecturePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LecturePageProps): Promise<Metadata> {
  const { slug } = await params;
  const lecture = findLecture(slug);
  return lecture ? { title: lecture.title } : {};
}

/**
 * The standalone lecture page: brand mark, title, description, and the
 * registration gate that becomes the player. No header, footer, or links to
 * the rest of the site — see `../layout.tsx`.
 */
export default async function LecturePage({ params }: LecturePageProps) {
  const { slug } = await params;
  const lecture = findLecture(slug);
  if (!lecture) notFound();

  const t = await getTranslations({ locale: Locale.AR, namespace: "lectures" });
  const tSeo = await getTranslations({ locale: Locale.AR, namespace: "seo" });

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-16">
        <header className="flex flex-col items-center gap-4 text-center">
          <Image
            src="/images/logo.png"
            alt={tSeo("title")}
            width={1536}
            height={1024}
            sizes="144px"
            className="h-20 w-auto object-contain sm:h-24"
            priority
          />
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-label font-semibold text-primary">
            <Headphones aria-hidden="true" className="h-icon-sm w-icon-sm" />
            {t("eyebrow")}
          </p>
          <h1 className="text-heading-1 font-bold text-balance text-text-primary">{lecture.title}</h1>
          <p className="max-w-xl text-body-lg text-pretty text-text-secondary">{lecture.description}</p>
        </header>

        <LectureGate title={lecture.title} audioSrc={lecture.audioSrc} />
      </div>
    </main>
  );
}

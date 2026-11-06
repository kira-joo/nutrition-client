/**
 * Recorded audio lectures, kept as a small local list on purpose: there is no
 * lecture model in nutrition-staff and this first version deliberately adds
 * none. Adding a lecture is one entry here plus its audio file under
 * `public/audio/lectures/`.
 *
 * `title`/`description` are Arabic-only content (the lectures route is an
 * Arabic-only surface, like Books), not UI copy — UI copy for the page lives
 * in the `lectures` next-intl namespace.
 *
 * No duration is stored: the player reads the real one from the media
 * itself, so a re-encoded or replaced file can never disagree with the page.
 */
export interface Lecture {
  slug: string;
  title: string;
  description: string;
  /** Same-origin path under `public/`. Never rendered as a link. */
  audioSrc: string;
}

export const LECTURES: readonly Lecture[] = [
  {
    slug: "before-your-diet-plan",
    title: "محاضرة ما قبل كتابة النظام الغذائي",
    description: "محاضرة صوتية مسجّلة، استمعي إليها كاملة قبل كتابة نظامك الغذائي، في الوقت وبالسرعة التي تناسبك.",
    audioSrc: "/audio/lectures/before-your-diet-plan.mp3",
  },
];

export function findLecture(slug: string): Lecture | undefined {
  return LECTURES.find((lecture) => lecture.slug === slug);
}

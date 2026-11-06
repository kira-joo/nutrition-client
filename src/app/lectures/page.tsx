import { redirect } from "next/navigation";
import { LECTURES } from "@/lib/lectures/lectures";

/**
 * `/lectures` is the link people are given. With a single lecture it goes
 * straight to it; once there are several, this becomes the place for a list.
 */
export default function LecturesIndexPage() {
  redirect(`/lectures/${LECTURES[0].slug}`);
}

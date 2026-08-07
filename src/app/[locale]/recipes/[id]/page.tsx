import { notFound } from "next/navigation";
import type { Locale } from "@/constant/Locale.enum";
import { getRecipe } from "@/lib/data";
import { RecipeDetail } from "@/sections/recipes/recipe-detail";

interface RecipeDetailPageProps {
  params: { locale: Locale; id: string };
}

/** A Mongo ObjectId is exactly 24 hex characters; nothing else can identify a recipe. */
const OBJECT_ID = /^[0-9a-f]{24}$/i;

/**
 * `getRecipe` returns null for a genuine 404 rather than throwing, so an
 * unknown or unpublished id becomes a real not-found page instead of the
 * generic error boundary — a wrong URL isn't a server fault, and offering
 * "try again" for one would be misleading.
 *
 * A malformed id is rejected before the request rather than after: the API
 * answers those with a 400, which isn't a not-found and so propagated as a
 * 500 "this page didn't load" for what is really just a mistyped URL.
 * Checking the shape here keeps that a 404 and skips a request that could
 * never succeed.
 */
export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  if (!OBJECT_ID.test(params.id)) notFound();

  const recipe = await getRecipe(params.id, params.locale);
  if (!recipe) notFound();

  return <RecipeDetail recipe={recipe} />;
}

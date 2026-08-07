// Barrel export for readability at call sites (`import { getRecipe, getPackages } from "@/lib/data"`)
// — purely a convenience re-export, not an abstraction: each function's
// module still does its own real work, nothing is hidden or merged here.
export { getSiteSettings } from "./site-settings";
export { getDoctorProfile } from "./doctor-profile";
export { getPackagesPageSettings } from "./packages-page-settings";
export { getPackages } from "./packages";
export { getRecipeCategories, getRecipeFoodGroups } from "./recipe-taxonomy";
export { getRecipes, getRecipe } from "./recipes";
export { getReviews } from "./reviews";
export { getVideos } from "./videos";
export { getFaqSectionsWithItems } from "./faq";
export { getCampaign, getActiveCampaign } from "./campaigns";

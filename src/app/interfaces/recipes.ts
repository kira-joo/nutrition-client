// These fields hold i18n key strings (looked up via t() at render time, in
// the "recipes" namespace), not display text. Every call site already
// casts through `as Parameters<typeof t>[0]` when actually calling t() with them
// (see recipes/[id]/page.tsx), so a plain `string` here is honest rather
// than replicating a nested-key type that isn't enforced end-to-end.
export interface Recipe {
  id: number;
  title: string;
  image: string;
  description: string;
  category: string;
  foodGroup: string[];
}

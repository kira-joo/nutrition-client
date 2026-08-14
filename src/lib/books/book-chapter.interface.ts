import type { ImageAsset } from "@kira-joo/toolkit-common";
import type { BookBlock } from "./book-block.interface";

/** Hand-synced from nutrition-staff's `src/common/interfaces/book-chapter.interface.ts`. */
export interface Chapter {
  id: string;
  title: string;
  subtitle?: string;
  intro?: string;
  coverImage?: ImageAsset | null;
  startOnNewPage: boolean;
  includeInToc: boolean;
  tocTitle?: string;
  blocks: BookBlock[];
  order: number;
}

export interface BookFrontMatter {
  aboutBook: { blocks: BookBlock[] };
  introduction: { blocks: BookBlock[] };
}

export interface BookBackMatter {
  conclusion: { blocks: BookBlock[] };
}

export interface BookReference {
  id: string;
  label: string;
  text: string;
  url?: string;
}

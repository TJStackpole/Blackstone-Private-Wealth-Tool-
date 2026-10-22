import type { AddonSource } from "@/lib/addons/shared/types";
import content from "@/data/addons/smoothing/content.json";

export interface Paragraph {
  text: string;
  /** Null for the tool's own explanation or analogy; every factual claim carries one. */
  source: AddonSource | null;
}

export interface SmoothingContent {
  asOf: string;
  sample: boolean;
  source: AddonSource;
  sections: { id: string; title: string; paragraphs: Paragraph[] }[];
  script: string[];
  objections: { q: string; a: string }[];
}

export const CONTENT = content as SmoothingContent;

import type { AddonSource } from "@/lib/addons/shared/types";
import content from "@/data/addons/smoothing/content.json";
import series from "@/data/addons/smoothing/series.json";

export interface Paragraph {
  text: string;
  /** Null for the tool's own explanation or analogy; every factual claim carries one. */
  source: AddonSource | null;
  /** A second filing, when the sentence covers two funds. */
  also?: AddonSource;
}

export interface SmoothingContent {
  asOf: string;
  sample: boolean;
  source: AddonSource;
  sections: { id: string; title: string; summary: string; paragraphs: Paragraph[] }[];
  script: string[];
  objections: { q: string; a: string }[];
}

export const CONTENT = content as SmoothingContent;

export interface SeriesData {
  asOf: string;
  sample: boolean;
  source: AddonSource;
  note: string;
  builtWithAlpha: number;
  quarters: string[];
  appraised: { label: string; returns: number[] };
  traded: { label: string; returns: number[] };
}

export const SERIES = series as SeriesData;

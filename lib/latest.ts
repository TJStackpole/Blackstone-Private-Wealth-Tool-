import raw from "@/data/latest.json";
import type { FundCode } from "@/config/addons";
import type { LayerId, Source } from "./types";
import type { CompareCell } from "./compare";

/** One month-end figure, with how it moved since the last 10-Q where the filing allows a like-for-like comparison. */
export interface LatestItem {
  label: string;
  value: string;
  from: string;
  change?: string;
  direction?: "up" | "down" | "flat";
  note?: string;
  sources: Source[];
}

export interface LatestUpdate {
  /** The month-end the figures are as of. */
  asOf: string;
  filed: string;
  items: LatestItem[];
  notes: { text: string; sources: Source[] }[];
}

/**
 * Each fund's newest month-end figures, from the filings between 10-Qs (monthly 8-Ks, BREIT's NAV prospectus
 * supplement), built by scripts/sec/build_monthly.py. `compare` holds the side-by-side rows those filings make newer.
 */
export const LATEST = raw as {
  asOf: string;
  funds: Partial<Record<LayerId, LatestUpdate>>;
  compare: Record<string, { label?: string; help?: string; cells: Partial<Record<FundCode, CompareCell>> }>;
};

export function latestFor(id: LayerId): LatestUpdate | undefined {
  return LATEST.funds[id];
}

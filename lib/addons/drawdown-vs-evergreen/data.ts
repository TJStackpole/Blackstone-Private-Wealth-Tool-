import type { AddonSource } from "@/lib/addons/shared/types";
import raw from "@/data/addons/drawdown-vs-evergreen/compare.json";

export interface CompareRow {
  topic: string;
  drawdown: string;
  evergreen: string;
  sources: AddonSource[];
}

export const COMPARE = raw as {
  asOf: string;
  sample: boolean;
  source: AddonSource;
  evergreenExample: string;
  rows: CompareRow[];
  fits: { drawdown: string[]; evergreen: string[] };
};

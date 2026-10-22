import raw from "@/data/compare.json";
import type { Source } from "./types";
import type { FundCode } from "@/config/addons";

/** One fund's answer to one comparison question. A figure no filing gives has `missing` and where it would come from. */
export interface CompareCell {
  value: string | null;
  note?: string;
  sources?: Source[];
  missing?: string;
  where?: string;
}

export interface CompareRow {
  id: string;
  label: string;
  help?: string;
  cells: Record<FundCode, CompareCell>;
}

/** Built from the four funds' own filings by scripts/sec/build_data.py. */
export const COMPARE = raw as { asOf: string; funds: FundCode[]; rows: CompareRow[] };

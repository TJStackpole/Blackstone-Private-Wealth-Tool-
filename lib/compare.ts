import raw from "@/data/compare.json";
import type { Source } from "./types";
import type { FundCode } from "@/config/addons";
import { LATEST } from "./latest";

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

/**
 * The table as shown: the 10-Q rows, with the rows the monthly filings make newer (the distribution rate and the NAV
 * change) brought up to the latest month-end, cell by cell, each with its own source. Rows they don't cover stay as-is.
 */
export const COMPARE_ROWS: CompareRow[] = COMPARE.rows.map((r) => {
  const o = LATEST.compare[r.id];
  return o ? { ...r, label: o.label ?? r.label, help: o.help ?? r.help, cells: { ...r.cells, ...o.cells } } : r;
});

/** Rows whose cells come from the monthly filings. */
export const MONTHLY_ROWS = new Set(Object.keys(LATEST.compare));

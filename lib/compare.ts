import raw from "@/data/compare.json";
import type { Source } from "./types";
import type { FundCode } from "@/config/addons";
import { LATEST } from "./latest";
import type { FundData, LayerId } from "./types";
import breit from "@/data/breit.json";
import bxinfra from "@/data/bxinfra.json";
import bxpe from "@/data/bxpe.json";
import bcred from "@/data/bcred.json";
import { formatDate } from "./dates";

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

const FUND_DATA: Record<FundCode, FundData> = { BREIT: breit as FundData, BXINFRA: bxinfra as FundData, BXPE: bxpe as FundData, BCRED: bcred as FundData };
const LAYER: Record<FundCode, LayerId> = { BREIT: "breit", BXINFRA: "bxinfra", BXPE: "bxpe", BCRED: "bcred" };

/** Each fund's size from its 10-Q: the first stat card (net assets, or BREIT's NAV), with its note and sources. */
function sizeRow(): CompareRow {
  const cells = Object.fromEntries(
    COMPARE.funds.map((f) => {
      const s = FUND_DATA[f].summary.stats[0];
      return [f, { value: s.value, note: s.note, sources: s.sources }];
    }),
  ) as Record<FundCode, CompareCell>;
  return { id: "size", label: "Size", help: `Net assets at ${formatDate(COMPARE.asOf)}, from the 10-Q`, cells };
}

/**
 * Value per share or unit at the latest month-end, with its change since December 31 (the NAV-change row, folded in so
 * the table shows the price once).
 */
function valueRow(change: CompareRow): CompareRow {
  const cells = Object.fromEntries(
    COMPARE.funds.map((f) => {
      const c = change.cells[f];
      const nav = LATEST.funds[LAYER[f]]?.items.find((i) => /^NAV per/.test(i.label));
      if (!nav) return [f, c];
      return [f, { value: nav.value, note: `${c.value} since Dec 31, 2025 (${c.note})`, sources: [...(c.sources ?? []), ...nav.sources].filter((x, i, all) => all.findIndex((o) => o.url === x.url) === i) }];
    }),
  ) as Record<FundCode, CompareCell>;
  return { id: "value", label: "Value per share", help: `Class I, ${formatDate(LATEST.asOf)}, and the change since Dec 31, 2025`, cells };
}

/**
 * The table as shown: the 10-Q rows, with the rows the monthly filings make newer (the distribution rate and the NAV
 * change) brought up to the latest month-end, cell by cell, each with its own source. Rows they don't cover stay as-is.
 */
// (merged below, then ordered: size, value per share, the rest.)
const merged: CompareRow[] = COMPARE.rows.map((r) => {
  const o = LATEST.compare[r.id];
  return o ? { ...r, label: o.label ?? r.label, help: o.help ?? r.help, cells: { ...r.cells, ...o.cells } } : r;
});

/** Size and value per share first, then the 10-Q rows; the NAV change lives in the value row. */
export const COMPARE_ROWS: CompareRow[] = [sizeRow(), valueRow(merged.find((r) => r.id === "navChange")!), ...merged.filter((r) => r.id !== "navChange")];

/** Rows whose cells come from the monthly filings. */
export const MONTHLY_ROWS = new Set(Object.keys(LATEST.compare));

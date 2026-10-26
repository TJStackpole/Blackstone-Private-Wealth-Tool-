import type { FundData, QuarterMove, Source } from "./types";
import type { LatestUpdate } from "./latest";

/** "NAV per share (Class I)" and "NAV per share" are the same figure. */
const same = (a: string, b: string) => a.replace(/\s*\(.*\)$/, "").toLowerCase() === b.replace(/\s*\(.*\)$/, "").toLowerCase();

/**
 * The last 10-Q's figures, each once: the quarter box's moves, then any stat card it doesn't already show (BREIT's
 * property count, BCRED's portfolio companies, BXPE's "None" distribution). A stat card's note carries over to the
 * matching move. A figure the latest monthly filing gives newer (the distribution rate) is left to that box, so a
 * page never shows two rates for different dates.
 */
export function quarterFigures(data: FundData, latest?: LatestUpdate): FundData["quarterSummary"] {
  const q = data.quarterSummary;
  if (!q) return undefined;
  const stats = data.summary.stats;
  const items: QuarterMove[] = q.items.map((m) => {
    const s = stats.find((x) => same(x.label, m.label));
    return s?.note && !m.note ? { ...m, note: s.note } : m;
  });
  const extra = stats.filter(
    (s) => s.from && s.direction && !q.items.some((m) => same(m.label, s.label)) && !latest?.items.some((i) => same(i.label, s.label)),
  );
  for (const s of extra) items.push({ label: s.label, value: s.value, from: s.from!, change: s.change ?? "", direction: s.direction!, note: s.note });
  const moreSources = [...(q.moreSources ?? []), ...extra.flatMap((s) => s.sources ?? [])].filter(
    (s: Source, i, all) => s.url !== q.source.url && all.findIndex((o) => o.url === s.url) === i,
  );
  return { ...q, items, moreSources };
}

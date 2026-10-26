import raw from "@/data/talking-points.json";
import type { FundData, LayerId, Source } from "./types";
import { COMPARE_ROWS } from "./compare";
import { toFundCode } from "./addons/shared/funds";

export interface TalkingPoints {
  does: string;
  risk: string;
  changed: string;
}

const TP = raw as { note: string; funds: Partial<Record<LayerId, TalkingPoints>> };

export function talkingPoints(id: LayerId): TalkingPoints | undefined {
  return TP.funds[id];
}

/**
 * The filings the three sentences draw on: the 10-Q, then, for "what changed", the filings behind the NAV change
 * (the year-end and month-end NAVs) and the latest buyback round, the same ones the comparison table cites.
 */
export function talkingPointsSources(id: LayerId, data: FundData): Source[] {
  const code = toFundCode(id);
  const cells = code ? ["navChange", "prorated"].flatMap((row) => COMPARE_ROWS.find((r) => r.id === row)?.cells[code]?.sources ?? []) : [];
  return [data.source, ...cells].filter((s, i, all) => all.findIndex((o) => o.url === s.url) === i);
}

/** What the copy button puts on the clipboard: the three sentences, then their sources and the standing disclaimer. */
export function talkingPointsText(tp: TalkingPoints, data: FundData, sources: Source[] = [data.source]): string {
  return [
    tp.does,
    tp.risk,
    tp.changed,
    "",
    "Sources:",
    ...sources.map((s) => `${s.name}, ${s.url}`),
    "Independent summary of public SEC filings. Not investment advice. Not affiliated with Blackstone.",
  ].join("\n");
}

import raw from "@/data/talking-points.json";
import type { FundData, LayerId } from "./types";

export interface TalkingPoints {
  does: string;
  risk: string;
  changed: string;
}

const TP = raw as { note: string; funds: Partial<Record<LayerId, TalkingPoints>> };

export function talkingPoints(id: LayerId): TalkingPoints | undefined {
  return TP.funds[id];
}

/** What the copy button puts on the clipboard: the three sentences, then the source and the standing disclaimer. */
export function talkingPointsText(tp: TalkingPoints, data: FundData): string {
  return [
    tp.does,
    tp.risk,
    tp.changed,
    "",
    `Source: ${data.source.name}, ${data.filing.url}`,
    "Independent summary of public SEC filings. Not investment advice. Not affiliated with Blackstone.",
  ].join("\n");
}

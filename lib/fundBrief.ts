import type { FundCode } from "@/config/addons";
import type { FundData, LayerId, Source } from "./types";
import { COMPARE, COMPARE_ROWS } from "./compare";
import { LATEST } from "./latest";
import { talkingPoints, talkingPointsSources } from "./talkingPoints";
import { termsFor } from "./addons/liquidity/data";
import { toFundCode } from "./addons/shared/funds";

/** One of a fund's five plain answers: the question, one or more short sentences, their date and their filings. */
export interface BriefAnswer {
  id: "what" | "pays" | "out" | "changed" | "risk";
  question: string;
  lines: string[];
  asOf: string;
  sources: Source[];
}

const unique = (list: Source[]) => list.filter((s, i, all) => all.findIndex((o) => o.url === s.url) === i);
const cell = (row: string, code: FundCode) => COMPARE_ROWS.find((r) => r.id === row)?.cells[code];
const sentence = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`);
const upper = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The five questions a client asks first, each answered from figures the site already shows: the talking points, the
 * comparison table's cells and the buyback terms. Nothing is worked out here that a filing doesn't state.
 */
export function fundBrief(id: LayerId, data: FundData): BriefAnswer[] {
  const code = toFundCode(id);
  const tp = talkingPoints(id);
  if (!code) return [];
  const answers: BriefAnswer[] = [
    { id: "what", question: "What is it?", lines: [tp?.does ?? data.summary.headline], asOf: data.asOf, sources: [data.source] },
  ];

  const pay = cell("distribution", code);
  if (pay?.value) {
    const monthly = !!LATEST.compare.distribution?.cells[code];
    const lines =
      pay.value === "None"
        ? ["Nothing for now.", ...(pay.note ? [sentence(pay.note)] : [])]
        : [`${pay.value} a year at the latest payout rate.`, ...(pay.note ? [sentence(pay.note)] : [])];
    answers.push({ id: "pays", question: "What does it pay?", lines, asOf: monthly ? LATEST.asOf : COMPARE.asOf, sources: unique(pay.sources ?? []) });
  }

  const terms = termsFor(code);
  const limit = cell("limit", code);
  const early = cell("early", code);
  const round = cell("prorated", code);
  const roundLabel = COMPARE_ROWS.find((r) => r.id === "prorated")?.label ?? "";
  const quarter = roundLabel.match(/Q\d \d{4}/)?.[0];
  if (terms) {
    const lines = [sentence(terms.howOften)];
    if (limit?.value) lines.push(`Buyback limit: ${limit.value.replace(" · ", " and ")}${limit.note ? `, ${limit.note}` : ""}.`);
    // "if held less than 1 year: bought back at 98% of NAV" → "… if held less than 1 year (bought back at 98% of NAV)."
    if (early?.value) lines.push(`Early-sale deduction: ${early.value}${early.note ? ` ${early.note.replace(/: (.*)$/, " ($1)")}` : ""}.`);
    if (round?.note) lines.push(`${quarter ? `${quarter}: ` : ""}${sentence(round.note)}`);
    answers.push({
      id: "out",
      question: "How does my client get money out?",
      lines,
      asOf: terms.limits[0]?.asOf ?? data.asOf,
      sources: unique([...(limit?.sources ?? []), ...(early?.sources ?? []), ...(round?.sources ?? [])]),
    });
  }

  if (tp) {
    answers.push({ id: "changed", question: "What changed lately?", lines: [tp.changed], asOf: LATEST.funds[id]?.asOf ?? data.asOf, sources: talkingPointsSources(id, data) });
    answers.push({ id: "risk", question: "What's the main risk?", lines: [tp.risk], asOf: data.asOf, sources: unique([data.source, ...(round?.sources ?? [])]) });
  }
  return answers;
}

/** What "Copy these answers" puts on the clipboard: each question and answer, then every source and the disclaimer. */
export function briefText(fund: string, answers: BriefAnswer[]): string {
  const sources = unique(answers.flatMap((a) => a.sources));
  return [
    `${fund}: five answers for a client conversation`,
    "",
    ...answers.flatMap((a) => [upper(a.question), a.lines.join(" "), ""]),
    "Sources:",
    ...sources.map((s) => `${s.name}, ${s.url}`),
    "Independent summary of public SEC filings. Not investment advice. Not affiliated with Blackstone.",
  ].join("\n");
}

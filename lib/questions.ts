import type { FundCode } from "@/config/addons";
import type { LayerId, Source } from "./types";
import { LAYERS } from "@/data/layers";
import { COMPARE, COMPARE_ROWS } from "./compare";
import { LATEST } from "./latest";
import { fundBrief, type BriefAnswer } from "./fundBrief";
import { FUNDS, toLayerId } from "./addons/shared/funds";
import { glossText, type GlossaryTerm } from "./glossary";
import { TAX, TAX_FUNDS } from "./addons/tax-lens/data";
import { findAddon } from "@/config/addons";

/** One fund's answer to a question, with its date, its filings and where to read more. */
export interface AskAnswer {
  fund?: FundCode;
  lines: string[];
  asOf?: string;
  sources: Source[];
  href: string;
  hrefLabel: string;
}

export interface AskResult {
  /** Which kind of question it was taken to be; null when nothing matched. */
  topic: Topic | null;
  title: string;
  answers: AskAnswer[];
  term?: GlossaryTerm;
}

type Topic = "define" | "tax" | "out" | "fees" | "pays" | "risk" | "changed" | "value" | "size" | "minimum" | "retirement" | "returns" | "goals" | "compare" | "what";

const CODES: FundCode[] = ["BREIT", "BXINFRA", "BXPE", "BCRED"];

const FUND_WORDS: Record<FundCode, RegExp> = {
  BREIT: /\bbreit\b|real estate|propert/i,
  BXINFRA: /\bbx ?infra\b|\binfra(structure)?\b/i,
  BXPE: /\bbxpe\b|private equity/i,
  BCRED: /\bbcred\b|private credit|\bcredit\b|\bloans?\b|\blend/i,
};

/** Checked in this order, so "How are the payouts taxed?" is about tax, not payouts. */
const TOPICS: [Topic, RegExp][] = [
  ["tax", /\btax|1099|k-1|\birs\b/i],
  ["out", /money out|cash out|get (my|their|his|her|our|the)? ?(money|cash)|redeem|redemption|withdraw|\bsell|liquid|buy ?backs?|repurchas|tender|\bexit|locked|lock[- ]up|access/i],
  ["fees", /\bfees?\b|\bcosts?\b|expens|charge|incentive|carried interest/i],
  ["pays", /\bpay|yield|distribut|\bincome\b|dividend|payout/i],
  ["risk", /risk|danger|\bsafe|worr|downside|\blose\b|losses|go wrong/i],
  ["changed", /chang|\bnew\b|lately|recent|latest|update|news|happen/i],
  ["value", /\bnav\b|worth|\bvalue|price|perform|\breturns? (this|so far|since)|\bup or down\b/i],
  ["size", /\bbig\b|\bsize\b|\blarge\b|\baum\b|net assets|how much .*(manage|assets)/i],
  ["minimum", /minimum|least I can|smallest/i],
  ["retirement", /401|retire|\bira\b/i],
  ["goals", /\bgoals?\b|objective|promis|do what it says|deliver|on track/i],
  ["returns", /smooth|volatil|steady|stable|\bindex|stock market|s&p|\breturns?\b/i],
  ["compare", /compar|\bvs\.?\b|versus|differ|which (fund|one)|better|side by side/i],
  ["what", /what (is|does|are)|what's|explain|invest in|\bown\b|\bhold|about|describe|tell me/i],
];

const unique = (list: Source[]) => list.filter((s, i, all) => all.findIndex((o) => o.url === s.url) === i);
const layerOf = (code: FundCode) => LAYERS.find((l) => l.id === toLayerId(code))!;
const fundHref = (code: FundCode, details = false) => `/?view=${toLayerId(code)}${details ? "&details=1" : ""}`;

/** The glossary term a question names, preferring the longest phrase ("Transactional NAV" over "NAV"). */
function termIn(q: string): GlossaryTerm | undefined {
  // In capitals, so a typed "nav" or "niit" still finds NAV and NIIT.
  const hit = glossText(q.toUpperCase()).find((p) => typeof p !== "string");
  return hit && typeof hit !== "string" ? hit.term : undefined;
}

function brief(code: FundCode, id: BriefAnswer["id"]): BriefAnswer | undefined {
  const l = layerOf(code);
  return l.data ? fundBrief(l.id as LayerId, l.data).find((a) => a.id === id) : undefined;
}

function fromBrief(code: FundCode, id: BriefAnswer["id"], href: string, hrefLabel: string): AskAnswer | undefined {
  const a = brief(code, id);
  return a && { fund: code, lines: a.lines, asOf: a.asOf, sources: a.sources, href, hrefLabel };
}

function fromCells(code: FundCode, rows: { id: string; label: string }[], asOf: string): AskAnswer {
  const lines: string[] = [];
  let sources: Source[] = [];
  for (const r of rows) {
    const c = COMPARE_ROWS.find((x) => x.id === r.id)?.cells[code];
    if (!c) continue;
    if (c.value === null || c.value === undefined) {
      lines.push(`${r.label}: ${c.missing ?? "Not in filing"}.${c.where ? ` It would come from ${c.where}.` : ""}`);
      continue;
    }
    // "1.25% a year, of NAV"; a note that is its own sentence follows a full stop: "12.5%. Two parts: …".
    const note = !c.note ? c.value : c.note.startsWith(c.value) ? c.note : /^[A-Z]/.test(c.note) ? `${c.value}. ${c.note}` : `${c.value}, ${c.note}`;
    lines.push(`${r.label}: ${note.replace(/\.$/, "")}.`);
    sources = [...sources, ...(c.sources ?? [])];
  }
  return { fund: code, lines, asOf, sources: unique(sources), href: "/?view=all", hrefLabel: "Compare the funds" };
}

function taxAnswer(code: FundCode): AskAnswer {
  const href = `/toolkit/tax-lens?fund=${code}`;
  if (code === "BREIT") {
    const y = TAX.rocHistory[0];
    return {
      fund: code,
      lines: [
        "A REIT.",
        `In ${y.year}, ${y.roc}% of its payout was return of capital: not taxed when received, but it lowers cost basis, so more is taxed at sale.`,
      ],
      asOf: TAX.asOf,
      sources: unique([y.source, TAX.irs.roc]),
      href,
      hrefLabel: "Work it through in Taxes",
    };
  }
  const f = TAX_FUNDS.funds[code];
  return {
    fund: code,
    lines: [`${f.structure}: ${f.summary.charAt(0).toLowerCase()}${f.summary.slice(1)}.`, f.points[0].text],
    asOf: TAX_FUNDS.asOf,
    sources: unique([f.points[0].source]),
    href,
    hrefLabel: "Work it through in Taxes",
  };
}

/** Example questions the box offers, each one it answers. */
export const EXAMPLES = [
  "Can my client get money out of BCRED?",
  "What does BREIT pay?",
  "What changed at BXPE lately?",
  "What are the fees?",
  "How is BX Infra taxed?",
  "What does pro rata mean?",
];

/**
 * Answers a typed question from the site's own data, by matching words: which funds it names (all four when none), and
 * which of a dozen questions it is. Nothing is generated; every line is a figure or sentence the site already shows,
 * with its source. A question it can't match says so and offers examples.
 */
export function ask(question: string): AskResult {
  const q = question.trim();
  const named = CODES.filter((c) => FUND_WORDS[c].test(q));
  const funds = named.length ? named : CODES;
  const term = termIn(q);
  const wantsMeaning = /\bmeans?\b|meaning|define|definition/i.test(q) || (!named.length && !!term && /what('s| is| are| does)|explain/i.test(q));
  const topic: Topic | null = term && wantsMeaning ? "define" : (TOPICS.find(([, re]) => re.test(q))?.[0] ?? null);
  const each = (fn: (c: FundCode) => AskAnswer | undefined) => funds.map(fn).filter((a): a is AskAnswer => !!a);
  const scope = named.length === 1 ? FUNDS[named[0]].label : named.length ? named.map((c) => FUNDS[c].label).join(" and ") : "each fund";

  switch (topic) {
    case "define":
      return { topic, title: term!.term, answers: [], term };
    case "tax":
      return { topic, title: `How the payouts are taxed: ${scope}`, answers: each(taxAnswer) };
    case "out":
      return { topic, title: `Getting money out: ${scope}`, answers: each((c) => fromBrief(c, "out", `/toolkit/liquidity?fund=${c}`, "Try it in Getting money out")) };
    case "fees":
      return {
        topic,
        title: `Fees: ${scope}`,
        answers: each((c) => fromCells(c, [{ id: "management", label: "Management fee" }, { id: "performance", label: "Performance / incentive fee" }], COMPARE.asOf)),
      };
    case "pays":
      return { topic, title: `What it pays: ${scope}`, answers: each((c) => fromBrief(c, "pays", fundHref(c), `Open ${FUNDS[c].label}`)) };
    case "risk":
      return { topic, title: `The main risk: ${scope}`, answers: each((c) => fromBrief(c, "risk", fundHref(c), `Open ${FUNDS[c].label}`)) };
    case "changed":
      return { topic, title: `What changed lately: ${scope}`, answers: each((c) => fromBrief(c, "changed", fundHref(c, true), `See ${FUNDS[c].label}'s latest numbers`)) };
    case "value":
      return {
        topic,
        title: `Value per share or unit: ${scope}`,
        answers: each((c) => ({ ...fromCells(c, [{ id: "value", label: "Value per share" }], LATEST.asOf), href: fundHref(c, true), hrefLabel: `See ${FUNDS[c].label}'s latest numbers` })),
      };
    case "size":
      return { topic, title: `Size: ${scope}`, answers: each((c) => fromCells(c, [{ id: "size", label: "Net assets" }], COMPARE.asOf)) };
    case "minimum":
      return { topic, title: `Minimum investment: ${scope}`, answers: each((c) => fromCells(c, [{ id: "minimum", label: "Minimum investment" }], COMPARE.asOf)) };
    case "retirement":
    case "returns":
    case "goals": {
      const a = findAddon(topic === "retirement" ? "retirement-plus" : topic === "returns" ? "smoothing" : "reality-check")!;
      return { topic, title: a.question ?? a.name, answers: [{ lines: [a.description], sources: [], href: topic === "retirement" ? "/?view=retirement" : `/toolkit/${a.id}`, hrefLabel: `Open ${a.name}` }] };
    }
    case "compare":
      return { topic, title: "Compare the funds", answers: [{ lines: ["Pick two or more funds to see size, value per share, payouts, fees and buyback terms side by side, each with its source."], sources: [], href: "/?view=all", hrefLabel: "Open the comparison" }] };
    case "what":
      return { topic, title: `What it is: ${scope}`, answers: each((c) => fromBrief(c, "what", fundHref(c), `Open ${FUNDS[c].label}`)) };
    default:
      return { topic: null, title: "That question isn't one this box can answer yet", answers: [] };
  }
}


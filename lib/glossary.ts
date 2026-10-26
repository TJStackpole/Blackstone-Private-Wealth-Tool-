import raw from "@/data/glossary.json";
import type { FundCode } from "@/config/addons";
import type { Source } from "./types";

/** One piece of jargon: a plain line, the filing's own words, where they come from and when. */
export interface GlossaryTerm {
  id: string;
  term: string;
  plain: string;
  quote: string;
  source: Source;
  asOf: string;
  /** Set when the definition states one fund's own terms (BREIT's 2% monthly limit, say). */
  fund?: FundCode;
  /** Words on the site that open it; all-capitals ones ("NAV") match only in capitals. */
  match: string[];
}

export const GLOSSARY = (raw as { note: string; terms: GlossaryTerm[] }).terms;

export function glossaryTerm(id: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.id === id);
}

/** A run of text, or a phrase that opens a term's definition. */
export type Piece = string | { text: string; term: GlossaryTerm };

const phrases = GLOSSARY.flatMap((t) => t.match.map((m) => ({ m, t }))).sort((a, b) => b.m.length - a.m.length);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PATTERN = new RegExp(`(?<![A-Za-z])(${phrases.map((p) => escape(p.m)).join("|")})(?![A-Za-z])`, "gi");
const caps = (s: string) => s === s.toUpperCase();

/**
 * Splits text into plain runs and glossary phrases, linking each term once. In a fund's own context (`fund` given),
 * another fund's definition stays plain text; it also keeps "NAV" inside a skipped "Transactional NAV" plain.
 * `seen` carries across calls so a term is linked once per block.
 */
export function glossText(text: string, fund?: FundCode | null, seen: Set<string> = new Set()): Piece[] {
  const out: Piece[] = [];
  let last = 0;
  for (const hit of text.matchAll(PATTERN)) {
    const word = hit[0];
    const found = phrases.find((p) => p.m.toLowerCase() === word.toLowerCase() && (!caps(p.m) || p.m === word));
    if (!found) continue;
    const { t } = found;
    const other = !!fund && !!t.fund && t.fund !== fund;
    if (other || seen.has(t.id)) continue;
    seen.add(t.id);
    if (hit.index > last) out.push(text.slice(last, hit.index));
    out.push({ text: word, term: t });
    last = hit.index + word.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

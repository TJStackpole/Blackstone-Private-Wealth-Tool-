import { isAllowedUrl } from "../../../lib/chat/limits";
import { DISCLAIMER } from "./policy";

export interface Source {
  url: string;
  title: string;
}

// [text](https://...) markdown links, and bare https:// addresses.
const MD_LINK = /\[([^\]\n]{1,300})\]\((\S+?)\)/g;
const BARE_URL = /(?<![("\[<])\bhttps?:\/\/[^\s)\]>"']+/g;

/**
 * The last guard on what a visitor sees: any link outside the approved sites (or, on sec.gov, outside the four funds'
 * own filings) loses its address and keeps only its words; a bare address outside them is dropped. The educational
 * note is added if the answer left it out.
 */
export function cleanAnswer(text: string): string {
  let out = text.replace(MD_LINK, (all, label: string, url: string) => (isAllowedUrl(url) ? `[${label}](${url})` : label));
  out = out.replace(BARE_URL, (url) => {
    // Sentence punctuation after an address isn't part of it.
    const tail = url.match(/[.,;:!?]+$/)?.[0] ?? "";
    const bare = url.slice(0, url.length - tail.length);
    return (isAllowedUrl(bare) ? bare : "(link removed: not an official source)") + tail;
  });
  out = out.trim();
  if (!out.includes("not investment advice")) out = `${out}\n\n${DISCLAIMER}`;
  return out;
}

/** The answer's cited pages, approved ones only, each once, in the order cited. */
export function cleanSources(found: Source[]): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const s of found) {
    const url = s.url.trim();
    if (!isAllowedUrl(url) || seen.has(url)) continue;
    seen.add(url);
    out.push({ url, title: (s.title || new URL(url).hostname).slice(0, 160) });
  }
  return out.slice(0, 8);
}

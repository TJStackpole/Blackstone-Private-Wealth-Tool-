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

/** The approved links an answer makes, as sources: `[BREIT 10-Q](https://www.sec.gov/...)` gives that page and title. */
export function linksIn(text: string): Source[] {
  return [...text.matchAll(MD_LINK)].filter((m) => isAllowedUrl(m[2])).map((m) => ({ url: m[2], title: m[1] }));
}

/** The answer's cited pages, approved ones only, each once, in the order cited. */
export function cleanSources(found: Source[]): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const s of found) {
    const url = s.url.trim();
    if (!isAllowedUrl(url) || seen.has(url)) continue;
    seen.add(url);
    out.push({ url, title: readableTitle(s.title, url) });
  }
  return out.slice(0, 8);
}

/**
 * A source's name as shown. Search results sometimes carry a page's raw title, such as "Sec" or a shouted legal
 * notice; those are replaced by a plain name from the address ("SEC filing", "Offering terms").
 */
function readableTitle(title: string, url: string): string {
  const t = (title || "").replace(/\s+/g, " ").trim();
  const letters = t.replace(/[^A-Za-z]/g, "");
  const shouted = letters.length >= 8 && letters.replace(/[^A-Z]/g, "").length / letters.length > 0.8;
  if (t.length >= 5 && !shouted) return t.slice(0, 160);
  const u = new URL(url);
  if (u.hostname.endsWith("sec.gov")) return "SEC filing";
  const last = u.pathname.split("/").filter(Boolean).pop();
  if (!last) return "Home page";
  const words = decodeURIComponent(last).replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim();
  return words ? words[0].toUpperCase() + words.slice(1) : "Home page";
}

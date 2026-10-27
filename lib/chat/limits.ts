/**
 * Limits shared by the chat panel and the server function (netlify/functions/chat), so the panel stops a question
 * before the server would refuse it. The server enforces every one of them again; these are not the security.
 */

/** Longest question a visitor can send. */
export const MAX_QUESTION_CHARS = 1000;

/** Questions per visitor (by IP address) in any rolling hour. */
export const QUESTIONS_PER_HOUR = 20;

/** Earlier messages sent back with each question so follow-ups make sense (questions and answers together). */
export const MAX_HISTORY_MESSAGES = 10;

/** Longest earlier answer the server accepts back in the history. */
export const MAX_ANSWER_CHARS = 6000;

/** Where the panel sends questions. */
export const CHAT_ENDPOINT = "/api/chat";

/**
 * The only sites the assistant may search, read or link to: Blackstone's own sites and SEC EDGAR. Subdomains count
 * (www.breit.com is breit.com).
 */
export const ALLOWED_DOMAINS = ["blackstone.com", "breit.com", "bcred.com", "bxpe.com", "bxinfra.com", "sec.gov"] as const;

/**
 * The four funds' SEC registrant numbers (CIKs). On sec.gov the assistant may use only filings filed under these.
 * BREIT 1662972, BCRED 1803498, BXPE 1930054, BX Infra 2030772 (each from the fund's own filings).
 */
export const FUND_CIKS = ["1662972", "1803498", "1930054", "2030772"] as const;

/**
 * One event in the server's answer stream: progress, answer text as it arrives (and `reset` when text so far was only
 * a lead-in to a search), the finished answer, or an error.
 */
export type ChatEvent =
  | { t: "status"; text: string }
  | { t: "delta"; text: string }
  | { t: "reset" }
  | { t: "done"; text: string; sources: { url: string; title: string }[] }
  | { t: "error"; message: string };

/** An earlier turn, as the panel keeps it and sends it back. */
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Whether a link may be shown: https on an allowed site, and on sec.gov only the four funds' own EDGAR folders or
 * their EDGAR company pages.
 */
export function isAllowedUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" || u.username || u.password) return false;
  const host = u.hostname.toLowerCase().replace(/\.$/, "");
  const domain = ALLOWED_DOMAINS.find((d) => host === d || host.endsWith(`.${d}`));
  if (!domain) return false;
  if (domain !== "sec.gov") return true;
  const path = u.pathname.replace(/\/+/g, "/");
  const fund = (cik: string | undefined) => !!cik && (FUND_CIKS as readonly string[]).includes(cik.replace(/^0+/, ""));
  // A filing: /Archives/edgar/data/1803498/... (EDGAR also writes the number zero-padded, 0001803498).
  const filing = (p: string) => fund(p.match(/^\/Archives\/edgar\/data\/(\d+)(?:\/|$)/)?.[1]);
  if (filing(path)) return true;
  // The same filing in SEC's viewer: /ix?doc=/Archives/edgar/data/1803498/...
  if (path === "/ix") return filing((u.searchParams.get("doc") ?? "").replace(/\/+/g, "/"));
  // EDGAR company pages: /cgi-bin/browse-edgar?action=getcompany&CIK=1662972, /edgar/browse/?CIK=1662972.
  return (path === "/cgi-bin/browse-edgar" || path.startsWith("/edgar/browse")) && fund(u.searchParams.get("CIK") ?? u.searchParams.get("cik") ?? undefined);
}

import { QUESTIONS_PER_HOUR } from "../../../lib/chat/limits";

const HOUR_MS = 60 * 60 * 1000;

/** The part of a Netlify Blobs store the limiter uses (an interface, so tests can pass an in-memory one). */
export interface LimitStore {
  list(options: { prefix: string }): Promise<{ blobs: { key: string }[] }>;
  set(key: string, value: string): Promise<unknown>;
  delete(key: string): Promise<unknown>;
}

export type Verdict = { allowed: true; stale: string[] } | { allowed: false; retryAfterSeconds: number; stale: string[] };

/** A visitor's key: a one-way hash of their IP address, so no address is ever stored. */
export async function visitorKey(ip: string, salt: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

/**
 * At most `limit` questions per visitor in any rolling hour. Each question writes its own entry
 * (`<visitor>/<time>-<random>`) rather than updating a shared counter, so two questions at once can't overwrite
 * each other's count; the visitor's entries from the last hour are counted by listing them. Entries older than an
 * hour come back in `stale` for the caller to delete after answering.
 */
export async function checkAndRecord(store: LimitStore, visitor: string, now = Date.now(), limit = QUESTIONS_PER_HOUR): Promise<Verdict> {
  const { blobs } = await store.list({ prefix: `${visitor}/` });
  const times = blobs.map((b) => ({ key: b.key, at: Number(b.key.slice(visitor.length + 1).split("-")[0]) }));
  const stale = times.filter((t) => !(now - t.at < HOUR_MS)).map((t) => t.key);
  const recent = times.filter((t) => now - t.at < HOUR_MS).map((t) => t.at).sort((a, b) => a - b);
  if (recent.length >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((recent[recent.length - limit] + HOUR_MS - now) / 1000));
    return { allowed: false, retryAfterSeconds, stale };
  }
  await store.set(`${visitor}/${now}-${Math.random().toString(36).slice(2, 10)}`, "1");
  return { allowed: true, stale };
}

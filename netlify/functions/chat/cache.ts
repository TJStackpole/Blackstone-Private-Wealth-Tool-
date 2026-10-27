import type { Source } from "./sanitize";

/** How long a saved answer is reused. Monthly figures change at most once a day, so half a day keeps them current. */
export const SAVE_HOURS = 12;

/** The part of a Netlify Blobs store the saved answers use (an interface, so tests can pass an in-memory one). */
export interface AnswerStore {
  get(key: string, options: { type: "json" }): Promise<unknown>;
  setJSON(key: string, data: unknown): Promise<unknown>;
}

export interface SavedAnswer {
  text: string;
  sources: Source[];
  /** When the answer was written (ms since 1970). */
  at: number;
}

/**
 * The same question asked again, ignoring case, spacing, curly quotes and end punctuation: "What does BREIT pay?" and
 * "what does breit pay" match.
 */
export function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\s?.!]+$/, "");
}

/**
 * A saved answer's key: a hash of the question and of the assistant's settings (`version`), so changing the model,
 * the instructions or the tools starts afresh instead of reusing answers written under the old ones.
 */
export async function answerKey(question: string, version: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${version}\n${normalizeQuestion(question)}`));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
}

/** A saved answer still within SAVE_HOURS, or null (also null if the store can't be read). */
export async function readSaved(store: AnswerStore, key: string, now = Date.now()): Promise<SavedAnswer | null> {
  try {
    const v = (await store.get(key, { type: "json" })) as SavedAnswer | null;
    if (!v || typeof v.text !== "string" || !Array.isArray(v.sources) || typeof v.at !== "number") return null;
    return now - v.at < SAVE_HOURS * 60 * 60 * 1000 ? v : null;
  } catch {
    return null;
  }
}

export async function saveAnswer(store: AnswerStore, key: string, answer: Omit<SavedAnswer, "at">, now = Date.now()): Promise<void> {
  await store.setJSON(key, { ...answer, at: now });
}

import { MAX_ANSWER_CHARS, MAX_HISTORY_MESSAGES, MAX_QUESTION_CHARS, type ChatTurn } from "../../../lib/chat/limits";

/** Largest request body accepted, before it is parsed. */
export const MAX_BODY_BYTES = 64_000;

export type Checked = { ok: true; turns: ChatTurn[] } | { ok: false; status: number; message: string };

// Control characters other than tab and newline have no place in a question.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Checks a request body: `{ messages: [{ role, content }, ...] }`, questions and answers taking turns, starting and
 * ending with a question, at most MAX_HISTORY_MESSAGES earlier messages plus the new question, every question at most
 * MAX_QUESTION_CHARS characters and every earlier answer at most MAX_ANSWER_CHARS.
 */
export function checkRequest(body: unknown): Checked {
  const bad = (message: string, status = 400): Checked => ({ ok: false, status, message });
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) return bad("Send your question as { messages: [...] }.");
  const raw = (body as { messages: unknown[] }).messages;
  if (raw.length === 0) return bad("Ask a question first.");
  if (raw.length > MAX_HISTORY_MESSAGES + 1) return bad("This conversation is too long. Start a new chat.");
  const turns: ChatTurn[] = [];
  for (const [i, m] of raw.entries()) {
    if (!m || typeof m !== "object") return bad("Each message needs a role and some text.");
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return bad("Each message needs a role and some text.");
    if (role !== (i % 2 === 0 ? "user" : "assistant")) return bad("Questions and answers must take turns, starting with a question.");
    const text = content.replace(CONTROL, "").trim();
    if (role === "user") {
      if (!text) return bad("Your question is empty.");
      if (text.length > MAX_QUESTION_CHARS) return bad(`Questions can be up to ${MAX_QUESTION_CHARS.toLocaleString("en-US")} characters.`, 413);
    } else if (text.length > MAX_ANSWER_CHARS) {
      return bad("An earlier answer in this chat is too long to send back. Start a new chat.");
    }
    turns.push({ role, content: text || "(no answer)" });
  }
  if (turns[turns.length - 1].role !== "user") return bad("The last message must be your question.");
  return { ok: true, turns };
}

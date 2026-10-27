"use client";

import { useSyncExternalStore } from "react";
import { CHAT_ENDPOINT, MAX_ANSWER_CHARS, MAX_HISTORY_MESSAGES, MAX_QUESTION_CHARS, type ChatEvent, type ChatTurn } from "@/lib/chat/limits";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { url: string; title: string }[];
  /** On a saved answer to the same question: when it was written (ms since 1970). */
  savedAt?: number;
  /** On a question whose answer failed: what went wrong. */
  error?: string;
}

export interface Pending {
  status: string;
  text: string;
}

interface ChatState {
  messages: Message[];
  pending: Pending | null;
  /** Whether the chat built into the opening page is on screen (the corner button steps aside while it is). */
  inlineInView: boolean;
}

const STORAGE_KEY = "pma-chat-v1";
const EMPTY: ChatState = { messages: [], pending: null, inlineInView: false };

/**
 * One conversation for the whole tab, shared by the corner panel and the chat on the opening page: a question asked
 * in one shows in the other. Kept in sessionStorage, so it lasts across page changes and reloads and goes when the
 * tab closes.
 */
let state: ChatState | null = null;
let controller: AbortController | null = null;
const listeners = new Set<() => void>();

function current(): ChatState {
  state ??= { ...EMPTY, messages: loadSaved() };
  return state;
}

function update(patch: Partial<ChatState>) {
  const before = current();
  state = { ...before, ...patch };
  if (patch.messages && patch.messages !== before.messages) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(patch.messages));
    } catch {
      // Storage full or blocked: the chat still works for this page.
    }
  }
  for (const l of listeners) l();
}

function loadSaved(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") : [];
  } catch {
    // Storage blocked or unreadable: start fresh.
    return [];
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/** The earlier answered questions to send back with a new one, oldest first, ending before the new question. */
export function historyFor(messages: Message[]): ChatTurn[] {
  const pairs: ChatTurn[][] = [];
  for (let i = 0; i < messages.length - 1; i++) {
    const q = messages[i];
    const a = messages[i + 1];
    if (q.role === "user" && !q.error && a.role === "assistant") pairs.push([{ role: "user", content: q.content }, { role: "assistant", content: a.content.slice(0, MAX_ANSWER_CHARS) }]);
  }
  return pairs.slice(-Math.floor(MAX_HISTORY_MESSAGES / 2)).flat();
}

/**
 * Sends a question to /api/chat and streams the answer in. `base` is the conversation it follows (by default the
 * current one; "Try again" passes it without the failed question).
 */
export async function ask(question: string, base: Message[] = current().messages) {
  const q = question.trim();
  if (!q || current().pending || q.length > MAX_QUESTION_CHARS) return;
  const userMsg: Message = { id: newId(), role: "user", content: q };
  const next = [...base, userMsg];
  const mine = new AbortController();
  controller = mine;
  update({ messages: next, pending: { status: "Searching Blackstone's sites and the funds' filings…", text: "" } });
  const setPending = (f: (p: Pending) => Pending) => {
    const p = current().pending;
    if (controller === mine && p) update({ pending: f(p) });
  };
  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [...historyFor(base), { role: "user", content: q }] }),
      signal: mine.signal,
    });
    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => null);
      throw new Error(
        (data && typeof data.error === "string" && data.error) ||
          (res.status === 429 ? "You're asking quickly. Wait a minute and try again." : "The assistant couldn't answer just now. Try again in a moment."),
      );
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finished: Message | null = null;
    for (;;) {
      const { value, done } = await reader.read();
      if (value) buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = done ? "" : (lines.pop() ?? "");
      for (const line of lines) {
        if (!line.trim()) continue;
        let e: ChatEvent;
        try {
          e = JSON.parse(line);
        } catch {
          continue;
        }
        if (e.t === "status") setPending((p) => ({ ...p, status: e.text }));
        else if (e.t === "delta") setPending((p) => ({ status: "Writing the answer…", text: p.text + e.text }));
        else if (e.t === "reset") setPending((p) => ({ ...p, text: "" }));
        else if (e.t === "error") throw new Error(e.message);
        else if (e.t === "done") finished = { id: newId(), role: "assistant", content: e.text, sources: e.sources, ...(e.savedAt ? { savedAt: e.savedAt } : {}) };
      }
      if (done) break;
    }
    if (!finished) throw new Error("The answer was interrupted. Try again.");
    if (controller === mine) update({ messages: [...next, finished], pending: null });
  } catch (err) {
    if (mine.signal.aborted || controller !== mine) return;
    const message = err instanceof Error && err.message && err.name !== "TypeError" ? err.message : "Couldn't reach the assistant. Check your connection and try again.";
    update({ messages: [...base, { ...userMsg, error: message }], pending: null });
  } finally {
    if (controller === mine) controller = null;
  }
}

/** The follow-up the "Explain it more simply" button sends. */
export const SIMPLER = "Explain that more simply, in everyday words.";

/** Clears the conversation, stopping an answer that is still coming. */
export function newChat() {
  controller?.abort();
  controller = null;
  update({ messages: [], pending: null });
}

/** Forgets the conversation held in memory, so the next read loads the saved one again (used by tests). */
export function resetChat() {
  controller?.abort();
  controller = null;
  state = null;
  for (const l of listeners) l();
}

export function setInlineInView(inView: boolean) {
  if (current().inlineInView !== inView) update({ inlineInView: inView });
}

/** The shared conversation. The server renders it empty; the saved one appears once the page is running. */
export function useChat(): ChatState {
  return useSyncExternalStore(subscribe, current, () => EMPTY);
}

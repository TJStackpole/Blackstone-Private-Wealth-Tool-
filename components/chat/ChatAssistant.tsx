"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CHAT_ENDPOINT, MAX_ANSWER_CHARS, MAX_HISTORY_MESSAGES, MAX_QUESTION_CHARS, type ChatEvent, type ChatTurn } from "@/lib/chat/limits";
import Markdown from "./Markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { url: string; title: string }[];
  /** On a question whose answer failed: what went wrong. */
  error?: string;
}

const STORAGE_KEY = "pma-chat-v1";
const EXAMPLES = [
  "How do BREIT's share buybacks work?",
  "What does BCRED invest in?",
  "How often does BXPE report its NAV?",
  "What fees does BX Infra charge?",
];

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

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * The AI assistant: a button in the bottom-right corner that opens a chat panel (full screen on phones). Questions
 * go to /api/chat, which answers only from Blackstone's official sites and the funds' 10-Q and 10-K filings. The
 * conversation lasts for the browser tab's session.
 */
export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  // The conversation lasts for this tab's session: kept across page changes and reloads, gone when the tab closes.
  // Read on first render; the server renders the panel closed, so nothing it draws depends on this.
  const [messages, setMessages] = useState<Message[]>(loadSaved);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<{ status: string; text: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const titleId = useId();

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage full or blocked: the chat still works for this page.
    }
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Keep the newest message in view.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending, open]);

  useEffect(() => {
    if (open) box.current?.focus();
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcher.current?.focus());
  }, []);

  async function ask(question: string, base: Message[]) {
    const q = question.trim();
    if (!q || pending || q.length > MAX_QUESTION_CHARS) return;
    const userMsg: Message = { id: newId(), role: "user", content: q };
    const next = [...base, userMsg];
    setMessages(next);
    setInput("");
    setPending({ status: "Searching Blackstone's sites and the funds' filings…", text: "" });
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [...historyFor(base), { role: "user", content: q }] }),
        signal: controller.signal,
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
          if (e.t === "status") setPending((p) => p && { ...p, status: e.text });
          else if (e.t === "delta") setPending((p) => p && { status: "Writing the answer…", text: p.text + e.text });
          else if (e.t === "reset") setPending((p) => p && { ...p, text: "" });
          else if (e.t === "error") throw new Error(e.message);
          else if (e.t === "done") finished = { id: newId(), role: "assistant", content: e.text, sources: e.sources };
        }
        if (done) break;
      }
      if (!finished) throw new Error("The answer was interrupted. Try again.");
      setMessages([...next, finished]);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error && err.message && err.name !== "TypeError" ? err.message : "Couldn't reach the assistant. Check your connection and try again.";
      setMessages([...base, { ...userMsg, error: message }]);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setPending(null);
      }
    }
  }

  function newChat() {
    abortRef.current?.abort();
    abortRef.current = null;
    setPending(null);
    setMessages([]);
    setInput("");
    box.current?.focus();
  }

  const over = input.length > MAX_QUESTION_CHARS;
  const canSend = !!input.trim() && !over && !pending;

  return (
    <div className="no-print" data-hide-framed>
      {!open && (
        <button
          ref={launcher}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="tap fixed bottom-20 right-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accent-contrast shadow-[0_8px_24px_rgba(0,0,0,0.18)] ring-4 ring-accent/15 transition-opacity hover:opacity-90 sm:right-6 lg:bottom-6"
          data-chat-launcher
        >
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
            <path d="M8.5 10.5h7M8.5 13.5h4.5" />
          </svg>
          Ask AI
        </button>
      )}

      {open && (
        <section
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
          className="fixed inset-0 z-50 flex flex-col bg-bg-raised sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(680px,calc(100dvh-48px))] sm:w-[420px] sm:rounded-card sm:border sm:border-line sm:shadow-[0_16px_48px_rgba(0,0,0,0.18)]"
          data-chat-panel
        >
          <header className="flex items-start justify-between gap-3 border-b border-line px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] sm:pt-3">
            <div className="min-w-0">
              <h2 id={titleId} className="font-serif text-lg font-medium leading-tight text-ink">
                Ask about the funds
              </h2>
              <p className="mt-0.5 text-xs leading-snug text-muted">
                AI answers from Blackstone&rsquo;s official sites and the funds&rsquo; 10-Q and 10-K filings, with links.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {messages.length > 0 && (
                <button type="button" onClick={newChat} className="tap-sm h-8 rounded-full px-2.5 text-xs font-medium text-muted-strong hover:text-ink">
                  New chat
                </button>
              )}
              <button type="button" onClick={close} aria-label="Close the assistant" className="tap inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-strong hover:bg-bg hover:text-ink">
                <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </header>

          <div ref={scroller} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite" aria-busy={!!pending}>
            {messages.length === 0 && !pending && (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-muted-strong">
                  Ask about BREIT, BCRED, BXPE or BX Infra: how they work, their fees, buybacks, holdings or latest reports. Each answer links to its
                  source.
                </p>
                <div className="flex flex-col items-start gap-2" role="group" aria-label="Example questions">
                  {EXAMPLES.map((q) => (
                    <button key={q} type="button" onClick={() => ask(q, messages)} className="tap inline-flex min-h-9 items-center rounded-full border border-line bg-bg px-3 py-1.5 text-left text-sm text-ink hover:border-muted">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex flex-col items-end gap-1">
                  <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-sm leading-relaxed text-accent-contrast">{m.content}</p>
                  {m.error && (
                    <div className="flex max-w-[85%] flex-wrap items-center justify-end gap-2 text-xs" role="alert">
                      <span className="text-sample">{m.error}</span>
                      <button
                        type="button"
                        disabled={!!pending}
                        onClick={() => ask(m.content, messages.filter((x) => x.id !== m.id))}
                        className="tap-sm font-medium text-ink underline decoration-line underline-offset-2 hover:decoration-ink disabled:opacity-50"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <article key={m.id} className="rounded-card border border-line bg-bg p-3.5 text-sm leading-relaxed text-ink" data-chat-answer>
                  <Markdown text={m.content} />
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-3 border-t border-line pt-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Sources</p>
                      <ul className="mt-1 space-y-1">
                        {m.sources.map((s) => (
                          <li key={s.url} className="text-xs leading-snug">
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-muted-strong underline decoration-line underline-offset-2 hover:text-ink">
                              {s.title}
                            </a>
                            <span className="text-muted"> · {new URL(s.url).hostname.replace(/^www\./, "")}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ),
            )}

            {pending && (
              <div className="rounded-card border border-dashed border-line bg-bg p-3.5 text-sm" data-chat-pending>
                <p className="flex items-center gap-2 text-xs text-muted-strong">
                  <span aria-hidden className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent motion-reduce:animate-none" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </span>
                  {pending.status}
                </p>
                {pending.text && <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink">{pending.text}</p>}
              </div>
            )}
          </div>

          <form
            className="border-t border-line px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (canSend) ask(input, messages);
            }}
          >
            <div className="flex items-end gap-2">
              <label htmlFor={`${panelId}-q`} className="sr-only">
                Your question
              </label>
              <textarea
                ref={box}
                id={`${panelId}-q`}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    if (canSend) ask(input, messages);
                  }
                }}
                placeholder="Ask about BREIT, BCRED, BXPE or BX Infra…"
                aria-describedby={`${panelId}-count`}
                className="max-h-40 min-h-11 flex-1 resize-none rounded-card border border-line bg-bg px-3 py-2.5 text-[15px] leading-snug text-ink placeholder:text-muted focus-visible:border-accent sm:text-sm"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="tap inline-flex h-11 shrink-0 items-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-contrast hover:opacity-90 disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <div className="mt-1.5 flex items-start justify-between gap-3 px-1 text-[11px] leading-snug text-muted">
              <span>AI can make mistakes; check the linked source. Educational only, not investment advice.</span>
              <span id={`${panelId}-count`} className={["tnum shrink-0", over ? "font-semibold text-sample" : ""].join(" ")}>
                {input.length.toLocaleString("en-US")}/{MAX_QUESTION_CHARS.toLocaleString("en-US")}
              </span>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

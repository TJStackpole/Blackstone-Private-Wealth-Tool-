"use client";

import { useEffect, useRef, type ReactNode, type Ref } from "react";
import { MAX_QUESTION_CHARS } from "@/lib/chat/limits";
import Markdown from "./Markdown";
import { SIMPLER, ask, type Message, type Pending } from "./useChat";

/**
 * The conversation: questions, answers with their sources, and the answer still coming. Used by the corner panel
 * and by the chat on the opening page. `className` sizes the scrolling box; `empty` shows before the first question.
 */
export function ChatThread({ messages, pending, className, empty }: { messages: Message[]; pending: Pending | null; className: string; empty?: ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];

  // While an answer is coming, keep it in view; once it's in, scroll back to the question so it reads from the top.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (pending || last?.role !== "assistant") el.scrollTop = el.scrollHeight;
    else {
      const asked = el.querySelectorAll<HTMLElement>("[data-chat-question]");
      const q = asked[asked.length - 1];
      el.scrollTop = q ? q.offsetTop - 8 : el.scrollHeight;
    }
  }, [last, pending]);

  return (
    <div ref={scroller} className={["relative space-y-4 overflow-y-auto", className].join(" ")} aria-live="polite" aria-busy={!!pending}>
      {messages.length === 0 && !pending && empty}

      {messages.map((m, i) =>
        m.role === "user" ? (
          <div key={m.id} className="flex flex-col items-end gap-1" data-chat-question>
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
          <Answer key={m.id} m={m} offerSimpler={i === messages.length - 1 && !pending && !!m.sources?.length && messages[i - 1]?.content !== SIMPLER} />
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
  );
}

/**
 * One answer: its text, its sources, and under the newest sourced one an offer to explain it more simply (not under
 * an answer that already is the simpler version, or a decline). A saved answer says when it was written.
 */
function Answer({ m, offerSimpler }: { m: Message; offerSimpler: boolean }) {
  return (
    <article className="rounded-card border border-line bg-bg p-3.5 text-sm leading-relaxed text-ink" data-chat-answer>
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
      {(m.savedAt || offerSimpler) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line pt-2 text-xs">
          {m.savedAt ? <span className="text-muted">Saved answer from {ago(m.savedAt)}, so it loaded at once.</span> : <span />}
          {offerSimpler && (
            <button type="button" onClick={() => ask(SIMPLER)} className="tap-sm font-medium text-ink underline decoration-line underline-offset-2 hover:decoration-ink">
              Explain it more simply
            </button>
          )}
        </div>
      )}
    </article>
  );
}

/** "12 minutes ago", "3 hours ago". */
function ago(at: number): string {
  const minutes = Math.max(1, Math.round((Date.now() - at) / 60000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

/** The question box: Enter sends, Shift+Enter starts a new line, and the counter shows the 1,000-character limit. */
export function ChatComposer({
  id,
  value,
  onChange,
  onSend,
  busy,
  boxRef,
  className,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  boxRef?: Ref<HTMLTextAreaElement>;
  className?: string;
}) {
  const over = value.length > MAX_QUESTION_CHARS;
  const canSend = !!value.trim() && !over && !busy;
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSend();
      }}
    >
      <div className="flex items-end gap-2">
        <label htmlFor={`${id}-q`} className="sr-only">
          Your question
        </label>
        <textarea
          ref={boxRef}
          id={`${id}-q`}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          placeholder="Ask about BREIT, BCRED, BXPE or BX Infra…"
          aria-describedby={`${id}-count`}
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
        <span id={`${id}-count`} className={["tnum shrink-0", over ? "font-semibold text-sample" : ""].join(" ")}>
          {value.length.toLocaleString("en-US")}/{MAX_QUESTION_CHARS.toLocaleString("en-US")}
        </span>
      </div>
    </form>
  );
}

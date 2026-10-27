"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChatComposer, ChatThread } from "./ChatThread";
import { ask, newChat, setInlineInView, useChat } from "./useChat";

/** The opening page's ready-made questions. */
const EXAMPLES = [
  "Can my client get money out of BCRED?",
  "What does BREIT pay?",
  "What changed at BXPE lately?",
  "What fees does BX Infra charge?",
  "How is BX Infra taxed?",
  "What does pro rata mean?",
];

const chip =
  "tap inline-flex min-h-8 items-center rounded-full border border-line bg-bg px-3 py-1 text-left text-xs font-medium text-muted-strong hover:border-muted hover:text-ink disabled:opacity-50";

/**
 * The AI assistant built into the bottom of the opening page: the same conversation as the corner panel, with the
 * ready-made questions underneath. While it's on screen the corner button steps aside.
 */
export default function InlineChat() {
  const { messages, pending } = useChat();
  const [input, setInput] = useState("");
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  const started = messages.length > 0 || !!pending;

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Any part on screen counts, so the corner button never sits over the chat.
    const io = new IntersectionObserver(([e]) => setInlineInView(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => {
      io.disconnect();
      setInlineInView(false);
    };
  }, []);

  // Asking, and the answer arriving, grow the conversation above the question box, which can push the question off
  // screen (on a phone, tapping a question at the bottom); bring it back into view. Only then, not when a saved
  // conversation appears on load.
  const busy = !!pending;
  const wasBusy = useRef(busy);
  useEffect(() => {
    if (wasBusy.current === busy) return;
    wasBusy.current = busy;
    const asked = root.current?.querySelectorAll<HTMLElement>("[data-chat-question]");
    const q = asked?.[asked.length - 1];
    if (!q) return;
    const top = q.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) {
      const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      q.scrollIntoView({ block: "start", behavior: still ? "auto" : "smooth" });
    }
  }, [busy]);

  function send(question: string) {
    setInput("");
    ask(question);
  }

  return (
    <section ref={root} aria-labelledby={`${id}-h`} className="rounded-card border border-line bg-bg-raised p-4 sm:p-6" data-inline-chat>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`${id}-h`} className="font-serif text-[22px] font-medium leading-tight text-ink">
            Ask AI
          </h3>
          <p className="mt-1 text-sm text-muted-strong">
            Answers come only from Blackstone&rsquo;s official sites and the funds&rsquo; own SEC filings, each with links to its sources.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              newChat();
              setInput("");
              box.current?.focus();
            }}
            className="tap-sm h-8 shrink-0 rounded-full px-2.5 text-xs font-medium text-muted-strong hover:text-ink"
          >
            New chat
          </button>
        )}
      </div>

      {started && <ChatThread messages={messages} pending={pending} className="mt-4 max-h-[min(560px,65dvh)] rounded-card border border-line bg-bg-raised p-3 sm:p-4" />}

      <ChatComposer id={id} value={input} onChange={setInput} onSend={() => send(input)} busy={!!pending} boxRef={box} className="mt-4" />

      <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Example questions" role="group">
        <span className="text-xs text-muted">{started ? "More to ask:" : "Try:"}</span>
        {EXAMPLES.map((q) => (
          <button key={q} type="button" className={chip} disabled={!!pending} onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>
    </section>
  );
}

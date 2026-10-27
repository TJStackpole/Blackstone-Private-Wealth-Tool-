"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChatComposer, ChatThread } from "./ChatThread";
import { ask, newChat, useChat } from "./useChat";

const EXAMPLES = [
  "How do BREIT's share buybacks work?",
  "What does BCRED invest in?",
  "How often does BXPE report its NAV?",
  "What fees does BX Infra charge?",
];

/**
 * The AI assistant: a button in the bottom-right corner that opens a chat panel (full screen on phones). Questions
 * go to /api/chat, which answers only from Blackstone's official sites and the funds' own SEC filings. The
 * conversation is the same one the opening page's chat shows, and lasts for the browser tab's session.
 */
export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const { messages, pending, inlineInView } = useChat();
  const [input, setInput] = useState("");
  const launcher = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  const panelId = useId();
  const titleId = useId();

  useEffect(() => {
    if (open) box.current?.focus();
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcher.current?.focus());
  }, []);

  function send(question: string) {
    setInput("");
    ask(question);
  }

  return (
    <div className="no-print" data-hide-framed>
      {/* The opening page has the chat built in; the corner button steps aside while that one is on screen. */}
      {!open && !inlineInView && (
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
                AI answers from Blackstone&rsquo;s official sites and the funds&rsquo; own SEC filings, with links.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    newChat();
                    setInput("");
                    box.current?.focus();
                  }}
                  className="tap-sm h-8 rounded-full px-2.5 text-xs font-medium text-muted-strong hover:text-ink"
                >
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

          <ChatThread
            messages={messages}
            pending={pending}
            className="min-h-0 flex-1 px-4 py-4"
            empty={
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-muted-strong">
                  Ask about BREIT, BCRED, BXPE or BX Infra: how they work, their fees, buybacks, holdings or latest reports. Each answer links to its
                  source.
                </p>
                <div className="flex flex-col items-start gap-2" role="group" aria-label="Example questions">
                  {EXAMPLES.map((q) => (
                    <button key={q} type="button" onClick={() => send(q)} className="tap inline-flex min-h-9 items-center rounded-full border border-line bg-bg px-3 py-1.5 text-left text-sm text-ink hover:border-muted">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            }
          />

          <ChatComposer
            id={panelId}
            value={input}
            onChange={setInput}
            onSend={() => send(input)}
            busy={!!pending}
            boxRef={box}
            className="border-t border-line px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3"
          />
        </section>
      )}
    </div>
  );
}

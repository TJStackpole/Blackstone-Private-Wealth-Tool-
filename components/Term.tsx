"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { GlossaryTerm } from "@/lib/glossary";
import { formatDate } from "@/lib/dates";
import { FUNDS } from "@/lib/addons/shared/funds";

const GUTTER = 16;

/**
 * A word with a dotted underline that opens its plain definition: one line, the filing's own words and the source.
 * Tap, click or Enter opens it; Escape, a second tap or a tap elsewhere closes it. On paper it is plain text.
 */
export default function Term({ term, children, example }: { term: GlossaryTerm; children: ReactNode; example?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const id = useId();

  const place = useCallback(() => {
    const b = btn.current?.getBoundingClientRect();
    if (!b) return;
    const vw = document.documentElement.clientWidth;
    const width = Math.min(340, vw - GUTTER * 2);
    const left = Math.min(Math.max(GUTTER, b.left), vw - width - GUTTER);
    const h = box.current?.offsetHeight ?? 0;
    const below = b.bottom + 6;
    const top = h && below + h > window.innerHeight - 8 && b.top - h - 6 > 8 ? b.top - h - 6 : below;
    setPos({ top, left, width });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      const t = e.target as Node;
      if (btn.current?.contains(t) || box.current?.contains(t)) return;
      setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="inline cursor-help rounded-sm text-left [text-transform:inherit] underline decoration-muted decoration-dotted decoration-1 underline-offset-[3px] hover:decoration-ink print:no-underline"
        data-term={term.id}
      >
        {children}
      </button>
      {open &&
        createPortal(
          <div
            ref={box}
            id={id}
            role="dialog"
            aria-label={`${term.term}: definition`}
            className="no-print fixed z-50 rounded-card border border-line bg-bg-raised p-4 text-left shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
            style={{ top: pos?.top ?? -9999, left: pos?.left ?? 0, width: pos?.width ?? 320 }}
            data-term-pop={term.id}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-strong">{term.term}</p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  btn.current?.focus();
                }}
                className="tap-sm -mr-1 -mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted hover:text-ink"
                aria-label="Close definition"
              >
                <span aria-hidden>×</span>
              </button>
            </div>
            {example && term.fund && <p className="mt-1 text-[11px] text-muted">As {FUNDS[term.fund].label}&rsquo;s filing puts it, as an example</p>}
            <p className="mt-1.5 text-sm leading-relaxed text-ink">{term.plain}</p>
            <blockquote className="mt-2 border-l-2 border-line pl-3 text-xs leading-relaxed text-muted-strong">&ldquo;{term.quote}&rdquo;</blockquote>
            <p className="tnum mt-2 text-[11px] leading-snug text-muted">
              <a href={term.source.url} target="_blank" rel="noreferrer noopener" title={term.source.page} className="underline decoration-line underline-offset-2 hover:text-ink">
                {term.source.name}
              </a>{" "}
              · as of {formatDate(term.asOf)}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Reference material folded away so the page reads short: tables, history and fine print. Closed by default on screen;
 * a link to #id opens it. Closed <details> don't print, so pages that need this content on paper render a print-only copy.
 */
export default function MoreDetails({ summary, hint, id, children }: { summary: string; hint?: string; id?: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (!id) return;
    const openIfTarget = () => {
      if (window.location.hash !== `#${id}` || !ref.current) return;
      ref.current.open = true;
      ref.current.scrollIntoView({ block: "start" });
    };
    openIfTarget();
    window.addEventListener("hashchange", openIfTarget);
    return () => window.removeEventListener("hashchange", openIfTarget);
  }, [id]);
  return (
    <details ref={ref} id={id} className="group scroll-mt-6 rounded-card border border-line bg-bg-raised print:hidden">
      <summary className="tap flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 sm:px-5 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-sm font-medium text-ink">{summary}</span>
          {hint && <span className="block text-xs text-muted">{hint}</span>}
        </span>
        <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">
          +
        </span>
      </summary>
      <div className="border-t border-line px-4 py-4 sm:px-5">{children}</div>
    </details>
  );
}

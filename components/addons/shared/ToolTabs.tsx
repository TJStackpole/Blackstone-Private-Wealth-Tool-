"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

export interface ToolTab {
  /** Also the address fragment: /toolkit/liquidity#structure opens that tab. */
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * Two parts of one tool, one at a time. Only the open part is on the page, so printing gives that part's one-pager.
 * The address's #fragment picks the part, which is how the old tools' addresses land on the right one.
 */
export default function ToolTabs({ tabs }: { tabs: ToolTab[] }) {
  const [active, setActive] = useState(tabs[0].id);
  const base = useId();
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if (tabs.some((t) => t.id === h)) setActive(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [tabs]);
  const pick = (id: string) => {
    setActive(id);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}#${id}`);
  };
  const shown = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div className="space-y-8">
      <div role="tablist" aria-label="Parts of this tool" className="no-print flex flex-wrap gap-2 border-b border-line pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`${base}-${t.id}`}
            role="tab"
            type="button"
            aria-selected={t.id === shown.id}
            aria-controls={`${base}-panel`}
            onClick={() => pick(t.id)}
            className={[
              "tap inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors",
              t.id === shown.id ? "border-accent bg-accent text-accent-contrast" : "border-line bg-bg-raised text-muted-strong hover:text-ink",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-${shown.id}`}>
        {shown.content}
      </div>
    </div>
  );
}

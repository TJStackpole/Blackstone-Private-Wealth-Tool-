import type { ReactNode } from "react";
import { COMPARE } from "@/lib/addons/drawdown-vs-evergreen/data";

const ICONS: Record<string, ReactNode> = {
  calls: <path d="M4 7h16M4 12h10M4 17h6M17 14v6M14 17h6" />,
  invest: <path d="M4 18l5-5 4 3 7-8M14 8h6v6" />,
  jcurve: <path d="M3 9c3 0 3 6 6 6s5-9 12-11" />,
  liquidity: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  fees: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5v1.5M12 16v1.5" />
    </>
  ),
  reporting: <path d="M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5" />,
  paperwork: <path d="M4 20l4-1 11-11-3-3L5 16zM14 7l3 3" />,
  life: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
};

/** The two structures in a few words per topic; the full comparison with sources sits below it. */
export default function AtAGlance() {
  return (
    <div className="overflow-hidden rounded-card border border-line">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] bg-bg-raised text-[11px] font-semibold uppercase tracking-[0.08em] sm:grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)]">
        <span className="hidden px-4 py-3 text-muted sm:block">Topic</span>
        <span className="px-4 py-3 text-muted">Traditional drawdown</span>
        <span className="border-l border-line bg-accent/[0.06] px-4 py-3 text-accent">Evergreen (e.g. {COMPARE.evergreenExample})</span>
      </div>
      <ul className="divide-y divide-line">
        {COMPARE.rows.map((r) => (
          <li key={r.topic} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)]">
            <span className="col-span-2 flex items-center gap-2.5 px-4 pt-3 text-xs font-medium text-ink sm:col-span-1 sm:py-3.5 sm:text-sm">
              <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted">
                {ICONS[r.icon]}
              </svg>
              {r.topic}
            </span>
            <span className="px-4 py-2.5 text-sm text-muted-strong sm:py-3.5">{r.drawdownShort}</span>
            <span className="flex items-start gap-2 border-l border-line bg-accent/[0.06] px-4 py-2.5 text-sm font-medium text-ink sm:py-3.5">
              <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-accent">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              {r.evergreenShort}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

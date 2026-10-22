"use client";

import { useState } from "react";
import { BULL_BEAR, THEMES, findTheme } from "@/lib/addons/themes/tags";
import type { CasePoint } from "@/lib/addons/themes/tags";

function Side({ title, points }: { title: string; points: CasePoint[] }) {
  return (
    <section aria-label={title} className="flex flex-col gap-3 rounded-card border border-line bg-bg-raised p-4 sm:p-5 print:gap-1 print:p-2">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">{title}</h3>
      <ul className="space-y-3 print:space-y-1">
        {points.map((p) => (
          <li key={p.text.slice(0, 40)} className="text-sm leading-relaxed text-muted-strong print:text-[11px] print:leading-snug">
            {p.text}{" "}
            <a href={p.source.url} target="_blank" rel="noreferrer noopener" className="text-xs text-muted underline decoration-line underline-offset-2 hover:text-ink">
              Source: {p.source.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Case for and case against, per theme: same number of points, same space, every point sourced. */
export default function BullBear({ initial = THEMES[0].id }: { initial?: string }) {
  const [id, setId] = useState(initial);
  const theme = findTheme(id)!;
  const c = BULL_BEAR.themes[id];
  return (
    <div className="space-y-4 print:space-y-2">
      <div role="group" aria-label="Theme" className="no-print flex flex-wrap gap-1.5">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={t.id === id}
            onClick={() => setId(t.id)}
            className={[
              "tap inline-flex h-8 items-center rounded-full border px-3 text-xs",
              t.id === id ? "border-accent bg-accent font-medium text-accent-contrast" : "border-line bg-bg-raised text-muted-strong hover:text-ink",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-sm font-medium text-ink">{theme.label}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <Side title="Case for" points={c.for} />
        <Side title="Case against" points={c.against} />
      </div>
      <p className="text-xs leading-relaxed text-muted">{BULL_BEAR.note} Gathered {BULL_BEAR.asOf.slice(0, 7)}.</p>
    </div>
  );
}

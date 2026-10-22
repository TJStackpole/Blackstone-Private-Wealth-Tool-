"use client";

import type { QuickProps } from "../quick";
import { FUNDS } from "@/lib/addons/shared/funds";
import { BULL_BEAR, themeSectors, topThemes } from "@/lib/addons/themes/tags";

/** Drawer view: this fund's themes, largest first, with the strongest point on each side for the top one. */
export default function ThemesQuick({ fund }: QuickProps) {
  const tops = topThemes(fund);
  const first = tops[0];
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-strong">Share of {FUNDS[fund].label} in each theme, from the sector weights in its June 30, 2026 10-Q.</p>
      <ul className="space-y-2">
        {tops.map(({ theme, pct }) => (
          <li key={theme.id} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink">{theme.label}</span>
              <span className="tnum text-ink">{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-muted">{themeSectors(theme, fund).map((s) => `${s.key} ${s.pct}%`).join(" + ")}</p>
          </li>
        ))}
      </ul>
      {first && (
        <div className="grid gap-2">
          <p className="text-xs font-medium text-muted-strong">{first.theme.label}: one point on each side</p>
          {(["for", "against"] as const).map((side) => {
            const p = BULL_BEAR.themes[first.theme.id][side][0];
            return (
              <p key={side} className="rounded-card border border-line bg-bg-raised p-3 text-xs leading-relaxed text-muted-strong">
                <span className="font-medium text-ink">{side === "for" ? "For: " : "Against: "}</span>
                {p.text}{" "}
                <a href={p.source.url} target="_blank" rel="noreferrer noopener" className="text-muted underline decoration-line underline-offset-2">
                  Source
                </a>
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

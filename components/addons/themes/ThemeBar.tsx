"use client";

import { useEffect, useRef, useState } from "react";
import { findAddon } from "@/config/addons";
import type { LayerId } from "@/lib/types";
import { FUNDS, toFundCode } from "@/lib/addons/shared/funds";
import { THEMES, findTheme, primarySector, themeSectors, themeWeight } from "@/lib/addons/themes/tags";
import type { FundCode } from "@/config/addons";
import AddonBoundary from "@/components/addons/shared/AddonBoundary";
import { useEdgeFade } from "@/components/useEdgeFade";

interface Props {
  layerId: LayerId;
  /** The map's current sector filter. */
  sector: string | null;
  /** The map's own sector setter: a theme only ever drives the existing filter. */
  onSector: (key: string | null) => void;
  /** A theme to start with, from a link such as /?view=breit&theme=ai-data-centers. */
  initialTheme?: string;
}

/**
 * Theme filter above the map (Add-on 6). Picking a theme sets the map's existing sector filter to that fund's
 * matching sector, and keeps applying it as you switch funds. "No theme" hands the map back exactly as it was.
 */
function Bar({ layerId, sector, onSector, initialTheme }: Props) {
  const fund = toFundCode(layerId);
  const [themeId, setThemeId] = useState<string | null>(findTheme(initialTheme ?? null)?.id ?? null);
  const theme = findTheme(themeId);
  const mapped = theme && fund ? primarySector(theme, fund) : null;
  const active = !!theme && sector === mapped;

  // Carry an active theme across fund switches (the map clears its filter on a switch; this re-applies the theme's sector).
  const row = useRef<HTMLDivElement>(null);
  useEdgeFade(row);
  const last = useRef({ layerId, active, started: false });
  useEffect(() => {
    // A theme from the address applies once, on first render.
    if (!last.current.started && theme && fund && initialTheme) onSector(primarySector(theme, fund));
    else if (last.current.layerId !== layerId && last.current.active && theme && fund) onSector(primarySector(theme, fund));
    last.current = { layerId, active: last.current.started ? active : true, started: true };
  });

  if (!fund) return null;

  function pick(id: string | null) {
    const t = findTheme(id);
    if (!t || (id === themeId && active)) {
      setThemeId(null);
      onSector(null);
      return;
    }
    setThemeId(t.id);
    onSector(primarySector(t, fund!));
  }

  const across = theme
    ? (Object.keys(FUNDS) as FundCode[]).filter((f) => themeWeight(theme, f) > 0).map((f) => `${FUNDS[f].label} ${themeWeight(theme, f)}%`)
    : [];
  const here = theme ? themeSectors(theme, fund) : [];

  return (
    <div className="space-y-2" data-theme-bar>
      <div ref={row} role="group" aria-label="Filter by theme, across funds" className="edge-fade -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <span className="mr-1 shrink-0 text-[11px] font-medium uppercase tracking-[0.1em] text-muted">Theme</span>
        {THEMES.map((t) => {
          const on = active && t.id === themeId;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => pick(t.id)}
              title={t.description}
              className={[
                "tap inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-full border border-dashed px-2.5 text-xs transition-colors",
                on ? "border-solid border-accent bg-bg-raised font-medium text-ink" : "border-line text-muted-strong hover:text-ink",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
        {active && (
          <button type="button" onClick={() => pick(null)} className="tap h-7 shrink-0 whitespace-nowrap px-2 text-xs text-muted-strong underline decoration-line underline-offset-2 hover:text-ink">
            No theme
          </button>
        )}
      </div>
      {active && theme && (
        <p className="text-xs leading-relaxed text-muted-strong" aria-live="polite">
          {here.length > 0
            ? `${theme.label} in ${FUNDS[fund].label}: ${here.map((s) => `${s.key} ${s.pct}%`).join(" + ")}${here.length > 1 ? ` (the map shows ${here[0].key})` : ""}. `
            : `${FUNDS[fund].label}'s filing has no sector tagged ${theme.label}. `}
          Across funds: {across.join(" · ")}. Share of each fund, from its 10-Q.
        </p>
      )}
    </div>
  );
}

export default function ThemeBar(props: Props) {
  if (!findAddon("themes")) return null;
  return (
    <AddonBoundary addonId="themes">
      <Bar {...props} />
    </AddonBoundary>
  );
}

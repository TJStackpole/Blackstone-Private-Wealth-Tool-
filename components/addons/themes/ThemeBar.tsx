"use client";

import { useEffect, useRef } from "react";
import { findAddon } from "@/config/addons";
import type { LayerId } from "@/lib/types";
import { FUNDS, toFundCode } from "@/lib/addons/shared/funds";
import { THEMES, findTheme, primarySector, themeSectors, themeWeight } from "@/lib/addons/themes/tags";
import type { FundCode } from "@/config/addons";
import AddonBoundary from "@/components/addons/shared/AddonBoundary";
import { useEdgeFade } from "@/components/useEdgeFade";

/** The chosen theme, and the sector the person had before picking it (restored by "No theme" on the same fund). */
export interface ThemeState {
  id: string | null;
  before: { layerId: LayerId; sector: string | null } | null;
}

export const NO_THEME: ThemeState = { id: null, before: null };

interface Props {
  layerId: LayerId;
  /** The map's current sector filter. */
  sector: string | null;
  /** The map's own sector setter: a theme only ever drives the existing filter. */
  onSector: (key: string | null) => void;
  /** Held by the map, so the choice survives a visit to "All funds" or "Retirement". */
  theme: ThemeState;
  onTheme: (t: ThemeState) => void;
}

/**
 * Theme filter above the map (Add-on 6). Picking a theme sets the map's existing sector filter to that fund's
 * matching sector, and keeps applying it as you switch funds. Picking a sector yourself sets the theme aside.
 * "No theme" puts back the sector you had before, on the same fund.
 */
function Bar({ layerId, sector, onSector, theme: state, onTheme }: Props) {
  const fund = toFundCode(layerId);
  const theme = findTheme(state.id);
  const mapped = theme && fund ? primarySector(theme, fund) : null;

  const row = useRef<HTMLDivElement>(null);
  useEdgeFade(row);

  // When a fund's view opens (first show, a fund switch, or back from All funds), apply the theme's sector.
  // On the same fund, a different sector means the person chose it themselves, so the theme steps aside.
  const shownLayer = useRef<LayerId | null>(null);
  useEffect(() => {
    if (!theme || !fund) {
      shownLayer.current = layerId;
      return;
    }
    if (shownLayer.current !== layerId) {
      shownLayer.current = layerId;
      if (sector !== mapped) onSector(mapped);
      return;
    }
    if (sector !== mapped) onTheme(NO_THEME);
  });

  if (!fund) return null;

  function pick(id: string | null) {
    const t = findTheme(id);
    if (!t || id === state.id) {
      const back = state.before && state.before.layerId === layerId ? state.before.sector : null;
      onTheme(NO_THEME);
      onSector(back);
      return;
    }
    onTheme({ id: t.id, before: state.id ? state.before : { layerId, sector } });
    onSector(primarySector(t, fund!));
  }
  const active = !!theme;

  const across = theme
    ? (Object.keys(FUNDS) as FundCode[]).filter((f) => themeWeight(theme, f) > 0).map((f) => `${FUNDS[f].label} ${themeWeight(theme, f)}%`)
    : [];
  const here = theme ? themeSectors(theme, fund) : [];

  return (
    <div className="space-y-2" data-theme-bar>
      <div ref={row} role="group" aria-label="Filter by theme, across funds" className="edge-fade -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <span className="mr-1 shrink-0 text-[11px] font-medium uppercase tracking-[0.1em] text-muted">Theme</span>
        {THEMES.map((t) => {
          const on = t.id === state.id;
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

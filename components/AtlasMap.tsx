"use client";

import { useCallback, useMemo, useState } from "react";
import { ComposableMap, Marker, useMapContext } from "react-simple-maps";
import { STATE_FEATURE_LIST } from "@/lib/geo";
import { STATE_BY_FIPS } from "@/lib/states";
import type { StateSummary } from "@/lib/aggregate";
import { formatPct, metroTotals } from "@/lib/aggregate";

export interface AtlasMapProps {
  /** State code → rolled-up summary (already filtered by sector). */
  byState: Map<string, StateSummary>;
  /** Largest state total, used to scale shading. */
  maxPct: number;
  selectedState: string | null;
  selectedMetro?: string | null;
  onSelectState: (abbr: string | null) => void;
  /** When set, metro dots are clickable (used for headquarters layers to show companies). */
  onSelectMetro?: (abbr: string, metro: string) => void;
  /** Label used in tooltips and aria text, e.g. "BREIT". */
  fundLabel: string;
  /** Small, non-interactive version for the All funds grid. */
  compact?: boolean;
}

const WIDTH = 975;
const HEIGHT = 600;

interface TooltipState {
  abbr: string;
  x: number;
  y: number;
}

/**
 * The US map. States shade by weight, metros sit on top as rings sized by weight.
 * Reused by every layer — it knows nothing about which fund it is drawing.
 */
export default function AtlasMap({ byState, maxPct, selectedState, selectedMetro, onSelectState, onSelectMetro, fundLabel, compact = false }: AtlasMapProps) {
  const [tip, setTip] = useState<TooltipState | null>(null);

  const metros = useMemo(() => metroTotals([...byState.values()].flatMap((s) => s.metros)), [byState]);
  const maxMetro = metros[0]?.pct ?? 0;

  const onMove = useCallback((abbr: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.closest("[data-map-root]")?.getBoundingClientRect();
    if (!rect) return;
    setTip({ abbr, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const tipSummary = tip ? byState.get(tip.abbr) : undefined;
  const tipName = tip ? STATE_BY_FIPS_ABBR[tip.abbr] : "";

  return (
    <div data-map-root className="relative" onMouseLeave={() => setTip(null)}>
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1280 }}
        width={WIDTH}
        height={HEIGHT}
        role={compact ? "img" : "group"}
        aria-label={`Map of the United States shaded by ${fundLabel} weight per state`}
      >
        <StatePaths
          byState={byState}
          maxPct={maxPct}
          selectedState={selectedState}
          onSelectState={onSelectState}
          onHover={onMove}
          onLeave={() => setTip(null)}
          fundLabel={fundLabel}
          compact={compact}
        />
        <g aria-hidden={!onSelectMetro} pointerEvents={onSelectMetro ? "auto" : "none"}>
          {metros.map((m) => {
            const r = (compact ? 2 : 3) + Math.sqrt(m.pct / Math.max(maxMetro, 0.1)) * (compact ? 7 : 9);
            const dim = selectedState !== null && selectedState !== m.state;
            const isSelected = selectedState === m.state && selectedMetro === m.metro;
            return (
              <Marker
                key={`${m.metro}-${m.state}`}
                coordinates={[m.lng, m.lat]}
                role={onSelectMetro ? "button" : undefined}
                tabIndex={onSelectMetro ? 0 : undefined}
                aria-label={onSelectMetro ? `${m.metro}, ${m.state}: ${formatPct(m.pct)} of ${fundLabel}. Show companies.` : undefined}
                style={onSelectMetro ? { cursor: "pointer", outline: "none" } : undefined}
                onClick={(e) => {
                  if (!onSelectMetro) return;
                  e.stopPropagation();
                  onSelectMetro(m.state, m.metro);
                }}
                onKeyDown={(e) => {
                  if (!onSelectMetro) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectMetro(m.state, m.metro);
                  }
                }}
                className={onSelectMetro ? "metro-marker" : undefined}
              >
                <circle
                  className="metro-dot"
                  r={r}
                  fill={isSelected ? "var(--accent)" : "var(--bg)"}
                  fillOpacity={isSelected ? 0.9 : 0.35}
                  stroke="var(--accent)"
                  strokeWidth={isSelected ? 2 : 1.5}
                  opacity={dim ? 0.25 : 1}
                />
                <circle className="metro-dot" r={1.6} fill={isSelected ? "var(--bg)" : "var(--accent)"} opacity={dim ? 0.25 : 1} />
              </Marker>
            );
          })}
        </g>
      </ComposableMap>

      {tip && !compact && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-card border border-line bg-bg-raised px-3 py-2 text-xs shadow-sm"
          style={{ left: tip.x + 14, top: tip.y + 14 }}
        >
          <div className="font-medium text-ink">{tipName}</div>
          {tipSummary ? (
            <div className="tnum mt-0.5 text-muted-strong">
              {formatPct(tipSummary.totalPct)} of {fundLabel}
              <span className="text-muted">
                {" "}
                · {metroCount(tipSummary)} {metroCount(tipSummary) === 1 ? "metro" : "metros"}
              </span>
            </div>
          ) : (
            <div className="mt-0.5 text-muted">No mapped holdings</div>
          )}
        </div>
      )}
    </div>
  );
}

function metroCount(s: StateSummary): number {
  return new Set(s.metros.map((m) => m.metro)).size;
}

const STATE_BY_FIPS_ABBR: Record<string, string> = Object.fromEntries(
  Object.values(STATE_BY_FIPS).map((s) => [s.abbr, s.name]),
);

interface StatePathsProps {
  byState: Map<string, StateSummary>;
  maxPct: number;
  selectedState: string | null;
  onSelectState: (abbr: string | null) => void;
  onHover: (abbr: string, e: React.MouseEvent) => void;
  onLeave: () => void;
  fundLabel: string;
  compact: boolean;
}

/** Projects the state shapes once per projection and draws them. */
function StatePaths({ byState, maxPct, selectedState, onSelectState, onHover, onLeave, fundLabel, compact }: StatePathsProps) {
  const { path } = useMapContext();

  const shapes = useMemo(
    () =>
      STATE_FEATURE_LIST.map((f) => ({
        fips: f.id,
        d: path(f),
        info: STATE_BY_FIPS[f.id],
      })).filter((s): s is { fips: string; d: string; info: (typeof STATE_BY_FIPS)[string] } => Boolean(s.d && s.info)),
    [path],
  );

  const selectedShape = selectedState ? shapes.find((s) => s.info.abbr === selectedState) : undefined;

  return (
    <g className="rsm-geographies">
      {shapes.map(({ fips, d, info }) => {
        const summary = byState.get(info.abbr);
        const pct = summary?.totalPct ?? 0;
        const shaded = pct > 0;
        const has = shaded && !compact; // interactive only in the full-size map
        const t = shaded && maxPct > 0 ? 0.18 + 0.82 * Math.sqrt(pct / maxPct) : 0;
        const selected = selectedState === info.abbr;
        const fill = shaded ? `color-mix(in oklab, var(--map-empty), var(--accent) ${Math.round(t * 100)}%)` : "var(--map-empty)";
        return (
          <path
            key={fips}
            d={d}
            className="rsm-geography"
            role={has ? "button" : undefined}
            tabIndex={has ? 0 : -1}
            aria-label={has ? `${info.name}, ${formatPct(pct)} of ${fundLabel}` : undefined}
            aria-pressed={has ? selected : undefined}
            style={{
              fill,
              stroke: "var(--map-stroke)",
              strokeWidth: compact ? 1 : 0.75,
              cursor: has ? "pointer" : "default",
            }}
            onMouseEnter={(e) => onHover(info.abbr, e)}
            onMouseMove={(e) => onHover(info.abbr, e)}
            onMouseLeave={onLeave}
            onClick={() => has && onSelectState(selected ? null : info.abbr)}
            onKeyDown={(e) => {
              if (!has) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectState(selected ? null : info.abbr);
              }
              if (e.key === "Escape") onSelectState(null);
            }}
          />
        );
      })}
      {selectedShape && (
        <path aria-hidden d={selectedShape.d} fill="none" stroke="var(--text)" strokeWidth={1.5} strokeLinejoin="round" pointerEvents="none" />
      )}
    </g>
  );
}

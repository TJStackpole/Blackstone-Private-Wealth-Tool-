"use client";

import { useCallback, useMemo, useState } from "react";
import { ComposableMap, useMapContext } from "react-simple-maps";
import { COUNTRIES, countryKey } from "@/lib/regions";
import type { Share } from "@/lib/types";
import { formatPct } from "@/lib/aggregate";

interface Props {
  level: "world-region" | "country-group";
  /** Shares to draw. Keys not on the map (e.g. "Various") are ignored here and listed by the caller. */
  items: Share[];
  selected: string | null;
  onSelect: (key: string | null) => void;
  fundLabel: string;
  /** What the percentages are "of", for the tooltip, e.g. "BXPE" or "BXPE's Software holdings". */
  ofWhat: string;
  compact?: boolean;
}

const WIDTH = 980;
const HEIGHT = 470;

/**
 * World map shaded at exactly the level the filing reports: Americas / EMEA / APAC,
 * or BCRED's country groups. Every country in a group gets the group's color, because
 * the filing gives no split inside the group.
 */
export default function WorldMap({ level, items, selected, onSelect, fundLabel, ofWhat, compact = false }: Props) {
  const [tip, setTip] = useState<{ key: string; country: string; x: number; y: number } | null>(null);
  const byKey = useMemo(() => Object.fromEntries(items.map((i) => [i.key, i])), [items]);
  const max = Math.max(0.1, ...items.filter((i) => mappable(level, i.key)).map((i) => i.pct));

  const onMove = useCallback((key: string, country: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.closest("[data-map-root]")?.getBoundingClientRect();
    if (rect) setTip({ key, country, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const tipShare = tip ? byKey[tip.key] : undefined;

  return (
    <div data-map-root className="relative" onMouseLeave={() => setTip(null)}>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 185, center: [10, 8] }}
        width={WIDTH}
        height={HEIGHT}
        role="img"
        aria-label={`World map shaded by ${fundLabel}'s reported ${level === "world-region" ? "regions" : "country groups"}`}
      >
        <Countries level={level} byKey={byKey} max={max} selected={selected} onSelect={onSelect} onHover={onMove} onLeave={() => setTip(null)} compact={compact} />
      </ComposableMap>

      {tip && !compact && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-card border border-line bg-bg-raised px-3 py-2 text-xs shadow-sm"
          style={{ left: Math.min(tip.x + 14, 9999), top: tip.y + 14 }}
        >
          <div className="font-medium text-ink">{tip.country}</div>
          {tipShare ? (
            <div className="tnum mt-0.5 text-muted-strong">
              In &ldquo;{tipShare.label}&rdquo;: {formatPct(tipShare.pct)} of {ofWhat}
            </div>
          ) : (
            <div className="mt-0.5 text-muted">Not in any group the filing reports</div>
          )}
        </div>
      )}
    </div>
  );
}

/** Keys that correspond to shapes on the map. */
export function mappable(level: Props["level"], key: string): boolean {
  return level === "world-region" ? ["Americas", "EMEA", "APAC"].includes(key) : ["US", "Europe", "Canada", "AusNZ", "Asia"].includes(key);
}

interface CountriesProps {
  level: Props["level"];
  byKey: Record<string, Share>;
  max: number;
  selected: string | null;
  onSelect: (key: string | null) => void;
  onHover: (key: string, country: string, e: React.MouseEvent) => void;
  onLeave: () => void;
  compact: boolean;
}

function Countries({ level, byKey, max, selected, onSelect, onHover, onLeave, compact }: CountriesProps) {
  const { path } = useMapContext();
  const shapes = useMemo(() => COUNTRIES.map((c) => ({ ...c, d: path(c.feature), key: countryKey(c, level) })).filter((c) => c.d), [path, level]);
  return (
    <g>
      {shapes.map((c) => {
        const share = c.key ? byKey[c.key] : undefined;
        const pct = share?.pct ?? 0;
        const t = pct > 0 ? 0.18 + 0.82 * Math.sqrt(pct / max) : 0;
        const fill = pct > 0 ? `color-mix(in oklab, var(--map-empty), var(--accent) ${Math.round(t * 100)}%)` : "var(--map-empty)";
        const isSel = !!c.key && c.key === selected;
        return (
          <path
            key={c.id}
            d={c.d!}
            className="rsm-geography"
            // Countries are a mouse convenience; keyboard users pick regions from the buttons under the map.
            aria-hidden
            tabIndex={-1}
            style={{
              fill,
              stroke: isSel ? "var(--text)" : "var(--map-stroke)",
              strokeWidth: isSel ? 0.9 : 0.5,
              cursor: share && !compact ? "pointer" : "default",
            }}
            onMouseEnter={(e) => c.key && onHover(c.key, c.name, e)}
            onMouseMove={(e) => c.key && onHover(c.key, c.name, e)}
            onMouseLeave={onLeave}
            onClick={() => !compact && share && onSelect(isSel ? null : c.key!)}
          />
        );
      })}
    </g>
  );
}

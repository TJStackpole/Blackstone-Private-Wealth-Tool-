"use client";

import { useCallback, useMemo, useState } from "react";
import { ComposableMap, useMapContext } from "react-simple-maps";
import { STATE_FEATURE_LIST } from "@/lib/geo";
import { STATE_BY_FIPS, stateName } from "@/lib/states";
import { NCREIF_REGION } from "@/lib/regions";
import type { FundData } from "@/lib/types";
import { formatPct } from "@/lib/aggregate";

interface Props {
  data: FundData;
  /** Sector filter for the investment dots (shading always covers all sectors). */
  sector: string | null;
  selected: string | null;
  onSelect: (abbr: string | null) => void;
  compact?: boolean;
}

/** Keeps the Georgia and Florida labels from colliding. */
const LABEL_NUDGE: Record<string, [number, number]> = { FL: [34, 30], GA: [0, -4] };

const WIDTH = 975;
const HEIGHT = 600;

/**
 * BREIT's U.S. map. States are shaded by the share of their NCREIF region (what the filing reports);
 * the three states the filing names are drawn darkest and labeled. Dots count the named investments
 * the 10-Q lists in each state, which shows where the filing names places, not how much money is there.
 */
export default function UsRegionMap({ data, sector, selected, onSelect, compact = false }: Props) {
  const [tip, setTip] = useState<{ abbr: string; x: number; y: number } | null>(null);
  const regionPct = useMemo(() => Object.fromEntries(data.geography.items.map((i) => [i.key, i.pct])), [data]);
  const maxRegion = Math.max(...Object.values(regionPct));
  const topStates = useMemo(() => Object.fromEntries((data.geography.topStates ?? []).map((t) => [t.state, t.pct])), [data]);
  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const inv of data.investments ?? []) {
      if (sector && inv.sector !== sector) continue;
      for (const s of inv.states) out[s] = (out[s] ?? 0) + 1;
    }
    return out;
  }, [data, sector]);

  const onMove = useCallback((abbr: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.closest("[data-map-root]")?.getBoundingClientRect();
    if (rect) setTip({ abbr, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const describe = (abbr: string) => {
    const region = NCREIF_REGION[abbr];
    const n = counts[abbr] ?? 0;
    return {
      region,
      regionPct: regionPct[region],
      statePct: topStates[abbr] as number | undefined,
      count: n,
    };
  };

  const tipInfo = tip ? describe(tip.abbr) : null;

  return (
    <div data-map-root className="relative" onMouseLeave={() => setTip(null)}>
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1280 }}
        width={WIDTH}
        height={HEIGHT}
        role={compact ? "img" : "group"}
        aria-label={`Map of the United States shaded by ${data.fund}'s regional weights`}
      >
        <States
          maxRegion={maxRegion}
          topStates={topStates}
          counts={counts}
          selected={selected}
          onSelect={onSelect}
          onHover={onMove}
          onLeave={() => setTip(null)}
          describe={describe}
          fund={data.fund}
          compact={compact}
          sector={sector}
        />
      </ComposableMap>

      {tip && tipInfo && !compact && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-card border border-line bg-bg-raised px-3 py-2 text-xs shadow-sm"
          style={{ left: tip.x + 14, top: tip.y + 14 }}
        >
          <div className="font-medium text-ink">{stateName(tip.abbr)}</div>
          {tipInfo.statePct !== undefined && (
            <div className="tnum mt-0.5 text-ink">{formatPct(tipInfo.statePct)} of {data.fund}&apos;s real estate</div>
          )}
          <div className="tnum mt-0.5 text-muted-strong">
            {tipInfo.region} region: {formatPct(tipInfo.regionPct)}
          </div>
          <div className="tnum mt-0.5 text-muted">
            {tipInfo.count} named {sector ? `${sector.toLowerCase()} ` : ""}investment{tipInfo.count === 1 ? "" : "s"} listed
          </div>
        </div>
      )}
    </div>
  );
}

interface StatesProps {
  maxRegion: number;
  topStates: Record<string, number>;
  counts: Record<string, number>;
  selected: string | null;
  onSelect: (abbr: string | null) => void;
  onHover: (abbr: string, e: React.MouseEvent) => void;
  onLeave: () => void;
  describe: (abbr: string) => { region: string; regionPct: number; statePct?: number; count: number };
  fund: string;
  compact: boolean;
  sector: string | null;
}

function States({ maxRegion, topStates, counts, selected, onSelect, onHover, onLeave, describe, fund, compact, sector }: StatesProps) {
  const { path } = useMapContext();
  const shapes = useMemo(
    () =>
      STATE_FEATURE_LIST.map((f) => {
        const info = STATE_BY_FIPS[f.id];
        const d = path(f);
        if (!info || !d || !NCREIF_REGION[info.abbr]) return null;
        // Centroid in screen space, for the dot and the label.
        const [cx, cy] = pathCentroid(path, f);
        return { abbr: info.abbr, name: info.name, d, cx, cy };
      }).filter((s): s is NonNullable<typeof s> => s !== null),
    [path],
  );
  const selectedShape = selected ? shapes.find((s) => s.abbr === selected) : undefined;
  const maxCount = Math.max(1, ...Object.values(counts));

  return (
    <g>
      {shapes.map((s) => {
        const info = describe(s.abbr);
        const isTop = info.statePct !== undefined;
        const t = 0.12 + 0.6 * (info.regionPct / maxRegion);
        const fill = isTop
          ? "color-mix(in oklab, var(--accent), var(--text) 30%)"
          : `color-mix(in oklab, var(--map-empty), var(--accent) ${Math.round(t * 100)}%)`;
        const label = `${s.name}: ${info.region} region, ${formatPct(info.regionPct)} of ${fund}'s real estate${
          isTop ? `; ${s.name} itself is ${formatPct(info.statePct!)}` : ""
        }; ${info.count} named ${sector ? sector.toLowerCase() + " " : ""}investment${info.count === 1 ? "" : "s"} listed`;
        return (
          <path
            key={s.abbr}
            d={s.d}
            className="rsm-geography"
            role={compact ? undefined : "button"}
            tabIndex={compact ? -1 : 0}
            aria-label={compact ? undefined : label}
            aria-pressed={compact ? undefined : selected === s.abbr}
            style={{ fill, stroke: "var(--map-stroke)", strokeWidth: compact ? 1 : 0.75, cursor: compact ? "inherit" : "pointer" }}
            onMouseEnter={(e) => onHover(s.abbr, e)}
            onMouseMove={(e) => onHover(s.abbr, e)}
            onMouseLeave={onLeave}
            onClick={() => !compact && onSelect(selected === s.abbr ? null : s.abbr)}
            onKeyDown={(e) => {
              if (compact) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(selected === s.abbr ? null : s.abbr);
              }
              if (e.key === "Escape") onSelect(null);
            }}
          />
        );
      })}
      {selectedShape && <path aria-hidden d={selectedShape.d} fill="none" stroke="var(--text)" strokeWidth={1.75} pointerEvents="none" />}
      <g aria-hidden pointerEvents="none">
        {shapes.map((s) => {
          const n = counts[s.abbr] ?? 0;
          if (!n) return null;
          const r = (compact ? 2 : 3) + Math.sqrt(n / maxCount) * (compact ? 7 : 10);
          return (
            <g key={s.abbr} transform={`translate(${s.cx}, ${s.cy})`}>
              <circle className="metro-dot" r={r} fill="var(--bg)" fillOpacity={0.55} stroke="var(--text)" strokeOpacity={0.55} strokeWidth={1.25} />
            </g>
          );
        })}
        {!compact &&
          shapes
            .filter((s) => topStates[s.abbr] !== undefined)
            .map((s) => (
              <text
                key={s.abbr}
                x={s.cx + (LABEL_NUDGE[s.abbr]?.[0] ?? 0)}
                y={s.cy - 18 + (LABEL_NUDGE[s.abbr]?.[1] ?? 0)}
                textAnchor="middle"
                className="tnum"
                style={{ fill: "var(--text)", fontSize: 15, fontWeight: 600, paintOrder: "stroke", stroke: "var(--bg)", strokeWidth: 4 }}
              >
                {formatPct(topStates[s.abbr])}
              </text>
            ))}
      </g>
    </g>
  );
}

/** Screen-space centroid of a projected state, nudged for states whose centroid sits awkwardly. */
function pathCentroid(path: ReturnType<typeof useMapContext>["path"], f: Parameters<ReturnType<typeof useMapContext>["path"]>[0]): [number, number] {
  // react-simple-maps exposes path as a d3 geoPath; its centroid method lives on the same object.
  const p = path as unknown as { centroid: (g: unknown) => [number, number] };
  const [x, y] = p.centroid(f);
  return [x, y];
}

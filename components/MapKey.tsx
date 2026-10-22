"use client";

import type { FundData, Share } from "@/lib/types";
import { formatPct } from "@/lib/aggregate";
import { mappable } from "./WorldMap";

interface Props {
  data: FundData;
  /** Shares currently drawn (may be a sector's own split). */
  items: Share[];
  selected: string | null;
  onSelect: (key: string | null) => void;
  /** Explains what the map is showing when a sector filter is on. */
  filterNote?: string;
}

/** The key under the map. On world maps it's also the keyboard way to pick a region. */
export default function MapKey({ data, items, selected, onSelect, filterNote }: Props) {
  const level = data.geography.level;
  return (
    <div className="space-y-2 text-xs text-muted">
      {level === "us-region" ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-2">
            <span aria-hidden className="h-3 w-3 rounded-sm" style={{ background: "color-mix(in oklab, var(--accent), var(--text) 30%)" }} />
            Largest states, as named in the filing
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="h-3 w-8 rounded-sm" style={{ background: "linear-gradient(90deg, color-mix(in oklab, var(--map-empty), var(--accent) 30%), color-mix(in oklab, var(--map-empty), var(--accent) 72%))" }} />
            Region share: {items.filter((i) => i.key !== "Non-US").map((i) => `${i.label} ${formatPct(i.pct)}`).join(" · ")}
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="flex items-end gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full border border-current" />
              <span className="h-3 w-3 rounded-full border border-current" />
            </span>
            Number of named investments listed there, not their value
          </span>
        </div>
      ) : (
        <div role="group" aria-label="Pick a region" className="flex flex-wrap gap-2">
          {items.map((i) =>
            mappable(level, i.key) ? (
              <button
                key={i.key}
                type="button"
                aria-pressed={selected === i.key}
                onClick={() => onSelect(selected === i.key ? null : i.key)}
                className={[
                  "tap tnum flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors",
                  selected === i.key ? "border-ink bg-ink text-bg" : "border-line bg-bg text-muted-strong hover:text-ink",
                ].join(" ")}
              >
                {i.label} <span className={selected === i.key ? "opacity-80" : "text-muted"}>{formatPct(i.pct)}</span>
              </button>
            ) : (
              <span key={i.key} className="tnum flex h-7 items-center gap-1.5 rounded-full border border-dashed border-line px-2.5" title={i.note}>
                {i.label} {formatPct(i.pct)}
                {i.note && <span className="text-muted">· {i.note}</span>}
              </span>
            ),
          )}
        </div>
      )}
      {filterNote && <p className="leading-relaxed">{filterNote}</p>}
    </div>
  );
}

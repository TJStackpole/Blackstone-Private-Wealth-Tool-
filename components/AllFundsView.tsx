"use client";

import { useMemo } from "react";
import type { LayerDef, LayerId } from "@/lib/types";
import { aggregateByState, formatPct, hasSampleData, sumPct, topStates } from "@/lib/aggregate";
import { stateName } from "@/lib/states";
import AtlasMap from "./AtlasMap";
import SampleBadge from "./SampleBadge";

interface Props {
  layers: LayerDef[];
  onOpenLayer: (id: LayerId) => void;
}

/** Four small maps side by side, one per fund, so the mix can be compared at a glance. */
export default function AllFundsView({ layers, onOpenLayer }: Props) {
  const funds = useMemo(
    () =>
      layers
        .filter((l) => l.status === "active" && l.data && l.id !== "retirement")
        .map((l) => {
          const data = l.data!;
          const byState = aggregateByState(data.holdings);
          const maxPct = Math.max(0, ...[...byState.values()].map((s) => s.totalPct));
          return { layer: l, data, byState, maxPct, mapped: sumPct(data.holdings), top: topStates(byState, 3), sample: hasSampleData(data.holdings) };
        }),
    [layers],
  );

  return (
    <section aria-label="All funds side by side" className="space-y-5">
      <div className="max-w-2xl">
        <h2 className="font-serif text-[26px] font-medium leading-tight tracking-[-0.01em]">Four funds, one country</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-strong">
          Each map uses its own scale, so compare the shape of each footprint rather than the depth of color. Together these are the
          building blocks a combined, multi-asset fund would draw from. Open any map for the full detail.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {funds.map(({ layer, data, byState, maxPct, mapped, top, sample }) => (
          <li
            key={layer.id}
            className="atlas rounded-card border border-line bg-bg-raised p-4"
            style={{ ["--layer-light" as string]: layer.color, ["--layer-dark" as string]: layer.colorDark }}
          >
            <button
              type="button"
              onClick={() => onOpenLayer(layer.id)}
              aria-label={`Open the ${layer.label} layer (${data.fund})`}
              className="group block w-full rounded-sm text-left"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="tab-dot inline-block h-2 w-2 rounded-full" style={{ ["--tab-light" as string]: layer.color, ["--tab-dark" as string]: layer.colorDark }} />
                    <span className="font-serif text-lg font-medium leading-none text-ink">{layer.label}</span>
                    <span className="text-[11px] uppercase tracking-[0.08em] text-muted">{data.fund}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted">
                    {data.locationBasis === "headquarters" ? "Mapped by headquarters" : "Mapped by asset location"}
                  </div>
                </div>
                <span className="text-xs text-muted-strong transition-transform group-hover:translate-x-0.5">Open →</span>
              </div>
              <AtlasMap byState={byState} maxPct={maxPct} selectedState={null} onSelectState={() => {}} fundLabel={data.fund} compact />
            </button>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-line pt-3 text-xs">
              <dt className="text-muted">Mapped</dt>
              <dd className="tnum flex items-center gap-2 text-ink">
                {formatPct(mapped)} across {byState.size} states {sample && <SampleBadge compact />}
              </dd>
              <dt className="text-muted">Top states</dt>
              <dd className="tnum text-ink">{top.map((s) => `${stateName(s.state)} ${formatPct(s.totalPct)}`).join(" · ")}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}

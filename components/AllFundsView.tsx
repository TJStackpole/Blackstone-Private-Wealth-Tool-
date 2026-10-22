"use client";

import type { LayerDef, LayerId } from "@/lib/types";
import { formatPct } from "@/lib/aggregate";
import { formatDate } from "@/lib/dates";
import UsRegionMap from "./UsRegionMap";
import WorldMap from "./WorldMap";

interface Props {
  layers: LayerDef[];
  onOpenLayer: (id: LayerId) => void;
}

/** Four small maps side by side, one per fund, each drawn at the level its own filing reports. */
export default function AllFundsView({ layers, onOpenLayer }: Props) {
  const funds = layers.filter((l) => l.status === "active" && l.data);

  return (
    <section id="panel-all" role="tabpanel" aria-label="All funds side by side" className="space-y-5">
      <div className="max-w-2xl">
        <h2 className="font-serif text-[26px] font-medium leading-tight tracking-[-0.01em]">Four funds, four levels of detail</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-strong">
          Each map is drawn at the level its fund&apos;s filing reports. BREIT reports U.S. regions and its largest states. BX Infra and BXPE report
          continents. BCRED reports country groups. Together these are the building blocks a combined, multi-asset fund would draw from.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {funds.map((layer) => {
          const data = layer.data!;
          // Fund size, wherever the fund's data keeps it (BCRED's is in its This quarter box).
          const nav = data.summary.stats.find((s) => /^Net asset/.test(s.label)) ?? data.quarterSummary?.items.find((m) => m.label === "Net assets") ?? data.summary.stats[0];
          const lead = [...data.geography.items].sort((a, b) => b.pct - a.pct)[0];
          return (
            <li
              key={layer.id}
              className="atlas rounded-card border border-line bg-bg-raised p-4 sm:p-5"
              style={{ ["--layer-light" as string]: layer.color, ["--layer-dark" as string]: layer.colorDark }}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="tab-dot inline-block h-2 w-2 rounded-full" style={{ ["--tab-light" as string]: layer.color, ["--tab-dark" as string]: layer.colorDark }} />
                    <h3 className="font-serif text-lg font-medium leading-none text-ink">{layer.label}</h3>
                    <span className="text-[11px] uppercase tracking-[0.08em] text-muted">{data.fund}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {data.geography.level === "us-region" ? "U.S. regions and largest states" : data.geography.level === "world-region" ? "By continent" : "By country group"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenLayer(layer.id)}
                  aria-label={`Open the ${layer.label} map (${data.fund})`}
                  className="group shrink-0 rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium text-muted-strong hover:border-muted hover:text-ink"
                >
                  Open <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </div>
              {/* The map is a mouse shortcut to the same place; keyboard users use the Open button. */}
              <div aria-hidden onClick={() => onOpenLayer(layer.id)} className="cursor-pointer">
                {data.geography.level === "us-region" ? (
                  <UsRegionMap data={data} sector={null} selected={null} onSelect={() => {}} compact />
                ) : (
                  <WorldMap level={data.geography.level} items={data.geography.items} selected={null} onSelect={() => {}} fundLabel={data.fund} ofWhat={data.fund} compact />
                )}
              </div>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-line pt-3 text-xs">
                {/* One label for all four funds; where the figure is NAV rather than GAAP net assets, it says so. */}
                <dt className="text-muted">Net assets</dt>
                <dd className="tnum text-ink">
                  {nav.value}
                  {data.sizeNote && <span className="text-muted"> · NAV at fair value¹</span>}
                </dd>
                <dt className="text-muted">Largest</dt>
                <dd className="tnum text-ink">
                  {data.geography.topStates
                    ? `${data.geography.topStates.map((t) => t.state).join(", ")} at ${formatPct(data.geography.topStates[0].pct)} each; ${lead.label} region ${formatPct(lead.pct)}`
                    : `${lead.label} ${formatPct(lead.pct)}`}
                </dd>
                <dt className="text-muted">As of</dt>
                <dd className="tnum text-ink">
                  {formatDate(data.asOf)} ·{" "}
                  <a href={data.filing.url} target="_blank" rel="noreferrer noopener" className="text-muted-strong underline decoration-line underline-offset-2 hover:text-ink">
                    SEC {data.filing.form}
                  </a>
                </dd>
              </dl>
              {data.sizeNote && <p className="mt-2 text-[11px] leading-snug text-muted">¹ {data.sizeNote}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

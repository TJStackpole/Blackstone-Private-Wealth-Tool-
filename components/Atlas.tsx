"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DEFAULT_LAYER_ID, LAYERS } from "@/data/layers";
import type { LayerId } from "@/lib/types";
import { stateName } from "@/lib/states";
import { aggregateByState, filterBySector, hasSampleData, sectorMix } from "@/lib/aggregate";
import AtlasMap from "./AtlasMap";
import DetailPanel from "./DetailPanel";
import LayerSwitcher from "./LayerSwitcher";
import Legend from "./Legend";
import SectorChips from "./SectorChips";
import SourceFooter from "./SourceFooter";
import ThemeToggle from "./ThemeToggle";
import SampleBadge from "./SampleBadge";

/** The whole page: header, tabs, chips, map, panel, footer. Every layer plugs into this. */
export default function Atlas() {
  const [layerId, setLayerId] = useState<LayerId>(DEFAULT_LAYER_ID);
  const [sector, setSector] = useState<string | null>(null);
  const [rawSelected, setSelectedState] = useState<string | null>(null);
  const [selectedMetro, setSelectedMetro] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const reduce = useReducedMotion();

  const layer = LAYERS.find((l) => l.id === layerId) ?? LAYERS[0];
  const data = layer.data;

  const holdings = useMemo(() => (data ? filterBySector(data.holdings, sector) : []), [data, sector]);
  const byState = useMemo(() => aggregateByState(holdings), [holdings]);
  const maxPct = useMemo(() => Math.max(0, ...[...byState.values()].map((s) => s.totalPct)), [byState]);
  const fullMix = useMemo(
    () => (data ? Object.fromEntries(sectorMix(data.holdings, data.sectors).map((m) => [m.sector, m.pct])) : {}),
    [data],
  );
  const hasSample = data ? hasSampleData(data.holdings) : false;

  function changeLayer(id: LayerId) {
    setLayerId(id);
    setSector(null);
    setSelectedState(null);
    setSelectedMetro(null);
  }

  function selectState(abbr: string | null) {
    setSelectedState(abbr);
    setSelectedMetro(null);
    if (abbr) setSheetOpen(true);
  }

  /** From a map dot: open that state and expand that metro's companies. */
  function selectMetro(abbr: string, metro: string) {
    setSelectedState(abbr);
    setSelectedMetro(metro);
    setSheetOpen(true);
  }

  // If a sector filter removes the selected state, fall back to the overview.
  const selectedState = rawSelected && byState.has(rawSelected) ? rawSelected : null;

  return (
    <div
      className="atlas mx-auto w-full max-w-[1400px] px-4 pb-24 pt-5 sm:px-6 lg:pb-10 lg:pt-7"
      style={{ ["--layer-light" as string]: layer.color, ["--layer-dark" as string]: layer.colorDark }}
    >
      <header className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-[26px] font-medium leading-none tracking-[-0.01em] sm:text-[30px]">Private Markets Atlas</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-strong">
              Where retail private-markets funds actually invest, one fund at a time, drawn from public filings.
            </p>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-5 border-b border-line">
          <LayerSwitcher layers={LAYERS} activeId={layerId} onChange={changeLayer} />
        </div>
      </header>

      {data ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section aria-label="Map" className="min-w-0">
            <div className="mb-4">
              <SectorChips sectors={data.sectors} active={sector} onChange={(s) => setSector(s)} mix={fullMix} />
            </div>
            <div className="rounded-card border border-line bg-bg-raised p-2 sm:p-4">
              <AtlasMap
                byState={byState}
                maxPct={maxPct}
                selectedState={selectedState}
                selectedMetro={selectedMetro}
                onSelectState={selectState}
                onSelectMetro={data.locationBasis === "headquarters" ? selectMetro : undefined}
                fundLabel={data.fund}
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line px-1 pt-3">
                <Legend maxPct={maxPct} accent="var(--accent)" label={data.fund} />
                <div className="flex items-center gap-3">
                  {hasSample && <SampleBadge />}
                  <p className="text-[11px] text-muted">Tap, click, or press Enter on a state for detail.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Desktop: side panel. Phone: bottom sheet. Same component, one DOM. */}
          <aside
            className={[
              "fixed inset-x-0 bottom-0 z-20 rounded-t-2xl border-t border-line bg-bg-raised shadow-[0_-8px_30px_rgba(0,0,0,0.08)]",
              "lg:static lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => setSheetOpen((o) => !o)}
              aria-expanded={sheetOpen}
              aria-controls="sheet-body"
              className="flex w-full flex-col px-5 pb-3 pt-2 text-left lg:hidden"
            >
              <span className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-line" aria-hidden />
              <span className="flex w-full items-center justify-between">
                <span className="text-sm font-medium text-ink">
                  {selectedState ? `${stateName(selectedState)} · ${data.fund}` : `${data.fund} overview`}
                </span>
                <span className="text-xs text-muted-strong">{sheetOpen ? "Hide" : "Show"}</span>
              </span>
            </button>
            <motion.div
              id="sheet-body"
              className="overflow-hidden lg:!h-auto"
              initial={false}
              animate={{ height: sheetOpen ? "auto" : 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.25, ease: [0.2, 0, 0, 1] }}
            >
              <div className="px-5 pb-6 pt-1 lg:p-0">
                <DetailPanel
                  layer={layer}
                  data={data}
                  holdings={holdings}
                  byState={byState}
                  activeSector={sector}
                  selectedState={selectedState}
                  selectedMetro={selectedMetro}
                  onSelectState={selectState}
                  onSelectMetro={setSelectedMetro}
                  hasSample={hasSample}
                />
              </div>
            </motion.div>
          </aside>
        </div>
      ) : (
        <p className="py-20 text-center text-sm text-muted">This layer is coming in a later phase.</p>
      )}

      <SourceFooter data={data} hasSample={hasSample} caveats={layer.caveats} />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { DEFAULT_LAYER_ID, LAYERS, RETIREMENT } from "@/data/layers";
import type { FundData, LayerId, Share, ViewId } from "@/lib/types";
import { stateName } from "@/lib/states";
import AllFundsView from "./AllFundsView";
import DetailPanel from "./DetailPanel";
import LayerSwitcher from "./LayerSwitcher";
import MapKey from "./MapKey";
import RetirementView from "./RetirementView";
import SectorChips from "./SectorChips";
import SourceFooter from "./SourceFooter";
import ThemeToggle from "./ThemeToggle";
import UsRegionMap from "./UsRegionMap";
import WorldMap from "./WorldMap";
// Add-on 6 (Theme Exposure): the one logged exception to the two-doorway rule. See BUILD_PLAN_ADDONS.md, Add-on 6, Phase 1.
import ThemeBar, { NO_THEME, type ThemeState } from "./addons/themes/ThemeBar";

/** Geography to draw: the whole fund, or the chosen sector's own split where the filing allows it. */
export function geoFor(data: FundData, sector: string | null): { items: Share[]; split: boolean } {
  const split = sector ? data.geography.bySector?.[sector] : undefined;
  if (!split) return { items: data.geography.items, split: false };
  const labelOf = (key: string) => data.geography.items.find((i) => i.key === key)?.label ?? (key === "Various" ? "Various / multi-region" : key);
  return { items: split.map((s) => ({ key: s.key, label: labelOf(s.key), pct: s.pct })), split: true };
}

/** One sentence on what the map shows when a sector filter is on, because each filing allows something different. */
function filterNote(data: FundData, sector: string | null, split: boolean): string | undefined {
  if (!sector) return undefined;
  const label = data.sectors.find((s) => s.key === sector)?.label ?? sector;
  if (data.geography.level === "us-region")
    return `Region shading covers all sectors; the filing doesn't split regions by sector. Dots and state lists show only ${label}.`;
  if (split) return `Showing how ${label} splits across regions, from the schedule of investments.`;
  if (data.geography.level === "country-group")
    return `The filing doesn't split countries by industry, so the map shows the whole fund. The borrower list shows only ${label}.`;
  return `The filing doesn't split ${label} by region, so the map shows the whole fund.`;
}

/** Where to open the map: a fund or view, and optionally a sector, a region or state, and a theme (see AtlasFromUrl). */
export interface AtlasStart {
  view: ViewId;
  sector?: string;
  select?: string;
  theme?: string;
}

/** The whole page: header, tabs, chips, map, panel, footer. Every layer plugs into this. */
export default function Atlas({ start }: { start?: AtlasStart }) {
  const [viewId, setViewId] = useState<ViewId>(start?.view ?? DEFAULT_LAYER_ID);
  const layerId: LayerId = viewId === "all" ? DEFAULT_LAYER_ID : viewId;
  const [sector, setSector] = useState<string | null>(start?.sector ?? null);
  const [selected, setSelected] = useState<string | null>(start?.select ?? null);
  const [sheetOpen, setSheetOpen] = useState(!!start?.select);
  const [theme, setTheme] = useState<ThemeState>(start?.theme ? { id: start.theme, before: null } : NO_THEME);
  const reduce = useReducedMotion();

  const layer = LAYERS.find((l) => l.id === layerId) ?? LAYERS[0];
  const data = layer.data;

  const { items: geoItems, split } = useMemo(() => (data ? geoFor(data, sector) : { items: [], split: false }), [data, sector]);
  const chipSectors = useMemo(() => (data ? data.sectors.filter((s) => !s.key.startsWith("All other")) : []), [data]);

  function changeLayer(id: ViewId) {
    setViewId(id);
    setSector(null);
    setSelected(null);
  }

  /** From All funds or the 401(k) tab, further down a long page: switch, then bring the tabs and map back into view. */
  function openLayer(id: ViewId) {
    changeLayer(id);
    window.scrollTo({ top: 0 });
  }

  function select(key: string | null) {
    setSelected(key);
    if (key) setSheetOpen(true);
  }

  /** On world maps, a sector with no holdings in the selected region clears the selection. */
  function changeSector(next: string | null) {
    setSector(next);
    if (data && selected && data.geography.level !== "us-region") {
      const after = geoFor(data, next).items.find((i) => i.key === selected);
      if (!after || after.pct === 0) setSelected(null);
    }
  }

  const selectedLabel =
    data && selected ? (data.geography.level === "us-region" ? stateName(selected) : (geoItems.find((g) => g.key === selected)?.label ?? selected)) : null;

  return (
    <div
      className="atlas mx-auto w-full max-w-[1400px] px-4 pb-24 pt-5 sm:px-6 lg:pb-10 lg:pt-7"
      style={{ ["--layer-light" as string]: layer.color, ["--layer-dark" as string]: layer.colorDark }}
    >
      <header className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h1 className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink sm:text-[32px]">Blackstone Private Market</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-strong">
              Where Blackstone&apos;s retail private-markets funds invest, one fund at a time, drawn from their latest SEC filings.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link href="/demo" className="tap inline-flex h-9 items-center rounded-full px-3 text-xs font-medium text-muted-strong underline decoration-line underline-offset-4 transition-colors hover:text-ink">
              Take the tour
            </Link>
            <Link href="/toolkit" className="tap inline-flex h-9 items-center rounded-full border border-line bg-bg-raised px-3 text-xs font-medium text-muted-strong transition-colors hover:text-ink">
              Advisor Toolkit
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-5 border-b border-line">
          <LayerSwitcher layers={LAYERS} activeId={viewId} onChange={changeLayer} allFundsAfter="bcred" />
        </div>
      </header>

      {viewId === "all" ? (
        <AllFundsView layers={LAYERS} onOpenLayer={openLayer} />
      ) : viewId === "retirement" ? (
        <RetirementView data={RETIREMENT} layers={LAYERS} onOpenLayer={openLayer} />
      ) : data ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px]">
          <section aria-label="Map" className="min-w-0">
            <div className="mb-4 space-y-3">
              <ThemeBar layerId={layer.id} sector={sector} onSector={changeSector} theme={theme} onTheme={setTheme} />
              <SectorChips
                sectors={chipSectors.map((s) => s.key)}
                labels={Object.fromEntries(chipSectors.map((s) => [s.key, s.label]))}
                active={sector}
                onChange={changeSector}
                mix={Object.fromEntries(chipSectors.map((s) => [s.key, s.pct]))}
              />
            </div>
            <div className="rounded-card border border-line bg-bg-raised p-2 sm:p-4">
              {data.geography.level === "us-region" ? (
                <UsRegionMap data={data} sector={sector} selected={selected} onSelect={select} />
              ) : (
                <WorldMap
                  level={data.geography.level}
                  items={geoItems}
                  selected={selected}
                  onSelect={select}
                  fundLabel={data.fund}
                  ofWhat={split ? `${data.fund}'s ${data.sectors.find((s) => s.key === sector)?.label} holdings` : data.fund}
                />
              )}
              <div className="mt-2 space-y-2 border-t border-line px-1 pt-3">
                <MapKey data={data} items={geoItems} selected={selected} onSelect={select} filterNote={filterNote(data, sector, split)} />
                <p className="text-xs text-muted">
                  {data.geography.level === "us-region"
                    ? "Tap, click, or press Enter on a state for the investments the filing lists there."
                    : "Tap a region on the map, or use the buttons above, for detail."}
                </p>
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
                <span className="text-sm font-medium text-ink">{selectedLabel ? `${selectedLabel} · ${data.fund}` : `${data.fund} overview`}</span>
                <span className="text-xs text-muted-strong">{sheetOpen ? "Hide" : "Show"}</span>
              </span>
            </button>
            <motion.div
              id="sheet-body"
              className="overflow-hidden lg:!h-auto lg:overflow-visible"
              initial={false}
              animate={{ height: sheetOpen ? "auto" : 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.25, ease: [0.2, 0, 0, 1] }}
            >
              <div className="px-5 pb-6 pt-1 lg:p-0">
                <DetailPanel layer={layer} data={data} sector={sector} selected={selected} onSelect={select} geoItems={geoItems} />
              </div>
            </motion.div>
          </aside>
        </div>
      ) : (
        <p className="py-20 text-center text-sm text-muted">This layer is coming in a later phase.</p>
      )}

      <SourceFooter data={viewId === "all" || viewId === "retirement" ? undefined : data} />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { DEFAULT_LAYER_ID, LAYERS, RETIREMENT } from "@/data/layers";
import type { FundData, LayerId, Share, ViewId } from "@/lib/types";
import { stateName } from "@/lib/states";
import { formatPct } from "@/lib/aggregate";
import AllFundsView from "./AllFundsView";
import DetailPanel from "./DetailPanel";
import FundPrint from "./FundPrint";
import TourButton from "./TourButton";
import ClientButton from "./ClientButton";
import FundBrief from "./FundBrief";
import StartScreen from "./StartScreen";
import ViewLink from "./ViewLink";
import { quarterFigures } from "@/lib/quarter";
import { toFundCode } from "@/lib/addons/shared/funds";
import { useMediaQuery } from "./useMediaQuery";
import QuarterBox from "./QuarterBox";
import LatestBox from "./LatestBox";
import { latestFor } from "@/lib/latest";
import { readViewPrefs, saveViewPref } from "@/lib/viewPrefs";
import HoldingsLead, { holdingsLead } from "./HoldingsLead";
import LayerSwitcher from "./LayerSwitcher";
import MapKey from "./MapKey";
import RetirementView from "./RetirementView";
import SourceFooter from "./SourceFooter";
import { SITE_NAME, SITE_TAGLINE } from "./SiteMark";
import { findAddon } from "@/config/addons";
import { ADDON_DISCLOSURE } from "./addons/shared/AddonDisclosure";
import ThemeToggle from "./ThemeToggle";
import { useDocumentTitle } from "./useDocumentTitle";
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

/**
 * Where to open the map: a fund or view, and optionally its details open, a sector, a region or state, and a theme
 * (see AtlasFromUrl). No start at all is the Start screen.
 */
export interface AtlasStart {
  view: ViewId;
  details?: boolean;
  sector?: string;
  select?: string;
  theme?: string;
}

/** The Start screen, or one of the tabs. */
type Screen = ViewId | "start";
const isFund = (id: Screen) => id !== "start" && id !== "all" && id !== "retirement";

/** The address for a view, so Back from a tool returns to it and it can be shared as a link. */
function viewUrl(id: Screen, details: boolean): string {
  return id === "start" ? "/" : `/?view=${id}${details && isFund(id) ? "&details=1" : ""}`;
}

/** The whole page: header, tabs, then the Start screen, a fund (its five answers, then details) or a side-by-side view. */
export default function Atlas({ start }: { start?: AtlasStart }) {
  const [viewId, setViewId] = useState<Screen>(start?.view ?? "start");
  const layerId: LayerId = viewId === "all" || viewId === "start" ? DEFAULT_LAYER_ID : viewId;
  // A link that picks a sector, a region or a theme is about the map, so it opens with the details showing. Otherwise a
  // fund opens the way the visitor last left the details (see viewPrefs), so they stay open from fund to fund.
  const [details, setDetails] = useState(
    () => !!(start?.details || start?.sector || start?.select || start?.theme) || (!!start && isFund(start.view) && readViewPrefs().details === true),
  );
  const [sector, setSector] = useState<string | null>(start?.sector ?? null);
  const [selected, setSelected] = useState<string | null>(start?.select ?? null);
  const [sheetOpen, setSheetOpen] = useState(!!start?.select);
  // Credit funds' collapsible Geography section: open unless the visitor last closed it, and always when arriving with a
  // region picked.
  const [geoOpen, setGeoOpen] = useState(() => !!start?.select || (!!start && readViewPrefs().map !== false));
  const [theme, setTheme] = useState<ThemeState>(start?.theme ? { id: start.theme, before: null } : NO_THEME);
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");

  const layer = LAYERS.find((l) => l.id === layerId) ?? LAYERS[0];
  const data = layer.data;
  const latest = latestFor(layer.id);
  const quarter = data ? quarterFigures(data, latest) : undefined;

  const { items: geoItems, split } = useMemo(() => (data ? geoFor(data, sector) : { items: [], split: false }), [data, sector]);

  function changeLayer(id: ViewId) {
    setViewId(id);
    setSector(null);
    setSelected(null);
    window.history.replaceState(window.history.state, "", viewUrl(id, details));
  }

  function showDetails(open: boolean) {
    setDetails(open);
    saveViewPref({ details: open });
    window.history.replaceState(window.history.state, "", viewUrl(viewId, open));
  }

  /** From All funds or the 401(k) tab, further down a long page: switch, then bring the tabs and map back into view. */
  function openLayer(id: ViewId) {
    changeLayer(id);
    window.scrollTo({ top: 0 });
  }

  function select(key: string | null) {
    setSelected(key);
    if (key) {
      setSheetOpen(true);
      setGeoOpen(true);
    }
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

  // The browser tab names the view: "BCRED · Private Markets Atlas", "All funds · …", "Retirement · …".
  const viewTitle = viewId === "start" ? "Start here" : viewId === "all" ? "All funds" : viewId === "retirement" ? "Retirement" : layer.fund;
  useDocumentTitle(`${viewTitle} · ${SITE_NAME}`);
  // A link ending in #id (the tour's "/?view=all#compare-h") lands on that part of the view once it has drawn.
  // Scrolls this window only, so inside the tour's frame the tour page itself stays put.
  useEffect(() => {
    const raw = window.location.hash.slice(1);
    let id = raw;
    try {
      id = decodeURIComponent(raw);
    } catch {
      // A malformed hash ("#100%") is just not an id on this page.
    }
    const el = id ? document.getElementById(id) : null;
    if (el) requestAnimationFrame(() => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16 }));
  }, []);

  // Credit funds lead with their borrowers; the map becomes a smaller section below them.
  const lead = !!data && holdingsLead(data);

  const mapBody = data ? (
    <>
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
    </>
  ) : null;

  return (
    <div
      className="atlas mx-auto w-full max-w-[1400px] px-4 pb-24 pt-5 sm:px-6 lg:pb-10 lg:pt-7"
      style={{ ["--layer-light" as string]: layer.color, ["--layer-dark" as string]: layer.colorDark }}
    >
      <header className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h1 className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink sm:text-[32px]">
              {/* The site's name goes back to the Start screen. */}
              <ViewLink href="/" className="rounded-sm hover:text-accent" title="Start here">
                {SITE_NAME}
              </ViewLink>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-strong">
              {SITE_TAGLINE}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {/* The site opens on the map; the tour is one click away for anyone who wants a guided start. */}
            <TourButton />
            <ClientButton />
            <Link href="/toolkit" className="tap inline-flex h-9 items-center rounded-full border border-line bg-bg-raised px-3 text-xs font-medium text-muted-strong transition-colors hover:text-ink">
              Advisor Toolkit
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-5 border-b border-line">
          <LayerSwitcher layers={LAYERS} activeId={viewId === "start" ? null : viewId} onChange={changeLayer} allFundsAfter="bcred" />
        </div>
      </header>

      {viewId === "start" ? (
        <StartScreen layers={LAYERS} />
      ) : viewId === "all" ? (
        <AllFundsView layers={LAYERS} onOpenLayer={openLayer} />
      ) : viewId === "retirement" ? (
        <RetirementView data={RETIREMENT} layers={LAYERS} onOpenLayer={openLayer} />
      ) : data ? (
        <>
        <FundBrief layer={layer} data={data} details={details} onDetails={showDetails} detailsId={`details-${layer.id}`} />
        {details && (
        <div id={`details-${layer.id}`} data-details>
        {(latest || quarter) && (
          <div className="mb-6 grid items-start gap-3 lg:grid-cols-2">
            {latest && <LatestBox latest={latest} quarterAsOf={data.asOf} fund={toFundCode(layer.id)} />}
            {quarter && <QuarterBox q={quarter} fund={toFundCode(layer.id)} />}
          </div>
        )}
        {/* id: the tour's map steps open the live view here (/?view=breit&details=1#map-breit). */}
        <div id={`map-${layer.id}`} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px]">
          <section aria-label="Map" className="min-w-0">
            <div className="mb-4 space-y-3">
              <ThemeBar layerId={layer.id} sector={sector} onSector={changeSector} theme={theme} onTheme={setTheme} />
              {/* Sectors are picked in the panel's Sector mix; this says what the map is filtered to and clears it. */}
              {sector && (
                <p className="flex flex-wrap items-center gap-2 text-xs text-muted-strong" aria-live="polite">
                  <span>
                    Showing <span className="font-medium text-ink">{data.sectors.find((s) => s.key === sector)?.label ?? sector}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => changeSector(null)}
                    className="tap inline-flex h-7 items-center rounded-full border border-line bg-bg-raised px-2.5 text-xs font-medium text-muted-strong hover:text-ink"
                  >
                    Show all sectors
                  </button>
                </p>
              )}
            </div>
            {lead ? (
              <div className="space-y-4">
                <HoldingsLead data={data} sector={sector} />
                {/* The map is a section below the borrowers, open unless the visitor closed it; picking a region opens it. */}
                <details
                  open={geoOpen}
                  onToggle={(e) => {
                    const open = (e.currentTarget as HTMLDetailsElement).open;
                    setGeoOpen(open);
                    saveViewPref({ map: open });
                  }}
                  className="group rounded-card border border-line bg-bg-raised"
                >
                  <summary className="tap flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 sm:px-5 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">Geography</span>
                      <span className="tnum block truncate text-xs text-muted">
                        {[...data.geography.items]
                          .sort((a, b) => b.pct - a.pct)
                          .slice(0, 2)
                          .map((g) => `${g.label} ${formatPct(g.pct)}`)
                          .join(" · ")}
                        {data.geography.items.length > 2 ? ` · ${data.geography.items.length - 2} more` : ""}
                      </span>
                    </span>
                    <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">
                      +
                    </span>
                  </summary>
                  <div className="border-t border-line p-2 sm:p-4">
                    <div className="mx-auto max-w-[560px]">{mapBody}</div>
                  </div>
                </details>
              </div>
            ) : (
              <div className="rounded-card border border-line bg-bg-raised p-2 sm:p-4">{mapBody}</div>
            )}
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
                <span className="text-sm font-medium text-ink">{selectedLabel ? `${selectedLabel} · ${data.fund}` : `${data.fund} details`}</span>
                <span className="text-xs text-muted-strong">{sheetOpen ? "Hide" : "Show"}</span>
              </span>
            </button>
            <motion.div
              id="sheet-body"
              className="overflow-hidden lg:!h-auto lg:overflow-visible"
              initial={false}
              animate={{ height: sheetOpen ? "auto" : 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.25, ease: [0.2, 0, 0, 1] }}
              // A closed sheet is out of reach: no invisible focus stops, nothing read aloud.
              inert={!sheetOpen && !desktop}
            >
              <div className="px-5 pb-6 pt-1 lg:p-0">
                <DetailPanel layer={layer} data={data} sector={sector} selected={selected} onSelect={select} onSector={changeSector} geoItems={geoItems} />
              </div>
            </motion.div>
          </aside>
        </div>
        </div>
        )}
        </>
      ) : (
        <p className="py-20 text-center text-sm text-muted">This layer is coming in a later phase.</p>
      )}

      {data && isFund(viewId) && <FundPrint data={data} latest={latest} fund={toFundCode(layer.id)} />}

      <SourceFooter
        data={isFund(viewId) ? data : undefined}
        disclosure={viewId === "retirement" && findAddon("retirement-plus") ? ADDON_DISCLOSURE : undefined}
      />
    </div>
  );
}

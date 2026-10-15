"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FundData, LayerDef, ThirdPartyFact } from "@/lib/types";
import type { StateSummary } from "@/lib/aggregate";
import {
  formatDate,
  formatPct,
  metroTotals,
  sectorMix,
  sumPct,
  topStates,
} from "@/lib/aggregate";
import { stateName } from "@/lib/states";
import { LOCATION_BASIS_NOTE } from "@/data/layers";
import SampleBadge from "./SampleBadge";

interface Props {
  layer: LayerDef;
  data: FundData;
  /** Holdings after the sector filter. */
  holdings: FundData["holdings"];
  byState: Map<string, StateSummary>;
  activeSector: string | null;
  selectedState: string | null;
  selectedMetro?: string | null;
  onSelectState: (abbr: string | null) => void;
  onSelectMetro?: (metro: string | null) => void;
  hasSample: boolean;
}

/** Right-hand panel on desktop; bottom sheet on phones. Shows the fund overview or one state. */
export default function DetailPanel(props: Props) {
  const { selectedState, onSelectState } = props;
  const reduce = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the panel heading when a state is picked so keyboard users land on the details.
  useEffect(() => {
    if (selectedState) headingRef.current?.focus();
  }, [selectedState]);

  const content = selectedState ? (
    <StateView
      key={selectedState}
      {...props}
      abbr={selectedState}
      headingRef={headingRef}
    />
  ) : (
    <OverviewView key="overview" {...props} />
  );

  return (
    <div
      id={`panel-${props.layer.id}`}
      role="tabpanel"
      aria-label={`${props.layer.fund} details`}
      className="panel-scroll relative flex max-h-[70vh] flex-col overflow-y-auto lg:max-h-none lg:overflow-visible"
    >
      {props.data.locationBasis === "headquarters" && (
        <div
          role="note"
          className="mb-5 rounded-card border border-line bg-bg px-3.5 py-2.5 text-xs leading-relaxed text-muted-strong"
        >
          <span className="font-medium text-ink">Mapped by headquarters.</span>{" "}
          Each dot is where a company is based, a proxy, not where all of its
          operations sit.
        </div>
      )}
      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${props.layer.id}-${selectedState ?? "overview"}`}
            initial={reduce ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          >
            {content}
          </motion.div>
        </AnimatePresence>
        {selectedState && (
          <button
            type="button"
            onClick={() => onSelectState(null)}
            className="absolute right-0 top-0 inline-flex h-8 items-center gap-1 rounded-full border border-line bg-bg-raised px-3 text-xs text-muted-strong hover:text-ink"
          >
            <span aria-hidden>←</span> Overview
          </button>
        )}
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 border-b border-line pb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-strong">
      {children}
    </h3>
  );
}

function Bars({
  rows,
  total,
}: {
  rows: { label: string; pct: number; sample?: boolean }[];
  total: number;
}) {
  const max = Math.max(...rows.map((r) => r.pct), 0.1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="text-xs">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="truncate text-ink">{r.label}</span>
            <span className="tnum shrink-0 text-muted-strong">
              {formatPct(r.pct)}
              <span className="text-muted">
                {" "}
                · {total > 0 ? Math.round((r.pct / total) * 100) : 0}% of shown
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-map-empty">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${(r.pct / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Facts from outside the filings. Kept visually separate and cited on their own. */
function ContextCard({ facts }: { facts: ThirdPartyFact[] }) {
  if (facts.length === 0) return null;
  return (
    <section
      aria-label="Third-party context"
      className="rounded-card border border-dashed border-muted/60 bg-bg p-4"
    >
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
        Context · not from fund filings
      </p>
      <ul className="space-y-3">
        {facts.map((f) => (
          <li key={f.label} className="text-xs leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="font-medium text-ink">{f.label}</span>
              {f.appliesTo && (
                <span className="rounded-full border border-line px-1.5 text-[10px] text-muted">
                  {f.appliesTo}
                </span>
              )}
              {f.sample && <SampleBadge compact />}
            </div>
            <p className="mt-0.5 text-muted-strong">{f.value}</p>
            <p className="mt-1 text-[11px] text-muted">
              Source:{" "}
              <a
                href={f.source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="underline decoration-line underline-offset-2 hover:text-ink"
              >
                {f.source.name}
              </a>
              {f.asOf && <span className="tnum"> · {formatDate(f.asOf)}</span>}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Which third-party facts apply right now: whole-fund facts, plus facts for sectors in view. */
function relevantFacts(
  data: FundData,
  sectorsInView: string[],
): ThirdPartyFact[] {
  return (data.context ?? []).filter(
    (f) => !f.appliesTo || sectorsInView.includes(f.appliesTo),
  );
}

function OverviewView({
  data,
  holdings,
  byState,
  activeSector,
  onSelectState,
  hasSample,
}: Props) {
  const mapped = sumPct(holdings);
  const top = topStates(byState, 5);
  const mix = sectorMix(holdings, data.sectors);
  return (
    <div className="space-y-7">
      <header className="space-y-3 pr-2">
        <div className="flex items-center gap-2">
          <Eyebrow>
            {data.fund} · {data.assetClass}
          </Eyebrow>
          {hasSample && <SampleBadge compact />}
        </div>
        <h2 className="font-serif text-[28px] font-medium leading-[1.1] tracking-[-0.01em] text-ink">
          {activeSector
            ? `${activeSector} across the United States`
            : `Where ${data.fund} invests`}
        </h2>
        <p className="text-sm leading-relaxed text-muted-strong">
          {data.summary.headline}
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-4 border-y border-line py-4">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.08em] text-muted">
            Mapped share
          </dt>
          <dd className="tnum font-serif text-2xl text-ink">
            {formatPct(mapped)}
          </dd>
          <dd className="text-[11px] text-muted">
            {activeSector
              ? `of the fund in ${activeSector}`
              : "of the fund, by location"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.08em] text-muted">
            States
          </dt>
          <dd className="tnum font-serif text-2xl text-ink">{byState.size}</dd>
          <dd className="text-[11px] text-muted">with mapped holdings</dd>
        </div>
      </dl>

      <section>
        <SectionTitle>Top states</SectionTitle>
        <ol className="divide-y divide-line">
          {top.map((s, i) => (
            <li key={s.state}>
              <button
                type="button"
                onClick={() => onSelectState(s.state)}
                className="group flex w-full items-center gap-3 py-2 text-left text-sm hover:text-accent"
              >
                <span className="tnum w-4 text-xs text-muted">{i + 1}</span>
                <span className="flex-1 text-ink group-hover:text-accent">
                  {stateName(s.state)}
                </span>
                <span className="tnum text-muted-strong">
                  {formatPct(s.totalPct)}
                </span>
                <span
                  aria-hidden
                  className="text-muted transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </button>
            </li>
          ))}
          {top.length === 0 && (
            <li className="py-2 text-sm text-muted">
              No holdings match this filter.
            </li>
          )}
        </ol>
      </section>

      <section>
        <SectionTitle>
          {activeSector ? "Sector shown" : "Sector mix"}
        </SectionTitle>
        <Bars
          rows={mix.map((m) => ({ label: m.sector, pct: m.pct }))}
          total={mapped}
        />
      </section>

      <ContextCard
        facts={relevantFacts(
          data,
          mix.map((m) => m.sector),
        )}
      />

      <p className="text-[11px] leading-relaxed text-muted">
        {LOCATION_BASIS_NOTE[data.locationBasis]}
      </p>
    </div>
  );
}

function StateView({
  data,
  byState,
  abbr,
  activeSector,
  headingRef,
  selectedMetro,
  onSelectMetro,
}: Props & {
  abbr: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const summary = byState.get(abbr);
  const metros = summary ? metroTotals(summary.metros) : [];
  const hqLayer = data.locationBasis === "headquarters";
  /** Disclosed companies for one metro, across all of its sector rows. */
  const companiesFor = (metro: string) =>
    (summary?.metros ?? [])
      .filter((h) => h.metro === metro)
      .flatMap((h) => h.companies ?? []);
  const sectors = summary
    ? Object.entries(summary.bySector)
        .map(([sector, pct]) => ({ label: sector, pct }))
        .sort((a, b) => b.pct - a.pct)
    : [];
  const anySample = summary?.metros.some((m) => m.sample) ?? false;

  return (
    <div className="space-y-7">
      <header className="space-y-3 pr-28">
        <div className="flex items-center gap-2">
          <Eyebrow>
            {data.fund} · {abbr}
          </Eyebrow>
          {anySample && <SampleBadge compact />}
        </div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.01em] text-ink"
        >
          {stateName(abbr)}
        </h2>
        {activeSector && (
          <p className="text-xs text-muted">Showing {activeSector} only.</p>
        )}
      </header>

      {!summary ? (
        <p className="text-sm text-muted">
          No mapped holdings in {stateName(abbr)} for this filter.
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-4 border-y border-line py-4">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.08em] text-muted">
                State total
              </dt>
              <dd className="tnum font-serif text-2xl text-ink">
                {formatPct(summary.totalPct)}
              </dd>
              <dd className="text-[11px] text-muted">of {data.fund}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.08em] text-muted">
                Metros
              </dt>
              <dd className="tnum font-serif text-2xl text-ink">
                {metros.length}
              </dd>
              <dd className="text-[11px] text-muted">with mapped holdings</dd>
            </div>
          </dl>

          <section>
            <SectionTitle>Metros</SectionTitle>
            <ul className="divide-y divide-line">
              {metros.map((m) => {
                const companies = hqLayer ? companiesFor(m.metro) : [];
                const expandable = companies.length > 0;
                const open = expandable && selectedMetro === m.metro;
                const row = (
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <div className="truncate text-ink">
                        {m.metro}, {m.state}
                        {expandable && (
                          <span className="ml-2 text-[11px] text-muted">
                            {companies.length}{" "}
                            {companies.length === 1 ? "company" : "companies"}{" "}
                            {open ? "▴" : "▾"}
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[11px] text-muted">
                        {m.sectors.join(" · ")}
                      </div>
                    </div>
                    <span className="tnum shrink-0 text-muted-strong">
                      {formatPct(m.pct)}
                    </span>
                  </div>
                );
                return (
                  <li key={m.metro} className="py-2">
                    {expandable ? (
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => onSelectMetro?.(open ? null : m.metro)}
                        className="w-full rounded-sm text-left hover:text-accent"
                      >
                        {row}
                      </button>
                    ) : (
                      row
                    )}
                    {open && (
                      <ul className="mt-2 space-y-2 border-l-2 border-line pl-3">
                        {companies.map((c) => (
                          <li key={c.name} className="text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-ink">
                                {c.name}
                              </span>
                              <span className="text-muted">{c.sector}</span>
                              {c.sample && <SampleBadge compact />}
                            </div>
                            <p className="mt-0.5 leading-relaxed text-muted-strong">
                              {c.description}
                            </p>
                          </li>
                        ))}
                        <li className="text-[11px] text-muted">
                          Only companies named in public disclosures are listed.
                        </li>
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <SectionTitle>By sector</SectionTitle>
            <Bars rows={sectors} total={summary.totalPct} />
          </section>

          <ContextCard
            facts={relevantFacts(
              data,
              sectors.map((s) => s.label),
            )}
          />
        </>
      )}
    </div>
  );
}

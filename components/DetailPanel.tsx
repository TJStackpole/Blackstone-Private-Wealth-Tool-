"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FundData, LayerDef, NamedHolding, Share, ThirdPartyFact } from "@/lib/types";
import { formatDate, formatMoneyMillions, formatPct } from "@/lib/aggregate";
import { stateName } from "@/lib/states";
import { NCREIF_REGION } from "@/lib/regions";
import FilingBadge from "./FilingBadge";
import AddonChips from "./addons/shared/AddonChips";

interface Props {
  layer: LayerDef;
  data: FundData;
  sector: string | null;
  /** State code (BREIT) or region / country-group key (other funds). */
  selected: string | null;
  onSelect: (key: string | null) => void;
  /** Geography currently drawn on the map (overall, or the selected sector's split). */
  geoItems: Share[];
}

/** Right-hand panel on desktop; bottom sheet on phones. The fund overview, or one state / region. */
export default function DetailPanel(props: Props) {
  const { selected, onSelect, layer } = props;
  const reduce = useReducedMotion();
  const view = selected ? <SelectionView key={selected} {...props} selected={selected} /> : <Overview key="overview" {...props} />;

  return (
    <div id={`panel-${layer.id}`} role="tabpanel" aria-label={`${layer.fund} details`} className="panel-scroll relative flex max-h-[55vh] flex-col overflow-y-auto lg:max-h-none lg:overflow-visible">
      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${layer.id}-${selected ?? "overview"}`}
            initial={reduce ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            // Exit is near-instant so the previous fund's numbers never linger under a new tab.
            exit={reduce ? { opacity: 1, transition: { duration: 0 } } : { opacity: 0, x: -8, transition: { duration: 0.1 } }}
            transition={reduce ? { duration: 0 } : { duration: 0.25, ease: [0.2, 0, 0, 1] }}
          >
            {view}
          </motion.div>
        </AnimatePresence>
        {selected && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="absolute right-0 top-0 inline-flex h-8 items-center gap-1 rounded-full border border-line bg-bg-raised px-3 text-xs text-muted-strong hover:text-ink"
          >
            <span aria-hidden>←</span> Overview
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- small building blocks */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">{children}</p>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 border-b border-line pb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-strong">{children}</h3>;
}

function Basis({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-[11px] leading-relaxed text-muted">{children}</p>;
}

function Bars({ rows, highlight }: { rows: Share[]; highlight?: string | null }) {
  const max = Math.max(...rows.map((r) => r.pct), 0.1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => {
        const dim = highlight && r.key !== highlight;
        return (
          <li key={r.key} className={["text-xs transition-opacity", dim ? "opacity-45" : ""].join(" ")}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="truncate text-ink">{r.label}</span>
              <span className="tnum shrink-0 text-muted-strong">{formatPct(r.pct)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-map-empty">
              <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${(r.pct / max) * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Stats({ data }: { data: FundData }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-line py-4">
      {data.summary.stats.map((s) => (
        <div key={s.label}>
          <dt className="text-[11px] uppercase tracking-[0.08em] text-muted">{s.label}</dt>
          <dd className="tnum font-serif text-2xl text-ink">{s.value}</dd>
          {s.note && <dd className="text-[11px] leading-snug text-muted">{s.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

function Holdings({ items, sector }: { items: NamedHolding[]; sector: string | null }) {
  const shown = sector ? items.filter((h) => h.sector === sector) : items;
  if (shown.length === 0) return <p className="text-xs text-muted">The filing names no {sector ? `${sector} ` : ""}holdings individually.</p>;
  return (
    <ol className="divide-y divide-line">
      {shown.map((h) => (
        <li key={h.name} className="py-2 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 text-ink">{h.name}</span>
            <span className="tnum shrink-0 text-muted-strong">{formatPct(h.pctOfNetAssets)}</span>
          </div>
          <div className="tnum flex justify-between gap-3 text-[11px] text-muted">
            <span className="truncate">
              {h.sector}
              {h.geo ? ` · ${h.geo}` : ""}
            </span>
            <span className="shrink-0">{formatMoneyMillions(h.fairValueMillions)}</span>
          </div>
          {h.note && <p className="mt-1 text-[11px] leading-relaxed text-muted-strong">{h.note}</p>}
        </li>
      ))}
    </ol>
  );
}

/** Facts from outside the filings. Visually separate and cited on their own. */
function ContextCard({ facts }: { facts: ThirdPartyFact[] }) {
  if (facts.length === 0) return null;
  return (
    <section aria-label="Third-party context" className="rounded-card border border-dashed border-muted/60 bg-bg p-4">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-muted">Context · not from fund filings</p>
      <ul className="space-y-3">
        {facts.map((f) => (
          <li key={f.label} className="text-xs leading-relaxed">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink">{f.label}</span>
              {f.appliesTo && <span className="rounded-full border border-line px-1.5 text-[10px] text-muted">{f.appliesTo}</span>}
            </div>
            <p className="mt-0.5 text-muted-strong">{f.value}</p>
            <p className="mt-1 text-[11px] text-muted">
              Source:{" "}
              <a href={f.source.url} target="_blank" rel="noreferrer noopener" className="underline decoration-line underline-offset-2 hover:text-ink">
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

/* ---------------------------------------------------------------- overview */

function Overview({ layer, data, sector, geoItems, onSelect }: Props) {
  const facts = (data.context ?? []).filter((f) => !f.appliesTo || !sector || f.appliesTo === sector);
  const sectorLabel = data.sectors.find((s) => s.key === sector)?.label;
  return (
    <div className="space-y-7">
      <header className="space-y-3 pr-2">
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow>
            {data.fund} · {data.assetClass}
          </Eyebrow>
          <FilingBadge data={data} />
        </div>
        <h2 className="font-serif text-[28px] font-medium leading-[1.1] tracking-[-0.01em] text-ink">
          {sectorLabel ? `${sectorLabel} in ${data.fund}` : `Where ${data.fund} invests`}
        </h2>
        <p className="text-sm leading-relaxed text-muted-strong">{data.summary.headline}</p>
      </header>

      <Stats data={data} />

      <AddonChips fundId={layer.id} />

      <section>
        <SectionTitle>Sector mix</SectionTitle>
        <Bars rows={data.sectors} highlight={sector} />
        <Basis>{data.sectorBasis}</Basis>
      </section>

      <section>
        <SectionTitle>{sectorLabel && data.geography.bySector?.[sector!] ? `Where ${sectorLabel} sits` : "Geography"}</SectionTitle>
        <Bars rows={geoItems} />
        <Basis>{sectorLabel && data.geography.bySector?.[sector!] ? data.geography.bySectorBasis : data.geography.basis}</Basis>
      </section>

      {data.geography.topStates && (
        <section>
          <SectionTitle>Largest states</SectionTitle>
          <ol className="divide-y divide-line">
            {data.geography.topStates.map((t) => (
              <li key={t.state}>
                <button type="button" onClick={() => onSelect(t.state)} className="group flex w-full items-center gap-3 py-2 text-left text-sm">
                  <span className="flex-1 text-ink group-hover:text-accent">{stateName(t.state)}</span>
                  <span className="tnum text-muted-strong">{formatPct(t.pct)}</span>
                  <span aria-hidden className="text-muted transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </li>
            ))}
          </ol>
          {data.investmentsNote && <Basis>{data.investmentsNote}</Basis>}
        </section>
      )}

      {data.topHoldings && (
        <section>
          <SectionTitle>{sectorLabel ? `Named ${sectorLabel} holdings` : "Named holdings"} · % of net assets</SectionTitle>
          <Holdings items={data.topHoldings.items} sector={sector} />
          <Basis>{data.topHoldings.basis}</Basis>
        </section>
      )}

      {data.thisQuarter && (
        <section>
          <SectionTitle>This quarter, per the filing</SectionTitle>
          <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-muted-strong">
            {data.thisQuarter.map((t) => (
              <li key={t.slice(0, 40)}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      {data.howItWorks && (
        <section aria-label={data.howItWorks.title} className="rounded-card border border-line bg-bg p-4">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h3 className="font-serif text-base font-medium text-ink">{data.howItWorks.title}</h3>
            <span className="tnum text-[11px] text-muted">As of {formatDate(data.howItWorks.asOf)}</span>
          </div>
          <div className="space-y-2 text-xs leading-relaxed text-muted-strong">
            {data.howItWorks.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          {data.howItWorks.source && (
            <p className="mt-2 text-[11px] text-muted">
              Source:{" "}
              <a href={data.howItWorks.source.url} target="_blank" rel="noreferrer noopener" className="underline decoration-line underline-offset-2 hover:text-ink">
                {data.howItWorks.source.name}
              </a>
            </p>
          )}
        </section>
      )}

      {data.website && (
        <section aria-label="From the fund's website" className="rounded-card border border-line bg-bg p-4 text-xs leading-relaxed">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.1em] text-muted">From the fund&apos;s website</p>
          <p className="text-muted-strong">{data.website.text}</p>
          <p className="mt-1 text-[11px] text-muted">
            Source:{" "}
            <a href={data.website.source.url} target="_blank" rel="noreferrer noopener" className="underline decoration-line underline-offset-2 hover:text-ink">
              {data.website.source.name}
            </a>
          </p>
        </section>
      )}

      <ContextCard facts={facts} />

      <section aria-label="What the filing does not say" className="rounded-card border border-line bg-bg p-4">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-muted">What the filing doesn&apos;t say</p>
        <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-strong">
          {data.notDisclosed.map((n) => (
            <li key={n.slice(0, 40)}>{n}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- one state or region */

function SelectionView(props: Props & { selected: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Focus the heading once this view is on screen, so keyboard users land on the details.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);
  return props.data.geography.level === "us-region" ? <StateView {...props} headingRef={headingRef} /> : <RegionView {...props} headingRef={headingRef} />;
}

type ViewProps = Props & { selected: string; headingRef: React.RefObject<HTMLHeadingElement | null> };

function StateView({ data, selected: abbr, sector, headingRef }: ViewProps) {
  const region = NCREIF_REGION[abbr];
  const regionShare = data.geography.items.find((i) => i.key === region);
  const top = data.geography.topStates?.find((t) => t.state === abbr);
  const all = (data.investments ?? []).filter((i) => i.states.includes(abbr));
  const list = sector ? all.filter((i) => i.sector === sector) : all;
  const props = list.reduce((t, i) => t + i.properties, 0);

  return (
    <div className="space-y-7">
      <header className="space-y-3 pr-28">
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow>
            {data.fund} · {region} region
          </Eyebrow>
          <FilingBadge data={data} />
        </div>
        <h2 ref={headingRef} tabIndex={-1} className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.01em] text-ink">
          {stateName(abbr)}
        </h2>
      </header>

      <dl className="grid grid-cols-2 gap-4 border-y border-line py-4">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.08em] text-muted">{stateName(abbr)}</dt>
          <dd className="tnum font-serif text-2xl text-ink">{top ? formatPct(top.pct) : "Not reported"}</dd>
          <dd className="text-[11px] leading-snug text-muted">{top ? "of real estate; one of the three largest states" : "the filing gives no figure for this state"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.08em] text-muted">{region} region</dt>
          <dd className="tnum font-serif text-2xl text-ink">{regionShare ? formatPct(regionShare.pct) : "—"}</dd>
          <dd className="text-[11px] leading-snug text-muted">of real estate, all sectors (NCREIF regions)</dd>
        </div>
      </dl>

      <section>
        <SectionTitle>
          Named {sector ? `${sector} ` : ""}investments listed in {stateName(abbr)} · {list.length}
        </SectionTitle>
        {list.length === 0 ? (
          <p className="text-xs leading-relaxed text-muted">
            The filing lists no {sector ? `${sector.toLowerCase()} ` : ""}investment with a {stateName(abbr)} address. Properties here may still sit inside
            portfolios the filing lists as &lsquo;Various&rsquo;.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {list.map((i) => (
              <li key={`${i.name}-${i.location}`} className="py-2 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 text-ink">{i.name}</span>
                  <span className="tnum shrink-0 text-[11px] text-muted-strong">
                    {i.properties} {i.properties === 1 ? "property" : "properties"}
                  </span>
                </div>
                <div className="tnum text-[11px] text-muted">
                  {i.sector} · {i.location} · {i.size}
                  {i.occupancy && i.occupancy !== "n/a" ? ` · ${i.occupancy} occupied` : ""} · {i.ownership} owned · since {i.acquired}
                </div>
              </li>
            ))}
          </ul>
        )}
        {list.length > 0 && (
          <Basis>
            {props.toLocaleString("en-US")} {props === 1 ? "property" : "properties"} across these investments. The 10-Q gives no dollar value per investment.
          </Basis>
        )}
      </section>
    </div>
  );
}

function RegionView({ data, selected, sector, geoItems, headingRef }: ViewProps) {
  const share = geoItems.find((g) => g.key === selected);
  const sectorLabel = data.sectors.find((s) => s.key === sector)?.label;
  const holdings = (data.topHoldings?.items ?? []).filter((h) => h.geo === selected && (!sector || h.sector === sector));
  const isCountryGroup = data.geography.level === "country-group";

  return (
    <div className="space-y-7">
      <header className="space-y-3 pr-28">
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow>{data.fund} · {isCountryGroup ? "Country group" : "Region"}</Eyebrow>
          <FilingBadge data={data} />
        </div>
        <h2 ref={headingRef} tabIndex={-1} className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.01em] text-ink">
          {share?.label ?? selected}
        </h2>
      </header>

      <dl className="border-y border-line py-4">
        <dt className="text-[11px] uppercase tracking-[0.08em] text-muted">Share</dt>
        <dd className="tnum font-serif text-2xl text-ink">{share ? formatPct(share.pct) : "—"}</dd>
        <dd className="text-[11px] text-muted">of {sectorLabel ? `${data.fund}'s ${sectorLabel} holdings` : data.fund}</dd>
      </dl>

      {!isCountryGroup && (
        <section>
          <SectionTitle>Named holdings here · % of net assets</SectionTitle>
          {holdings.length === 0 ? (
            <p className="text-xs leading-relaxed text-muted">The filing names no individual holding in this region{sectorLabel ? ` for ${sectorLabel}` : ""}. They are grouped as &lsquo;Other investments&rsquo;.</p>
          ) : (
            <Holdings items={holdings} sector={null} />
          )}
        </section>
      )}

      <p className="text-xs leading-relaxed text-muted-strong">
        {isCountryGroup
          ? "The 10-Q reports this group as one figure. It doesn't say which borrowers are in it, or how the share splits between countries."
          : "The 10-Q reports this region as one figure. Every country in it is shaded the same because the filing gives no country detail."}
      </p>
    </div>
  );
}

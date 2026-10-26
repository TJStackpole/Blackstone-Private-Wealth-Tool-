import type { FundData } from "@/lib/types";
import { formatPct } from "@/lib/aggregate";
import { formatDate } from "@/lib/dates";
import { nextUpdate } from "@/lib/schedule";
import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import type { Source } from "@/lib/types";
import type { LatestUpdate } from "@/lib/latest";
import type { FundCode } from "@/config/addons";
import { quarterFigures } from "@/lib/quarter";
import { TERMS, termsFor } from "@/lib/addons/liquidity/data";
import { COMPARE_ROWS } from "@/lib/compare";
import { SITE_NAME } from "./SiteMark";

/**
 * A fund's page on one sheet of paper: title, the latest month and the last quarter, getting money out, the sector mix,
 * sources and the disclaimer. Print-only; the page's "Print / Save as PDF" buttons open it. Every figure is the same
 * one the page shows, once.
 */
export default function FundPrint({ data, latest, fund }: { data: FundData; latest?: LatestUpdate; fund?: FundCode }) {
  const next = nextUpdate(data.asOf);
  const sectors = [...data.sectors].sort((a, b) => b.pct - a.pct);
  const top = sectors[0]?.pct || 1;
  const geo = [...data.geography.items].sort((a, b) => b.pct - a.pct);
  const q = quarterFigures(data, latest);
  const terms = fund ? termsFor(fund) : undefined;
  const lastRound = fund ? COMPARE_ROWS.find((r) => r.id === "prorated")?.cells[fund] : undefined;
  const lastRoundLabel = COMPARE_ROWS.find((r) => r.id === "prorated")?.label;
  const word = terms && /units/.test(terms.limits[0].unit) ? "Units" : "Shares";
  const sources: Source[] = [
    ...(latest ? [...latest.items.flatMap((i) => i.sources), ...latest.notes.flatMap((n) => n.sources)] : []),
    data.source,
    ...(q ? [q.source, ...(q.moreSources ?? [])] : []),
    ...(terms ? [terms.limits[0].source, terms.earlyDeduction.source] : []),
    ...(lastRound?.sources ?? []),
  ].filter(
    (src, i, all) => all.findIndex((o) => o.url === src.url) === i,
  );
  const entity = data.filing.entity.replace(/\.$/, "");
  return (
    <PrintOnePager title={`${data.fund} one-pager`} screen={false} button={false}>
      <div className="space-y-3 text-[11px] leading-snug" data-fund-print={data.fund}>
        <header className="border-b pb-2">
          <p className="text-[9px] uppercase tracking-[0.12em]">
            {SITE_NAME} · Fund one-pager · Independent, built from public SEC filings
          </p>
          <h1 className="font-serif text-[24px] leading-tight">
            {data.fund} · {data.assetClass}
          </h1>
          <p>
            {entity}. SEC Form {data.filing.form}, period ended {formatDate(data.asOf, "long")}, filed {formatDate(data.filing.filed, "long")}.
            {next && ` Next update expected: ${next.month}.`}
          </p>
          <p className="mt-1">{data.summary.headline}</p>
        </header>

        {latest && (
          <section data-print-latest>
            <h2 className="text-[11px] font-semibold">
              Latest monthly update · values at {formatDate(latest.asOf, "long")}, filed {formatDate(latest.filed, "long")}
            </h2>
            <table className="mt-1 w-full border text-left">
              <tbody>
                <tr>
                  {latest.items.map((m) => (
                    <td key={m.label} className="border px-2 py-1 align-top" style={{ width: `${100 / latest.items.length}%` }}>
                      <span className="block text-[9px] uppercase tracking-[0.08em]">{m.label}</span>
                      <span className="tnum block font-serif text-[16px]">
                        {m.value} {m.change && <span className="text-[10px]">({m.change})</span>}
                      </span>
                      <span className="block text-[10px]">{m.from}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            {latest.notes.length > 0 && <p className="mt-1 text-[10px]">{latest.notes.map((n) => n.text).join(" ")}</p>}
          </section>
        )}

        {q ? (
          <section>
            <h2 className="text-[11px] font-semibold">Last quarterly report · {q.period}</h2>
            <table className="mt-1 w-full border text-left">
              <tbody>
                <tr>
                  {q.items.map((m) => (
                    <td key={m.label} className="border px-2 py-1 align-top" style={{ width: `${100 / q.items.length}%` }}>
                      <span className="block text-[9px] uppercase tracking-[0.08em]">{m.label}</span>
                      <span className="tnum block font-serif text-[16px]">
                        {m.value} {m.change && <span className="text-[10px]">({m.change})</span>}
                      </span>
                      <span className="block text-[10px]">{m.from}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            {data.sizeNote && <p className="mt-1 text-[10px]">{data.sizeNote}</p>}
          </section>
        ) : data.thisQuarter?.length ? (
          <section>
            <h2 className="text-[11px] font-semibold">This quarter</h2>
            <ul className="mt-1 list-disc pl-4">
              {data.thisQuarter.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {terms && (
          <section data-print-liquidity>
            <h2 className="text-[11px] font-semibold">Getting money out · as of {formatDate(TERMS.asOf, "long")}</h2>
            <p className="mt-0.5">
              {terms.howOften}. {terms.limits.map((l) => `${l.label}: ${l.value}${l.unit}`).join("; ")}. {word} held less than {terms.earlyDeduction.heldUnder} are
              bought back at {100 - terms.earlyDeduction.value}% of NAV. {terms.discretion}
              {lastRound?.value && ` ${lastRoundLabel?.replace(/\?$/, "")}: ${lastRound.value}. ${lastRound.note ?? ""}`}
            </p>
          </section>
        )}

        <section className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-5">
          <div>
            <h2 className="text-[11px] font-semibold">Sector mix</h2>
            <p className="text-[10px]">{data.sectorBasis}</p>
            <ul className="mt-1 space-y-0.5">
              {sectors.map((s) => (
                <li key={s.key} className="grid grid-cols-[minmax(0,1fr)_90px_36px] items-center gap-2">
                  <span className="truncate">{s.label}</span>
                  <span aria-hidden className="block border-t-[6px]" style={{ width: `${Math.max(2, (s.pct / top) * 100)}%` }} />
                  <span className="tnum text-right">{formatPct(s.pct)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-[11px] font-semibold">Geography</h2>
            <p className="text-[10px]">{data.geography.basis}</p>
            {data.geography.topStates && (
              <p className="mt-1 text-[10px]">
                Largest states named in the filing: {data.geography.topStates.map((t) => `${t.state} ${formatPct(t.pct)}`).join(", ")}.
              </p>
            )}
            <ul className="mt-1 space-y-0.5">
              {geo.map((g) => (
                <li key={g.key} className="flex justify-between gap-2">
                  <span>{g.label}</span>
                  <span className="tnum">{formatPct(g.pct)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-semibold">Sources</h2>
          <ul className="space-y-0.5 text-[10px]">
            {sources.map((src) => (
              <li key={src.url}>
                {src.name}
                {src.page ? `, ${src.page}` : ""}: {src.url}
              </li>
            ))}
          </ul>
        </section>

        <footer className="border-t pt-1.5 text-[9px]">
          <p>
            Figures are parsed from the filing and checked against the totals it prints; percentages are the fund&apos;s own, rounded as reported. Not
            investment advice. Independent prototype built from public filings. Not affiliated with or endorsed by Blackstone.
          </p>
        </footer>
      </div>
    </PrintOnePager>
  );
}

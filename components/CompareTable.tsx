"use client";

import { useRef, useState } from "react";
import type { FundCode } from "@/config/addons";
import Glossed from "./Glossed";
import { useMediaQuery } from "./useMediaQuery";
import { COMPARE, COMPARE_ROWS, type CompareCell } from "@/lib/compare";
import { LATEST } from "@/lib/latest";
import { nextUpdate } from "@/lib/schedule";
import { FUNDS } from "@/lib/addons/shared/funds";
import { formatDate } from "@/lib/dates";
import NextUpdate from "./NextUpdate";
import { useEdgeFade } from "./useEdgeFade";

function Cell({ c, sources }: { c: CompareCell; sources: boolean }) {
  if (c.value === null)
    return (
      <span className="text-xs italic text-muted" title={c.where ? `Would come from: ${c.where}` : undefined}>
        {c.missing ?? "Not in filing"}
      </span>
    );
  return (
    <div className="space-y-1">
      <p className="tnum text-sm font-medium text-ink">{c.value}</p>
      {c.note && <p className="text-[11px] leading-snug text-muted-strong">{c.note}</p>}
      {c.sources && (
        <p className={["text-[11px] leading-snug text-muted", sources ? "" : "hidden print:block"].join(" ")}>
          {c.sources.map((s, i) => (
            <span key={`${s.url}-${i}`}>
              {i > 0 && " · "}
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                title={s.page ? `${s.name}, ${s.page}` : s.name}
                className="underline decoration-line underline-offset-2 hover:text-ink"
              >
                {s.name.replace(/, (quarter|year) ended .*$/, "").replace(/ \(SEC filing\)$/, "")}
              </a>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

/** "Next updates expected: November 2026 (…)", from the monthly and quarterly schedules. */
function nextLine() {
  const m = nextUpdate(LATEST.asOf, "monthly");
  const q = nextUpdate(COMPARE.asOf);
  if (!m || !q) return <NextUpdate asOf={COMPARE.asOf} />;
  return m.month === q.month ? (
    <span className="tnum" title={`${m.basis} ${q.basis}`}>
      Next updates expected: {q.month} (the next month-end NAVs and the 10-Qs).
    </span>
  ) : (
    <>
      <NextUpdate asOf={LATEST.asOf} cadence="monthly" /> (monthly); <NextUpdate asOf={COMPARE.asOf} /> (10-Q).
    </>
  );
}

/**
 * The funds compared on the questions advisors get most. Every cell comes from that fund's own filing. Pick which funds
 * to see (two at a time on a phone, so the table fits); the sources behind every cell are one switch away.
 */
export default function CompareTable({ onOpen }: { onOpen?: (f: FundCode) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  useEdgeFade(scroller);
  const phone = useMediaQuery("(max-width: 767px)");
  const [picked, setPicked] = useState<FundCode[] | null>(null);
  const funds = picked ?? (phone ? (["BREIT", "BCRED"] as FundCode[]) : COMPARE.funds);
  const [sources, setSources] = useState(false);
  const toggle = (f: FundCode) => {
    const next = funds.includes(f) ? funds.filter((x) => x !== f) : COMPARE.funds.filter((x) => x === f || funds.includes(x));
    if (next.length >= 2) setPicked(next);
  };
  return (
    <section aria-labelledby="compare-h" className="space-y-3">
      <div>
        <h2 id="compare-h" className="font-serif text-[22px] font-medium leading-tight text-ink">
          Compare the funds
        </h2>
        <p className="mt-1 text-sm text-muted-strong">Each cell comes from that fund&apos;s own filing. Where a filing doesn&apos;t say, the cell says so.</p>
      </div>
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Funds to compare (at least two)" className="flex flex-wrap gap-1.5">
          {COMPARE.funds.map((f) => {
            const on = funds.includes(f);
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(f)}
                className={[
                  "tap inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                  on ? "border-ink bg-bg-raised text-ink" : "border-line text-muted hover:text-ink",
                ].join(" ")}
              >
                <span aria-hidden className="tab-dot h-2 w-2 rounded-full" style={{ ["--tab-light" as string]: FUNDS[f].color, ["--tab-dark" as string]: FUNDS[f].colorDark }} />
                {FUNDS[f].label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-pressed={sources}
          onClick={() => setSources((v) => !v)}
          className="tap text-xs text-muted-strong underline decoration-line underline-offset-2 hover:text-ink"
        >
          {sources ? "Hide sources" : "Show sources"}
        </button>
      </div>
      <div ref={scroller} className="edge-fade overflow-x-auto rounded-card border border-line bg-bg-raised">
        <table className={["w-full border-collapse text-left", funds.length > 2 ? "min-w-[720px]" : ""].join(" ")}>
          <caption className="sr-only">{funds.map((f) => FUNDS[f].label).join(", ")} compared, from each fund&apos;s filings</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="sticky left-0 z-10 w-[112px] bg-bg-raised px-3 py-3 sm:w-[170px] sm:px-4 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                <span className="sr-only">Question</span>
              </th>
              {funds.map((f) => (
                <th key={f} scope="col" className="px-4 py-3 text-sm font-medium text-ink">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span aria-hidden className="tab-dot h-2 w-2 rounded-full" style={{ ["--tab-light" as string]: FUNDS[f].color, ["--tab-dark" as string]: FUNDS[f].colorDark }} />
                    {onOpen ? (
                      <button type="button" onClick={() => onOpen(f)} className="underline decoration-line underline-offset-4 hover:decoration-ink" aria-label={`Open ${FUNDS[f].label}`}>
                        {FUNDS[f].label}
                      </button>
                    ) : (
                      FUNDS[f].label
                    )}
                    <span className="text-[11px] font-normal text-muted">{FUNDS[f].assetClass}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line align-top">
            {COMPARE_ROWS.map((r) => (
              <tr key={r.id} data-compare-row={r.id}>
                <th scope="row" className="sticky left-0 z-10 bg-bg-raised px-3 py-3 text-left font-normal shadow-[1px_0_0_var(--border)] sm:px-4 sm:shadow-none">
                  <span className="block text-[13px] font-medium text-ink sm:text-sm">
                    <Glossed text={r.label} />
                  </span>
                  {r.help && <span className="mt-0.5 block text-[11px] leading-snug text-muted">{r.help}</span>}
                </th>
                {funds.map((f) => (
                  <td key={f} className="px-4 py-3" data-fund={f}>
                    <Cell c={r.cells[f]} sources={sources} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        <span className="tnum">Value per share and distribution rate: {formatDate(LATEST.asOf)}</span>, from each fund&apos;s month-end filing.{" "}
        <span className="tnum">Everything else: {formatDate(COMPARE.asOf)}</span>, from each fund&apos;s 10-Q (BCRED&apos;s buybacks: its letters to investors).
        Distribution rates annualize the latest Class I distribution; they are not total returns. {nextLine()}
      </p>
    </section>
  );
}

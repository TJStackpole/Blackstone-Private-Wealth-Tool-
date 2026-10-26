"use client";

import { useRef } from "react";
import { COMPARE, COMPARE_ROWS, type CompareCell } from "@/lib/compare";
import { LATEST } from "@/lib/latest";
import { nextUpdate } from "@/lib/schedule";
import { FUNDS } from "@/lib/addons/shared/funds";
import { formatDate } from "@/lib/dates";
import NextUpdate from "./NextUpdate";
import { useEdgeFade } from "./useEdgeFade";

function Cell({ c }: { c: CompareCell }) {
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
        <p className="text-[11px] leading-snug text-muted">
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

/** The four funds compared on the questions advisors get most. Every cell comes from that fund's own filing. */
export default function CompareTable() {
  const scroller = useRef<HTMLDivElement>(null);
  useEdgeFade(scroller);
  return (
    <section aria-labelledby="compare-h" className="space-y-3">
      <div>
        <h2 id="compare-h" className="font-serif text-[22px] font-medium leading-tight text-ink">
          The four funds, compared
        </h2>
        <p className="mt-1 text-sm text-muted-strong">Each cell comes from that fund&apos;s own filing. Where a filing doesn&apos;t say, the cell says so.</p>
      </div>
      <div ref={scroller} className="edge-fade overflow-x-auto rounded-card border border-line bg-bg-raised">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">BREIT, BX Infra, BXPE and BCRED compared, from each fund&apos;s filings</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="sticky left-0 z-10 w-[124px] bg-bg-raised px-3 py-3 sm:w-[170px] sm:px-4 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                <span className="sr-only">Question</span>
              </th>
              {COMPARE.funds.map((f) => (
                <th key={f} scope="col" className="px-4 py-3 text-sm font-medium text-ink">
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="tab-dot h-2 w-2 rounded-full" style={{ ["--tab-light" as string]: FUNDS[f].color, ["--tab-dark" as string]: FUNDS[f].colorDark }} />
                    {FUNDS[f].label}
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
                  <span className="block text-[13px] font-medium text-ink sm:text-sm">{r.label}</span>
                  {r.help && <span className="mt-0.5 block text-[11px] leading-snug text-muted">{r.help}</span>}
                </th>
                {COMPARE.funds.map((f) => (
                  <td key={f} className="px-4 py-3" data-fund={f}>
                    <Cell c={r.cells[f]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        <span className="tnum">Distribution rate and NAV change: values at {formatDate(LATEST.asOf)}</span>, from each fund&apos;s latest monthly filing (an
        8-K; BREIT&apos;s NAV prospectus supplement), with December 31 NAVs from its 10-K (BCRED&apos;s from its 10-Q).{" "}
        <span className="tnum">Everything else: as of {formatDate(COMPARE.asOf)}</span>, from each fund&apos;s 10-Q and, for BCRED&apos;s buybacks, its September
        3, 2026 letter to investors. Distribution rates annualize the latest declared Class I distribution over that NAV; they are not total returns.
        Minimum investment is set in each fund&apos;s offering documents, not its periodic filings. {nextLine()}
      </p>
    </section>
  );
}

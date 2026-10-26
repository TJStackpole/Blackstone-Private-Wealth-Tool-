"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { PrintSized } from "@/components/addons/shared/PrintSized";
import { DEFAULTS, compare } from "@/lib/addons/drawdown-vs-evergreen/model";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";
import { NumberInput, PercentInput } from "@/components/addons/shared/Inputs";
import MoreDetails from "@/components/addons/shared/MoreDetails";

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const short = (n: number) => (n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${Math.round(n / 1000)}k`);

/** "% of money at work": a drawdown commitment called over time vs. the same amount invested on day one. */
export default function CashDrag({ compact = false }: { compact?: boolean }) {
  const [commitment, setCommitment] = useState(DEFAULTS.commitment);
  const [perYear, setPerYear] = useState(25);
  const [cashYield, setCashYield] = useState(DEFAULTS.cashYieldPct);
  const [assetReturn, setAssetReturn] = useState(DEFAULTS.assetReturnPct);
  const [ddFee, setDdFee] = useState(DEFAULTS.drawdownFeePct);
  const [egFee, setEgFee] = useState(DEFAULTS.evergreenFeePct);
  const [distStart, setDistStart] = useState(DEFAULTS.distributionStartYear);
  const [distPct, setDistPct] = useState(DEFAULTS.distributionPct);

  const schedule = useMemo(() => {
    const p = Math.max(1, Math.min(100, perYear));
    const out: number[] = [];
    let left = 100;
    while (left > 1e-9) {
      out.push(Math.min(p, left));
      left -= p;
    }
    return out;
  }, [perYear]);

  const r = useMemo(
    () =>
      compare({
        ...DEFAULTS,
        commitment,
        callSchedulePct: schedule,
        cashYieldPct: cashYield,
        assetReturnPct: assetReturn,
        drawdownFeePct: ddFee,
        evergreenFeePct: egFee,
        distributionStartYear: distStart,
        distributionPct: distPct,
      }),
    [commitment, schedule, cashYield, assetReturn, ddFee, egFee, distStart, distPct],
  );
  const data = r.rows.map((y) => ({ year: `Y${y.year}`, drawdown: +y.drawdownAtWorkPct.toFixed(1), evergreen: +y.evergreenAtWorkPct.toFixed(1) }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <p className="text-xs text-muted-strong">
          Called {schedule.length === 1 ? "all at once" : `${perYear}% a year over ${schedule.length} years`} · same {assetReturn}% asset return for both
        </p>
        <IllustrativeBadge />
      </div>

      <p className="rounded-card border border-line bg-bg-raised p-4 sm:p-5 font-serif text-lg leading-snug text-ink print:p-2 print:text-sm" aria-live="polite">
        Over {DEFAULTS.years} years, about {Math.round(r.averageDrawdownAtWorkPct)}% of the drawdown money was at work on average. Ending value: {short(r.drawdownEnd)} for
        drawdown vs. {short(r.evergreenEnd)} for evergreen, from {short(commitment)}.
      </p>
      <p className="hidden text-[10px] print:block">
        Assumptions: {short(commitment)} committed, called {schedule.length === 1 ? "all at once" : `${perYear}% a year over ${schedule.length} years`}; {assetReturn}% asset return for both;{" "}
        {cashYield}% on waiting cash; fees {ddFee}% drawdown, {egFee}% evergreen; drawdown returns {distPct}% of its value a year from year {distStart}. Performance fees and taxes left out.
      </p>

      <figure className="space-y-2 print:hidden">
        <div className={compact ? "h-48" : "h-64 print:h-40"} role="img" aria-label={`Share of money at work by year: ${data.map((d) => `${d.year} drawdown ${d.drawdown}%`).join(", ")}; evergreen 100% throughout`}>
          <PrintSized height={160} off={compact}>
            <LineChart accessibilityLayer={false} data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-strong)" }} />
              <Line type="stepAfter" dataKey="evergreen" name="Evergreen: % at work" stroke="var(--muted)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="stepAfter" dataKey="drawdown" name="Drawdown: % at work" stroke="var(--accent)" strokeWidth={2} dot={{ r: 2.5 }} isAnimationActive={false} />
            </LineChart>
          </PrintSized>
        </div>
        <figcaption className="text-xs leading-relaxed text-muted">
          Same return assumed for both, so the gap is timing and fees only. Leaves out performance fees, taxes and redemption cash.
        </figcaption>
      </figure>

      {!compact && (
        <>
          <div className="no-print grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberInput label="Commitment" value={commitment} onChange={setCommitment} min={0} step={500000} prefix="$" />
            <PercentInput label="Called each year" value={perYear} onChange={setPerYear} min={1} help="25 means four equal calls. 100 means all on day one." />
            <PercentInput label="Asset return, both (assumption)" value={assetReturn} onChange={setAssetReturn} />
            <PercentInput label="Yield on waiting cash (assumption)" value={cashYield} onChange={setCashYield} />
            <PercentInput label="Drawdown fee (assumption)" value={ddFee} onChange={setDdFee} help="Charged on the full commitment while money is being called, then on invested value." />
            <PercentInput label="Evergreen fee" value={egFee} onChange={setEgFee} help={`Default: BXPE's ${DEFAULTS.evergreenFeePct}% management fee, from its 10-Q.`} />
            <NumberInput label="Drawdown returns money from year" value={distStart} onChange={(v) => setDistStart(Math.round(v))} min={1} max={20} step={1} />
            <PercentInput label="Share of fund returned each year after that" value={distPct} onChange={setDistPct} />
          </div>
          <MoreDetails summary="Year by year" hint="Share at work and value of each structure">
          <div className="overflow-x-auto rounded-card border border-line print:hidden">
            <table className="tnum w-full min-w-[520px] text-right text-sm">
              <caption className="sr-only">Year-by-year comparison</caption>
              <thead className="bg-bg-raised text-[11px] uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Year</th>
                  <th scope="col" className="px-3 py-2 font-medium">Drawdown at work</th>
                  <th scope="col" className="px-3 py-2 font-medium">Drawdown value</th>
                  <th scope="col" className="px-3 py-2 font-medium">Evergreen value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {r.rows.map((y) => (
                  <tr key={y.year}>
                    <th scope="row" className="px-3 py-1.5 text-left font-normal text-ink">{y.year}</th>
                    <td className="px-3 py-1.5 text-muted-strong">{y.drawdownAtWorkPct.toFixed(0)}%</td>
                    <td className="px-3 py-1.5 text-ink">{money(y.drawdownValue)}</td>
                    <td className="px-3 py-1.5 text-ink">{money(y.evergreenValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </MoreDetails>
        </>
      )}
    </div>
  );
}

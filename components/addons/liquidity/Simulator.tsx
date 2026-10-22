"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FundCode } from "@/config/addons";
import { quarterlyLimit, termsFor } from "@/lib/addons/liquidity/data";
import { PRESETS, headline, quartersIn, simulateRedemption, type Preset } from "@/lib/addons/liquidity/simulate";
import { FUNDS } from "@/lib/addons/shared/funds";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";
import { NumberInput, PercentInput, SelectFund } from "@/components/addons/shared/Inputs";

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const short = (v: number) => (v >= 1e6 ? `$${+(v / 1e6).toFixed(1)}M` : v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`);
const QUARTERS = 8;

interface Props {
  initialFund?: FundCode;
  initialAmount?: number;
  initialPreset?: Preset["id"];
  /** Small version for the fund-panel drawer: the preset is fixed, amount is the only input, no table. */
  compact?: boolean;
}

/** "What happens to my money": a quarter-by-quarter schedule for one redemption request. Every output is illustrative. */
export default function Simulator({ initialFund = "BCRED", initialAmount = 500_000, initialPreset = "stressed", compact = false }: Props) {
  const [fund, setFund] = useState<FundCode>(initialFund);
  const [amount, setAmount] = useState(initialAmount);
  const [presetId, setPresetId] = useState<Preset["id"]>(initialPreset);
  const [limitPct, setLimitPct] = useState(quarterlyLimit(initialFund)?.value ?? 5);
  const [resubmit, setResubmit] = useState(true);
  const [navChange, setNavChange] = useState(0);
  const [heldShort, setHeldShort] = useState(false);

  const terms = termsFor(fund);
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[1];

  function pickFund(f: FundCode) {
    setFund(f);
    setLimitPct(quarterlyLimit(f)?.value ?? 5);
  }

  const rows = useMemo(
    () =>
      simulateRedemption({
        amount,
        quarters: QUARTERS,
        limitPct,
        requestsPct: preset.requestsVsLimit.map((m) => m * limitPct),
        resubmit,
        navChangePct: navChange,
        earlyDeductionPct: heldShort ? (terms?.earlyDeduction.value ?? 0) : 0,
        earlyDeductionQuarters: quartersIn(terms?.earlyDeduction.heldUnder),
      }),
    [amount, limitPct, preset, resubmit, navChange, heldShort, terms],
  );
  // The table stops once the request is fully paid; the chart keeps all quarters so the shape is comparable.
  const paidBy = rows.findIndex((r) => r.remaining <= 0.5);
  const tableRows = paidBy >= 0 ? rows.slice(0, paidBy + 1) : rows;
  const chart = [{ quarter: 0, cumulative: 0 }, ...rows.map((r) => ({ quarter: r.quarter, cumulative: Math.round(r.cumulativeCash) }))];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {compact ? (
          <p className="text-xs font-medium text-muted-strong">Scenario: {preset.label}</p>
        ) : (
          <div role="group" aria-label="Scenario" className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={p.id === presetId}
                onClick={() => setPresetId(p.id)}
                className={[
                  "tap h-8 rounded-full border px-3 text-xs font-medium transition-colors",
                  p.id === presetId ? "border-accent bg-accent text-accent-contrast" : "border-line bg-bg-raised text-muted-strong hover:text-ink",
                ].join(" ")}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
        <IllustrativeBadge />
      </div>
      <p className="text-xs leading-relaxed text-muted">{preset.note}</p>

      <div className={compact ? "grid gap-3" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
        {!compact && <SelectFund value={fund} onChange={pickFund} />}
        <NumberInput label="Amount asked for" value={amount} onChange={setAmount} min={0} step={10000} prefix="$" />
        {!compact && (
          <>
            <PercentInput label="Fund's quarterly limit" value={limitPct} onChange={setLimitPct} help={quarterlyLimit(fund) ? `${FUNDS[fund].label}'s filed level: ${quarterlyLimit(fund)!.value}${quarterlyLimit(fund)!.unit}. Confirm against current offering documents.` : undefined} />
            <NumberInput label="Fund value change per quarter" value={navChange} onChange={setNavChange} min={-50} max={50} step={0.5} suffix="%" />
            <label className="flex items-center gap-2 self-end text-sm text-muted-strong">
              <input type="checkbox" checked={resubmit} onChange={(e) => setResubmit(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
              Ask again each quarter for the unfilled part
            </label>
            <label className="flex items-center gap-2 self-end text-sm text-muted-strong">
              <input type="checkbox" checked={heldShort} onChange={(e) => setHeldShort(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
              Bought recently ({terms?.earlyDeduction.value}% deduction until held {terms?.earlyDeduction.heldUnder})
            </label>
          </>
        )}
      </div>

      <p className="rounded-card border border-line bg-bg-raised p-4 sm:p-5 font-serif text-lg leading-snug text-ink" aria-live="polite">
        {headline(rows, 6)}
      </p>

      <figure className="space-y-2">
        <div className={compact ? "h-36" : "h-60"} role="img" aria-label={`Cumulative cash received over ${QUARTERS} quarters`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart} margin={{ top: 8, right: 12, bottom: 0, left: compact ? 0 : 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="quarter" tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "var(--border)" }} tickFormatter={(q: number) => (q === 0 ? "Ask" : `Q${q}`)} />
              <YAxis domain={[0, Math.max(amount, 1)]} ticks={[0, 0.25, 0.5, 0.75, 1].map((f) => f * Math.max(amount, 1))} tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={short} width={compact ? 48 : 56} />
              <Tooltip formatter={(v) => money(Number(v))} labelFormatter={(q) => (Number(q) === 0 ? "At request" : `After quarter ${q}`)} contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="stepAfter" dataKey="cumulative" name="Cash received" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <figcaption className="text-xs text-muted">Cumulative cash received. Illustrative: built from the inputs above, not a forecast of any fund&apos;s behavior.</figcaption>
      </figure>

      {!compact && (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="tnum w-full min-w-[560px] text-right text-sm">
            <caption className="sr-only">Quarter-by-quarter schedule</caption>
            <thead className="bg-bg-raised text-[11px] uppercase tracking-[0.08em] text-muted">
              <tr>
                <th scope="col" className="px-3 py-2 text-left font-medium">Quarter</th>
                <th scope="col" className="px-3 py-2 font-medium">Asked for</th>
                <th scope="col" className="px-3 py-2 font-medium">Filled</th>
                <th scope="col" className="px-3 py-2 font-medium">Cash received</th>
                <th scope="col" className="px-3 py-2 font-medium">Total so far</th>
                <th scope="col" className="px-3 py-2 font-medium">Still invested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tableRows.map((r) => (
                <tr key={r.quarter}>
                  <th scope="row" className="px-3 py-2 text-left font-normal text-ink">Q{r.quarter}</th>
                  <td className="px-3 py-2 text-muted-strong">{money(r.requested)}</td>
                  <td className="px-3 py-2 text-muted-strong">{r.requested > 0 ? `${Math.round(r.fillRate * 100)}%` : "—"}</td>
                  <td className="px-3 py-2 text-ink">{money(r.cash)}</td>
                  <td className="px-3 py-2 text-ink">{money(r.cumulativeCash)}</td>
                  <td className="px-3 py-2 text-muted-strong">{money(r.remaining)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-line px-3 py-2 text-xs text-muted">
            {paidBy >= 0 ? `Fully paid after quarter ${rows[paidBy].quarter}.` : `Still partly invested after ${QUARTERS} quarters.`}
          </p>
        </div>
      )}
    </div>
  );
}

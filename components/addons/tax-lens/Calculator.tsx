"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { projectTax } from "@/lib/addons/tax-lens/roc";
import { TAX } from "@/lib/addons/tax-lens/data";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";
import { NumberInput, PercentInput } from "@/components/addons/shared/Inputs";

const money = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
const short = (v: number) => (Math.abs(v) >= 1e6 ? `$${+(v / 1e6).toFixed(1)}M` : Math.abs(v) >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`);
type Cls = "I" | "D" | "S";

/** A capital gains rate to start from, given an income bracket. A rough pairing; the full view lets you set it exactly. */
export function cgRateFor(bracket: number): number {
  if (bracket >= 37) return 20;
  if (bracket >= 22) return 15;
  return 0;
}

/** The personal calculator: inputs on the left, year-by-year results and "tax now vs. later" on the right. Compact = three inputs. */
export default function Calculator({ compact = false }: { compact?: boolean }) {
  const [amount, setAmount] = useState(250_000);
  const [cls, setCls] = useState<Cls>("I");
  const [rate, setRate] = useState(TAX.distributionRates.I.value);
  const [roc, setRoc] = useState(TAX.defaultRoc.value);
  const [bracket, setBracket] = useState(37);
  const [cgRate, setCgRate] = useState<number | null>(null);
  const [state, setState] = useState(0);
  const [years, setYears] = useState(5);
  const [qrd, setQrd] = useState(true);
  const [price, setPrice] = useState(0);
  const cg = cgRate ?? cgRateFor(bracket);

  const r = useMemo(
    () =>
      projectTax({
        invested: amount,
        distributionRatePct: rate,
        rocPct: roc,
        ordinaryRatePct: bracket,
        capitalGainsRatePct: cg,
        stateRatePct: state,
        years,
        qrdDeduction: qrd,
        priceChangePct: price,
      }),
    [amount, rate, roc, bracket, cg, state, years, qrd, price],
  );

  function pickClass(c: Cls) {
    setCls(c);
    setRate(TAX.distributionRates[c].value);
  }

  const bars = [
    { name: "Tax on payouts, as received", value: Math.round(r.totalTaxNow), kind: "now" },
    { name: "Tax at sale", value: Math.round(r.taxOnSale), kind: "later" },
    { name: "If every payout were taxed as income", value: Math.round(r.taxIfAllTaxedNow), kind: "compare" },
  ];

  return (
    <div className={compact ? "space-y-5" : "grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]"}>
      <div className="space-y-4">
        <NumberInput label="Amount invested" value={amount} onChange={setAmount} min={0} step={10000} prefix="$" />
        <PercentInput
          label="Federal income tax bracket"
          value={bracket}
          onChange={setBracket}
          help={compact ? `Capital gains rate assumed: ${cg}%. Set it exactly in the full view.` : undefined}
        />
        <NumberInput label="Years held" value={years} onChange={(v) => setYears(Math.round(v))} min={0} max={30} step={1} />
        {!compact && (
          <>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-strong">Share class (sets the payout rate)</p>
              <div role="group" aria-label="Share class" className="flex gap-2">
                {(["I", "D", "S"] as Cls[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={c === cls}
                    onClick={() => pickClass(c)}
                    className={[
                      "h-8 rounded-full border px-3 text-xs font-medium",
                      c === cls ? "border-accent bg-accent text-accent-contrast" : "border-line bg-bg-raised text-muted-strong hover:text-ink",
                    ].join(" ")}
                  >
                    Class {c}
                  </button>
                ))}
              </div>
            </div>
            <PercentInput
              label="Payout rate, per year"
              value={rate}
              onChange={setRate}
              help={`Class ${cls}'s average annualized distribution rate, Q2 2026 10-Q. ${TAX.distributionRates[cls].verify}.`}
            />
            <div className="space-y-1.5">
              <PercentInput label="Share that is return of capital" value={roc} onChange={setRoc} help={`Default: ${TAX.defaultRoc.value}%, BREIT's 2025 figure. It changes every year.`} />
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Use a past year's split">
                {TAX.rocHistory.slice(0, 4).map((y) => (
                  <button
                    key={y.year}
                    type="button"
                    onClick={() => setRoc(y.roc)}
                    aria-pressed={roc === y.roc}
                    className="h-7 rounded-full border border-line px-2.5 text-[11px] text-muted-strong hover:text-ink aria-pressed:border-accent aria-pressed:text-ink"
                  >
                    {y.year}: {y.roc}%
                  </button>
                ))}
              </div>
            </div>
            <PercentInput label="Long-term capital gains rate" value={cg} onChange={setCgRate} />
            <PercentInput label="State income tax rate" value={state} onChange={setState} />
            <NumberInput label="Share price change per year" value={price} onChange={setPrice} min={-50} max={50} step={0.5} suffix="%" help="0 means sold at the price paid." />
            <label className="flex items-start gap-2 text-sm text-muted-strong">
              <input type="checkbox" checked={qrd} onChange={(e) => setQrd(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
              <span>
                Apply the 20% deduction for qualified REIT dividends (Section 199A) to the taxable part.{" "}
                <a href={TAX.irs.qbi.url} target="_blank" rel="noreferrer noopener" className="underline decoration-line underline-offset-2 hover:text-ink">
                  IRS
                </a>
              </span>
            </label>
          </>
        )}
      </div>

      <div className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-strong">Consult a tax advisor. This is general education, not tax advice.</p>
          <IllustrativeBadge />
        </div>
        <p className="rounded-card border border-line bg-bg-raised p-4 font-serif text-lg leading-snug text-ink" aria-live="polite">
          Over {years} year{years === 1 ? "" : "s"}, about {money(r.totalTaxNow)} of tax is due as payouts arrive and about {money(r.taxOnSale)} at sale, against{" "}
          {money(r.taxIfAllTaxedNow)} if every payout were taxed as income.
        </p>

        <figure className="space-y-2">
          <div className={compact ? "h-40" : "h-48"} role="img" aria-label={bars.map((b) => `${b.name}: ${money(b.value)}`).join("; ")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} layout="vertical" margin={{ top: 0, right: 64, bottom: 0, left: 0 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" tickFormatter={short} tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                <YAxis type="category" dataKey="name" width={compact ? 130 : 190} tick={{ fill: "var(--muted-strong)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Bar dataKey="value" isAnimationActive={false} radius={2}>
                  {bars.map((b) => (
                    <Cell key={b.name} fill={b.kind === "compare" ? "var(--muted)" : "var(--accent)"} fillOpacity={b.kind === "later" ? 0.6 : 1} />
                  ))}
                  <LabelList dataKey="value" position="right" formatter={(v) => money(Number(v))} style={{ fill: "var(--text)", fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <figcaption className="text-[11px] text-muted">
            Tax now vs. tax later. The comparison bar taxes every payout at the income rate as received. Ignores the 3.8% net investment income tax and
            assumes payouts are taken in cash.
          </figcaption>
        </figure>

        {r.notes.length > 0 && (
          <ul className="space-y-1 text-xs text-muted-strong">
            {r.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}

        {!compact && (
          <div className="overflow-x-auto rounded-card border border-line">
            <table className="tnum w-full min-w-[640px] text-right text-sm">
              <caption className="sr-only">Year-by-year tax on payouts</caption>
              <thead className="bg-bg-raised text-[11px] uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Year</th>
                  <th scope="col" className="px-3 py-2 font-medium">Cash received</th>
                  <th scope="col" className="px-3 py-2 font-medium">Taxable now</th>
                  <th scope="col" className="px-3 py-2 font-medium">Lowers basis</th>
                  <th scope="col" className="px-3 py-2 font-medium">Tax now</th>
                  <th scope="col" className="px-3 py-2 font-medium">After tax</th>
                  <th scope="col" className="px-3 py-2 font-medium">Basis at end</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {r.rows.map((y) => (
                  <tr key={y.year}>
                    <th scope="row" className="px-3 py-2 text-left font-normal text-ink">{y.year}</th>
                    <td className="px-3 py-2 text-ink">{money(y.cash)}</td>
                    <td className="px-3 py-2 text-muted-strong">{money(y.taxable + y.excessGain)}</td>
                    <td className="px-3 py-2 text-muted-strong">{money(y.roc - y.excessGain)}</td>
                    <td className="px-3 py-2 text-ink">{money(y.taxNow)}</td>
                    <td className="px-3 py-2 text-ink">{money(y.afterTaxCash)}</td>
                    <td className="px-3 py-2 text-muted-strong">{money(y.basisEnd)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-line bg-bg-raised text-sm">
                <tr>
                  <th scope="row" className="px-3 py-2 text-left font-medium text-ink">At sale</th>
                  <td colSpan={3} className="px-3 py-2 text-muted-strong">
                    Sold for {money(r.saleValue)} · gain {money(r.gainOnSale)}
                  </td>
                  <td className="px-3 py-2 text-ink">{money(r.taxOnSale)}</td>
                  <td colSpan={2} className="px-3 py-2 text-ink">
                    Total after tax: {money(r.afterTaxTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

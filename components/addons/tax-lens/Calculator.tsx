"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { projectTax } from "@/lib/addons/tax-lens/roc";
import { stateRate } from "@/lib/addons/tax-lens/states";
import { RatesUsed, StatePicker, StateSource } from "./StatePicker";
import { useClient } from "@/components/useClient";
import { TAX } from "@/lib/addons/tax-lens/data";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";
import { NumberInput, PercentInput } from "@/components/addons/shared/Inputs";
import MoreDetails from "@/components/addons/shared/MoreDetails";
import { PrintSized } from "@/components/addons/shared/PrintSized";
import { useMediaQuery } from "@/components/useMediaQuery";

const money = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
// Axis ticks can fall on half-thousands ($4.5k), so keep one decimal rather than round them to a different number.
const short = (v: number) => (Math.abs(v) >= 1e6 ? `$${+(v / 1e6).toFixed(1)}M` : Math.abs(v) >= 1000 ? `$${+(v / 1000).toFixed(1)}k` : `$${Math.round(v)}`);
type Cls = "I" | "D" | "S";

/** A capital gains rate to start from, given an income bracket. A rough pairing; the full view lets you set it exactly. */
export function cgRateFor(bracket: number): number {
  if (bracket >= 37) return 20;
  if (bracket >= 22) return 15;
  return 0;
}

/** The personal calculator: inputs on the left, year-by-year results and "tax now vs. later" on the right. Compact = three inputs. */
export default function Calculator({ compact = false }: { compact?: boolean }) {
  // Amount, federal bracket and state are the shared client's (the header's Client button): set in one place.
  const [client, updateClient] = useClient();
  const amount = client.amount;
  const setAmount = (v: number) => updateClient({ amount: v });
  const [cls, setCls] = useState<Cls>("I");
  const narrow = useMediaQuery("(max-width: 420px)");
  const [rate, setRate] = useState(TAX.distributionRates.I.value);
  const [roc, setRocOnly] = useState(TAX.defaultRoc.value);
  // Share of the payout classified as capital gains: set by the past-year buttons, cleared when the ROC share is typed.
  const [cgShare, setCgShare] = useState(0);
  const setRoc = (v: number) => {
    setRocOnly(v);
    setCgShare(0);
  };
  const bracket = client.bracket;
  const setBracket = (v: number) => updateClient({ bracket: v });
  const [cgRate, setCgRate] = useState<number | null>(null);
  // The client's state sets the state rate; typing a rate overrides it until another state is picked.
  const stateCode = client.state;
  const setStateCodeShared = (state: string) => updateClient({ state });
  const [stateTyped, setStateTyped] = useState<number | null>(null);
  const setStateCode = (c: string) => {
    setStateCodeShared(c);
    setStateTyped(null);
  };
  const place = stateRate(stateCode);
  const state = stateTyped ?? place.top;
  const [niit, setNiit] = useState(true);
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
        capitalGainsSharePct: cgShare,
        ordinaryRatePct: bracket,
        capitalGainsRatePct: cg,
        stateRatePct: state,
        niit,
        years,
        qrdDeduction: qrd,
        priceChangePct: price,
      }),
    [amount, rate, roc, cgShare, bracket, cg, state, niit, years, qrd, price],
  );

  function pickClass(c: Cls) {
    setCls(c);
    setRate(TAX.distributionRates[c].value);
  }

  const bars = [
    { name: "Tax on payouts, as received", label: "Tax now", value: Math.round(r.totalTaxNow), kind: "now" },
    { name: "Tax at sale", label: "Tax at sale", value: Math.round(r.taxOnSale), kind: "later" },
    { name: "If every payout were taxed as income", label: "All as income", value: Math.round(r.taxIfAllTaxedNow), kind: "compare" },
  ];

  // On paper, a long holding period shows the first five years and the last, so the page stays one sheet.
  const printRows = r.rows.length > 9 ? [...r.rows.slice(0, 5), ...r.rows.slice(-1)] : r.rows;
  const yearTable = (rows: typeof r.rows) => (
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
                {rows.map((y, i) => (
                  <tr key={y.year} className={rows !== r.rows && i === rows.length - 1 ? "border-t-2" : undefined}>
                    <th scope="row" className="px-3 py-2 text-left font-normal text-ink">{y.year}</th>
                    <td className="px-3 py-2 text-ink">{money(y.cash)}</td>
                    <td className="px-3 py-2 text-muted-strong">{money(y.taxable + y.capitalGainDist + y.excessGain)}</td>
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
  );

  return (
    <div className={compact ? "space-y-5" : "grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] print:block"}>
      <div className="space-y-4 print:hidden">
        <NumberInput label="Amount invested" value={amount} onChange={setAmount} min={0} step={10000} prefix="$" />
        <PercentInput
          label="Federal income tax bracket"
          value={bracket}
          onChange={setBracket}
          help={
            compact
              ? `Capital gains rate assumed: ${cg}%, plus the 3.8% net investment income tax. Set them in the full view.`
              : "For 2026 the top bracket, 37%, starts at $768,700 of joint taxable income (IRS, 2026 inflation adjustments)."
          }
        />
        <StatePicker code={stateCode} onChange={setStateCode} compact={compact} />
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
                      "tap h-8 rounded-full border px-3 text-xs font-medium",
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
              <PercentInput
                label="Share that is return of capital"
                value={roc}
                onChange={setRoc}
                help={`Default: ${TAX.defaultRoc.value}%, BREIT's 2025 figure. It changes every year. The rest: ${+cgShare.toFixed(2)}% capital gains, ${+Math.max(0, 100 - roc - cgShare).toFixed(2)}% ordinary dividend.`}
              />
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Use a past year's split">
                {TAX.rocHistory.slice(0, 4).map((y) => (
                  <button
                    key={y.year}
                    type="button"
                    onClick={() => {
                      setRocOnly(y.roc);
                      setCgShare(y.capitalGains);
                    }}
                    aria-pressed={roc === y.roc}
                    className="tap h-7 rounded-full border border-line px-2.5 text-xs text-muted-strong hover:text-ink aria-pressed:border-accent aria-pressed:text-ink"
                  >
                    {y.year}: {y.roc}%
                  </button>
                ))}
              </div>
            </div>
            <PercentInput label="Long-term capital gains rate" value={cg} onChange={setCgRate} />
            <PercentInput
              label="State income tax rate"
              value={state}
              onChange={setStateTyped}
              help={stateTyped === null ? `${place.name}'s top rate. Type the client's own rate if it's lower.` : `Typed in. Pick a state to use its top rate again.`}
            />
            <label className="flex items-start gap-2 text-sm text-muted-strong">
              <input type="checkbox" checked={niit} onChange={(e) => setNiit(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
              <span>
                Add the 3.8% net investment income tax on payouts and gains (applies above $250,000 of joint income).{" "}
                <a href={TAX.irs.niit.url} target="_blank" rel="noreferrer noopener" className="underline decoration-line underline-offset-2 hover:text-ink">
                  IRS
                </a>
              </span>
            </label>
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

      <div className="min-w-0 space-y-5 print:space-y-3">
        <p className="hidden text-xs print:block">
          Inputs: {money(amount)} invested, Class {cls}, {rate}% payout, {roc}% return of capital, {bracket}% federal income bracket{qrd ? " (199A deduction applied)" : ""},{" "}
          {cg}% federal capital gains, {niit ? "3.8% net investment income tax, " : ""}
          {state}% state ({place.name}), {years} years, {price}% price change per year.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-strong">Consult a tax advisor. This is general education, not tax advice.</p>
          <IllustrativeBadge />
        </div>
        <p className="rounded-card border border-line bg-bg-raised p-4 sm:p-5 font-serif text-lg leading-snug text-ink" aria-live="polite">
          Over {years} year{years === 1 ? "" : "s"}, about {money(r.totalTaxNow)} of tax is due as payouts arrive and about {money(r.taxOnSale)} at sale, against{" "}
          {money(r.taxIfAllTaxedNow)} if every payout were taxed as income.
        </p>
        <RatesUsed p={{ ordinaryRatePct: bracket, capitalGainsRatePct: cg, stateRatePct: state, niit, qrdDeduction: qrd }} stateName={place.name} />
        {/* The full view shows the state's source under its picker; the drawer shows it here. */}
        {compact && <StateSource code={place.code} />}

        <figure className="space-y-2">
          <div className={compact ? "h-40" : "h-48"} role="img" aria-label={bars.map((b) => `${b.name}: ${money(b.value)}`).join("; ")}>
            <PrintSized height={192} off={compact}>
              <BarChart accessibilityLayer={false} data={bars} layout="vertical" margin={{ top: 0, right: 64, bottom: 0, left: 0 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" tickFormatter={short} tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                {/* Small phones get short labels, so the bars keep most of the width. */}
                <YAxis type="category" dataKey={narrow ? "label" : "name"} width={narrow ? 84 : compact ? 130 : 190} tick={{ fill: "var(--muted-strong)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Bar dataKey="value" isAnimationActive={false} radius={2} activeBar={false} minPointSize={2}>
                  {bars.map((b) => (
                    <Cell key={b.name} fill={b.kind === "compare" ? "var(--muted)" : "var(--accent)"} fillOpacity={b.kind === "later" ? 0.6 : 1} />
                  ))}
                  <LabelList dataKey="value" position="right" formatter={(v) => money(Number(v))} style={{ fill: "var(--text)", fontSize: 11 }} />
                </Bar>
              </BarChart>
            </PrintSized>
          </div>
          <figcaption className="text-xs text-muted">
            Tax now vs. tax later: federal, {niit ? "the net investment income tax and " : ""}state tax at the rates above. The comparison bar taxes every
            payout at the income rate as received. Leaves out local income taxes and the federal deduction for state taxes, and assumes payouts are taken
            in cash.
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
          <>
            <MoreDetails summary="Year by year" hint="Cash, tax now and cost basis each year, then the sale">
              {yearTable(r.rows)}
            </MoreDetails>
            <div className="hidden print:block">
              {yearTable(printRows)}
              {printRows !== r.rows && <p className="mt-1 text-[10px]">Years 6 to {r.rows.length - 1} are left out here; the page shows every year.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { combinedRates, projectTax } from "@/lib/addons/tax-lens/roc";
import { stateRate } from "@/lib/addons/tax-lens/states";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";
import BasisBars from "./BasisBars";
import { RatesUsed, StatePicker } from "./StatePicker";
import { useClientState } from "./useClientState";

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const pct = (n: number) => `${+n.toFixed(2)}%`;
/** Round numbers at the top federal rates (37% income, 20% capital gains) plus the 3.8% NIIT; the state comes from the picker. */
export const EXAMPLE = { invested: 100_000, distributionRatePct: 5, rocPct: 80, ordinaryRatePct: 37, capitalGainsRatePct: 20, stateRatePct: 0, niit: true, years: 5, qrdDeduction: false };

/** A general walk-through with round numbers: $100,000, a 5% payout, 80% of it return of capital, sold after five years at the price paid. */
export default function WorkedExample() {
  const [code, setCode] = useClientState();
  const place = stateRate(code);
  const params = { ...EXAMPLE, stateRatePct: place.top };
  const r = projectTax(params);
  const rates = combinedRates(params);
  const y = r.rows[0];
  const last = r.rows.at(-1)!;
  const steps = [
    { value: money(y.cash), label: "Paid in year one", note: "$100,000 at a 5% payout" },
    { value: money(y.taxNow), label: "Taxed now", note: `Only the 20% that's a dividend (${money(y.taxable)}), at ${pct(rates.income)}: federal, NIIT and ${place.name}` },
    { value: money(y.roc), label: "Not taxed now", note: `Return of capital: lowers cost basis to ${money(y.basisEnd)}` },
    { value: money(r.taxOnSale), label: "Taxed at sale, year five", note: `${pct(rates.gains)} on the ${money(r.gainOnSale)} gain: federal capital gains, NIIT and ${place.name}` },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-3">
        <ol className="grid gap-3 sm:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.label} className="flex flex-col gap-2 rounded-card border border-line bg-bg-raised p-4 sm:p-5">
              <span aria-hidden className="tnum flex h-6 w-6 items-center justify-center rounded-full border border-line text-[11px] text-muted-strong">
                {i + 1}
              </span>
              <span className="tnum font-serif text-[30px] leading-none text-ink">{s.value}</span>
              <span className="text-sm font-medium text-ink">{s.label}</span>
              <span className="text-xs leading-relaxed text-muted-strong">{s.note}</span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-ink">
          The tax isn&apos;t avoided. It&apos;s <strong className="font-semibold">delayed</strong>, and charged at the capital gains rate instead of the income rate. Basis after five
          years: {money(last.basisEnd)}.
        </p>
        <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-start">
          <StatePicker code={place.code} onChange={setCode} />
          <RatesUsed p={params} stateName={place.name} />
        </div>
      </div>
      <div className="space-y-3 rounded-card border border-line bg-bg-raised p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">Cost basis, year by year</p>
          <IllustrativeBadge />
        </div>
        <BasisBars invested={EXAMPLE.invested} rows={r.rows} />
      </div>
    </div>
  );
}

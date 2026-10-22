import { projectTax } from "@/lib/addons/tax-lens/roc";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";
import BasisBars from "./BasisBars";

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
export const EXAMPLE = { invested: 100_000, distributionRatePct: 5, rocPct: 80, ordinaryRatePct: 37, capitalGainsRatePct: 20, stateRatePct: 0, years: 5, qrdDeduction: false };

/** A general walk-through with round numbers: $100,000, a 5% payout, 80% of it return of capital, sold after five years at the price paid. */
export default function WorkedExample() {
  const r = projectTax(EXAMPLE);
  const y = r.rows[0];
  const last = r.rows.at(-1)!;
  const steps = [
    { value: money(y.cash), label: "Paid in year one", note: "$100,000 at a 5% payout" },
    { value: money(y.taxNow), label: "Taxed now", note: `Only the 20% that's a dividend (${money(y.taxable)}), at a 37% bracket` },
    { value: money(y.roc), label: "Not taxed now", note: `Return of capital: lowers cost basis to ${money(y.basisEnd)}` },
    { value: money(r.taxOnSale), label: "Taxed at sale, year five", note: `20% capital gains rate on the ${money(r.gainOnSale)} gain` },
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

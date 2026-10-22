import { projectTax } from "@/lib/addons/tax-lens/roc";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";
import BasisBars from "./BasisBars";

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
export const EXAMPLE = { invested: 100_000, distributionRatePct: 5, rocPct: 80, ordinaryRatePct: 37, capitalGainsRatePct: 20, stateRatePct: 0, years: 5, qrdDeduction: false };

/** A general walk-through with round numbers: $100,000, a 5% payout, 80% of it return of capital, sold after five years at the price paid. */
export default function WorkedExample() {
  const r = projectTax(EXAMPLE);
  const y = r.rows[0];
  const steps = [
    { title: "The payout", body: `$100,000 invested at a 5% payout rate pays ${money(y.cash)} in the first year.` },
    {
      title: "The part taxed now",
      body: `If 20% of it is an ordinary dividend, ${money(y.taxable)} is taxable this year. At a 37% bracket that's ${money(y.taxNow)}, leaving ${money(y.afterTaxCash)} after tax.`,
    },
    {
      title: "The part that lowers basis",
      body: `The other ${money(y.roc)} is return of capital. It isn't taxed when it arrives; instead the shares' cost basis drops from $100,000 to ${money(y.basisEnd)}. After five years it's ${money(r.rows.at(-1)!.basisEnd)}.`,
    },
    {
      title: "What happens at sale",
      body: `Sold after five years at the price paid, the gain is the $100,000 received minus the ${money(r.rows.at(-1)!.basisEnd)} basis: ${money(r.gainOnSale)}. At a 20% long-term capital gains rate, that's ${money(r.taxOnSale)} due then. The tax wasn't avoided; it was delayed, and charged at the capital gains rate instead of the income rate.`,
    },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-card border border-line bg-bg-raised p-4">
            <p className="text-sm font-medium text-ink">
              <span className="tnum mr-2 text-muted">{i + 1}</span>
              {s.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-strong">{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="space-y-3 rounded-card border border-line bg-bg-raised p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">Cost basis, year by year</p>
          <IllustrativeBadge />
        </div>
        <BasisBars invested={EXAMPLE.invested} rows={r.rows} />
      </div>
    </div>
  );
}
